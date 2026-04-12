import prisma from "@/lib/prisma";
import { autoGradeAttempt } from "./grading.service.js";

/**
 * Service to handle student exam attempts.
 */

export async function getAvailableExams(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, batchId: true, collegeId: true }
  });

  if (!user) throw new Error("User not found");

  const now = new Date();

  // Find exams where:
  // Status is not DRAFT (includes PUBLISHED, ACTIVE, COMPLETED)
  const exams = await prisma.exam.findMany({
    where: {
      collegeId: user.collegeId,
      status: { in: ['PUBLISHED', 'ACTIVE', 'COMPLETED'] },
      AND: [
        {
          access: {
            some: {
              OR: [
                { batchId: user.batchId },
                { branchId: user.branchId, batchId: null },
                { branchId: null, batchId: null }
              ]
            }
          }
        }
      ]
    },
    include: {
      subject: true,
      attempts: {
        where: { userId },
        select: { id: true, status: true, score: true }
      }
    }
  });

  return exams;
}

export async function startAttempt(userId, examId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if exam exists and is active/ready
    const exam = await tx.exam.findUnique({
      where: { id: examId },
      include: {
        access: true
      }
    });

    if (!exam) throw new Error("Exam not found");

    const now = new Date();

    // JIT Activation & Window Enforcement
    let currentStatus = exam.status;
    if (currentStatus === 'PUBLISHED') {
        const isStarted = exam.startTime ? now >= exam.startTime : true;
        const isEnded = exam.endTime ? now > exam.endTime : false;

        if (isStarted && !isEnded) {
            // Auto-activate the exam
            await tx.exam.update({
                where: { id: examId },
                data: { status: 'ACTIVE' }
            });
            currentStatus = 'ACTIVE';
        } else if (!isStarted) {
            throw new Error("This assessment has not started yet.");
        } else if (isEnded) {
            throw new Error("The assessment window has closed.");
        }
    }

    if (currentStatus !== 'ACTIVE') throw new Error("Exam is not active");

    // Check if window is closed for already ACTIVE exams too (for safety)
    if (exam.endTime && now > exam.endTime) {
        throw new Error("The assessment window has closed.");
    }

    // 2. Check if student is in the allowed branch/batch
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { branchId: true, batchId: true }
    });

    const hasAccess = exam.access.some(acc => 
      (acc.branchId === user.branchId && acc.batchId === null) || 
      (acc.batchId === user.batchId)
    );

    if (!hasAccess) throw new Error("You are not authorized for this assessment");

    // 3. Check for existing attempt
    const existing = await tx.attempt.findUnique({
      where: { userId_examId: { userId, examId } }
    });

    if (existing) {
      if (existing.status !== 'IN_PROGRESS') {
        throw new Error("You have already completed this assessment.");
      }
      return existing; // Resume if in progress
    }

    // 4. Create new attempt
    const expiresAt = new Date(Date.now() + exam.duration * 60 * 1000);
    
    return tx.attempt.create({
      data: {
        userId,
        examId,
        expiresAt,
        status: 'IN_PROGRESS'
      }
    });
  });
}

export async function syncAnswers(userId, attemptId, answers) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { expiresAt: true, status: true, userId: true }
  });

  if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found");
  if (attempt.status !== 'IN_PROGRESS') throw new Error("Attempt is already finalized");

  // Server-side time check
  if (new Date() > attempt.expiresAt) {
      // Force submit if expired
      await submitAttempt(userId, attemptId);
      throw new Error("Time expired. Assessment has been automatically submitted.");
  }

  for (const ans of answers) {
      const existing = await prisma.answer.findFirst({
         where: { attemptId, questionId: ans.questionId }
      });

      if (existing) {
          await prisma.answer.update({
             where: { id: existing.id },
             data: {
                 selectedOptions: ans.selectedOptions || [],
                 subjectiveText: ans.subjectiveText || null
             }
          });
      } else {
          await prisma.answer.create({
             data: {
                 attemptId,
                 questionId: ans.questionId,
                 selectedOptions: ans.selectedOptions || [],
                 subjectiveText: ans.subjectiveText || null
             }
          });
      }
  }

  return { success: true };
}

export async function submitAttempt(userId, attemptId) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found");
  if (attempt.status === 'SUBMITTED' || attempt.status === 'CHEATED') return attempt;

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });

  // Trigger auto-grading
  await autoGradeAttempt(attemptId);
  return updated;
}

/**
 * Handle proctoring events and enforcement (e.g. FullScreen Exits)
 */
export async function logProctorEvent(userId, attemptId, event, metadata = {}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, flagCount: true, status: true }
  });

  if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found");
  if (attempt.status !== 'IN_PROGRESS') return { status: attempt.status, flagCount: attempt.flagCount };

  const isViolation = ['FULLSCREEN_EXIT', 'TAB_SWITCH', 'MULTIPLE_DISPLAY_DETECTED'].includes(event);
  const newFlagCount = isViolation ? attempt.flagCount + 1 : attempt.flagCount;
  
  // Rule: 4 strikes and you're out
  const shouldTerminate = newFlagCount >= 4;
  const newStatus = shouldTerminate ? 'CHEATED' : 'IN_PROGRESS';

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      flagCount: newFlagCount,
      status: newStatus,
      submittedAt: shouldTerminate ? new Date() : null,
      logs: {
        create: {
          event,
          metadata: {
            ...metadata,
            strike: isViolation ? newFlagCount : undefined
          }
        }
      }
    }
  });

  // If terminated, trigger auto-grading for whatever progress they made
  if (shouldTerminate) {
    await autoGradeAttempt(attemptId);
  }

  return {
    status: updated.status,
    flagCount: updated.flagCount,
    wasTerminated: shouldTerminate
  };
}