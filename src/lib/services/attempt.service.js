import prisma from "@/lib/prisma.js";

export async function startAttemptService(studentId, examId) {

  // Check exam exists
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
      isActive: true
    }
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  // Check if already attempted
  const existingAttempt = await prisma.attempt.findUnique({
    where: {
      studentId_examId: {
        studentId,
        examId
      }
    }
  });

  if (existingAttempt) {
    throw new Error("You have already attempted this exam");
  }

  // Create attempt
  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      examId,
      status: "IN_PROGRESS"
    }
  });

  return attempt;
}

export async function saveAnswerService(studentId, data) {

  const { attemptId, questionId, optionId } = data;

  // Verify attempt belongs to student
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId }
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.studentId !== studentId) {
    throw new Error("Unauthorized");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt already submitted");
  }

  // Save or update answer
  const answer = await prisma.answer.upsert({

    where: {
      attemptId_questionId: {
        attemptId,
        questionId
      }
    },

    update: {
      optionId
    },

    create: {
      attemptId,
      questionId,
      optionId
    }

  });

  return answer;
}

export async function submitAttemptService(studentId, attemptId) {

  // Verify attempt exists
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        include: {
          question: true,
          option: true
        }
      }
    }
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.studentId !== studentId) {
    throw new Error("Unauthorized");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt already submitted");
  }

  // Calculate score
  let score = 0;

  for (const answer of attempt.answers) {

    if (answer.option.isCorrect) {
      score += answer.question.marks;
    }

  }

  // Update attempt
  const updatedAttempt = await prisma.attempt.update({

    where: { id: attemptId },

    data: {
      score,
      status: "SUBMITTED",
      submittedAt: new Date()
    }

  });

  return updatedAttempt;
}