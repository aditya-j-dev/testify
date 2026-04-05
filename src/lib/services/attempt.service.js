import prisma from "@/lib/prisma";

/**
 * Service to handle student exam attempts.
 */

export async function getAvailableExams(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { branchId: true, batchId: true, collegeId: true }
  });

  if (!user) throw new Error("User not found");

  // Find exams where:
  // 1. Status is ACTIVE
  // 2. Access matches student's branch OR batch OR both
  const exams = await prisma.exam.findMany({
    where: {
      collegeId: user.collegeId,
      status: 'ACTIVE',
      access: {
        some: {
          OR: [
            { branchId: user.branchId, batchId: null }, // Entire branch
            { batchId: user.batchId } // Specific batch
          ]
        }
      }
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
    // 1. Check if exam exists and is active
    const exam = await tx.exam.findUnique({
      where: { id: examId },
      include: {
        access: true
      }
    });

    if (!exam || exam.status !== 'ACTIVE') throw new Error("Exam is not active");

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

    if (existing) return existing; // Resume if exists

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

  // Batch Upsert
  const operations = answers.map(ans => {
    const data = {
      attemptId,
      questionId: ans.questionId,
      selectedOptions: ans.selectedOptions || [],
      subjectiveText: ans.subjectiveText || null
    };

    return prisma.answer.upsert({
      where: {
        // We'll need a unique constraint on attemptId + questionId
        id: ans.id || 'new-answer' // Ideally the client tracks IDs once created
      },
      update: data,
      create: data
    });
  });

  // Note: Standard prisma.answer.upsert requires a unique ID.
  // Better approach: use attemptId_questionId unique index if it exists,
  // or manually check and update/create.
  
  // Since we haven't added the unique index of [attemptId, questionId] in schema yet,
  // let's do it right. I'll update the schema in next step.
  // For now, I'll use a loop-based implementation or a custom logic.
  
  for (const ans of answers) {
      await prisma.answer.upsert({
          where: {
              id: `${attemptId}_${ans.questionId}` // Using a deterministic ID trick if index is missing
          },
          update: {
              selectedOptions: ans.selectedOptions || [],
              subjectiveText: ans.subjectiveText || null
          },
          create: {
              id: `${attemptId}_${ans.questionId}`,
              attemptId,
              questionId: ans.questionId,
              selectedOptions: ans.selectedOptions || [],
              subjectiveText: ans.subjectiveText || null
          }
      });
  }

  return { success: true };
}

export async function submitAttempt(userId, attemptId) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt || attempt.userId !== userId) throw new Error("Attempt not found");
  if (attempt.status === 'COMPLETED') return attempt;

  return prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: 'COMPLETED',
      submittedAt: new Date()
    }
  });
}