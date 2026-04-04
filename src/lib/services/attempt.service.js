import prisma from "../prisma.js";

// --- Attempt Initialization ---
export async function startAttempt(studentId, examId) {
  // Check exam exists and is active
  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  });

  if (!exam) throw new Error("Exam not found");
  if (exam.status !== "PUBLISHED" && exam.status !== "ACTIVE") {
    throw new Error("Exam is not currently active");
  }

  // Check if already attempted
  const existingAttempt = await prisma.attempt.findUnique({
    where: { userId_examId: { userId: studentId, examId } }
  });

  if (existingAttempt) {
    if (existingAttempt.status === "IN_PROGRESS") {
      return existingAttempt; // Resuming
    }
    throw new Error("You have already completed this exam");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + exam.duration * 60000);

  // Auto-activate the exam if it was just published
  if (exam.status === "PUBLISHED") {
    await prisma.exam.update({ where: { id: examId }, data: { status: "ACTIVE" } });
  }

  // Create attempt
  return prisma.attempt.create({
    data: {
      userId: studentId,
      examId,
      status: "IN_PROGRESS",
      startedAt: now,
      expiresAt: expiresAt,
    }
  });
}

// --- Auto-Save Sync Engine ---
export async function saveAnswerSync(studentId, attemptId, data) {
  const { questionId, selectedOptions, subjectiveText, clientSavedAt } = data;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.userId !== studentId) throw new Error("Unauthorized");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt already closed");

  const clientTime = new Date(clientSavedAt);
  const serverTime = new Date();

  // Anti-cheat verification
  let syncStatus = "SYNCED";
  let rejectionReason = null;

  if (clientTime < attempt.startedAt) {
    syncStatus = "CONFLICT";
    rejectionReason = "TIMESTAMP_BEFORE_START";
  } else if (clientTime > attempt.expiresAt || serverTime > new Date(attempt.expiresAt.getTime() + 60000)) { // 1 min grace period for server transit
    syncStatus = "CONFLICT";
    rejectionReason = "ATTEMPT_EXPIRED";
  }

  const answer = await prisma.answer.upsert({
    where: {
      attemptId_questionId: { attemptId, questionId }
    },
    update: {
      selectedOptions: selectedOptions || [],
      subjectiveText: subjectiveText || null,
      clientSavedAt: clientTime,
      serverSavedAt: serverTime,
      syncStatus: syncStatus,
      syncRetryCount: { increment: 1 }
    },
    create: {
      attemptId,
      questionId,
      selectedOptions: selectedOptions || [],
      subjectiveText: subjectiveText || null,
      clientSavedAt: clientTime,
      serverSavedAt: serverTime,
      syncStatus: syncStatus
    }
  });

  // Track history for audit
  await prisma.answerHistory.create({
    data: {
      answerId: answer.id,
      selectedOptions: selectedOptions || [],
      subjectiveText: subjectiveText || null,
      clientSavedAt: clientTime,
      serverReceivedAt: serverTime,
      wasRejected: syncStatus === "CONFLICT",
      rejectionReason: rejectionReason,
      source: "BACKGROUND_SYNC"
    }
  });

  if (syncStatus === "CONFLICT") {
    throw new Error(`Sync rejected: ${rejectionReason}`);
  }

  return answer;
}

// --- Final Submission ---
export async function submitAttempt(studentId, attemptId) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { include: { questions: true } },
      answers: true
    }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.userId !== studentId) throw new Error("Unauthorized");
  if (attempt.status !== "IN_PROGRESS") throw new Error("Attempt already submitted");

  // We rely on background sync for answers, so we just calculate the score here for MCQ
  let score = 0;
  
  // Grade MCQs instantly against the immutable Exam snapshots
  const updates = attempt.answers.map(answer => {
    const examQuestion = attempt.exam.questions.find(eq => eq.questionId === answer.questionId);
    if (!examQuestion) return null;

    let isCorrect = null;
    let marksObtained = null;

    // Strict array equality for correct options (assuming sorted or single choice)
    const optionsSelected = answer.selectedOptions.slice().sort();
    const optionsCorrect = examQuestion.correctAnswersSnapshot.slice().sort();
    
    if (optionsCorrect.length > 0 && JSON.stringify(optionsSelected) === JSON.stringify(optionsCorrect)) {
       isCorrect = true;
       marksObtained = examQuestion.marks;
       score += marksObtained;
    } else if (optionsCorrect.length > 0) {
       isCorrect = false;
       marksObtained = 0;
    }

    return prisma.answer.update({
      where: { id: answer.id },
      data: {
        isCorrect,
        marksObtained,
        finalSubmitReconciled: true
      }
    });
  }).filter(Boolean);

  // Execute grading
  await prisma.$transaction(updates);

  // Close attempt
  const updatedAttempt = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      score,
      status: "SUBMITTED",
      submittedAt: new Date()
    }
  });

  // Calculate Result overall (without waiting for teacher override on subjective)
  await prisma.result.create({
    data: {
      attemptId: attemptId,
      studentId: studentId,
      examId: attempt.examId,
      totalMarksObtained: score,
      percentage: (score / attempt.exam.totalMarks) * 100,
      isPassed: attempt.exam.passingMarks ? score >= attempt.exam.passingMarks : null,
      gradingStatus: attempt.answers.some(a => a.subjectiveText) ? "MANUAL_REVIEW_PENDING" : "AUTO_GRADED"
    }
  });

  return updatedAttempt;
}

// --- Proctoring Engine ---
export async function logProctorEvent(studentId, attemptId, eventName, metadata = null) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.userId !== studentId) throw new Error("Unauthorized");

  // Determine if this is a flaggable offense
  let incrementFlag = false;
  const flaggableEvents = ["TAB_SWITCH", "COPY", "PASTE", "RIGHT_CLICK", "DEVTOOLS_OPEN", "FULLSCREEN_EXIT"];
  if (flaggableEvents.includes(eventName)) {
     incrementFlag = true;
  }

  const log = await prisma.proctorLog.create({
    data: {
      attemptId,
      event: eventName,
      metadata: metadata ? metadata : undefined
    }
  });

  // If malicious, increase the flag suspicion score on the Attempt
  if (incrementFlag) {
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { flagCount: { increment: 1 } }
    });
  }

  return log;
}