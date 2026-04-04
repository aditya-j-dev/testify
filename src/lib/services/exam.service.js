import prisma from "../prisma.js";

// --- Exam Creation ---
export async function createDraftExam(teacherId, data) {
  const { title, description, semester, duration, totalMarks, passingMarks, collegeId, subjectId } = data;

  if (!title || !duration || !totalMarks || !collegeId || !subjectId) {
    throw new Error("Missing required exam fields");
  }

  // Authorize teacher
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
    throw new Error("Forbidden: Only teachers can create exams");
  }

  return prisma.exam.create({
    data: {
      title,
      description,
      semester: semester ? parseInt(semester, 10) : null,
      duration: parseInt(duration, 10),
      totalMarks: parseInt(totalMarks, 10),
      passingMarks: passingMarks ? parseInt(passingMarks, 10) : null,
      status: "DRAFT", // always draft on creation
      collegeId,
      subjectId,
      creatorId: teacherId,
    }
  });
}

// --- Question Linking & Snapshotting ---
export async function addQuestionToExam(teacherId, examId, questionId, order, marks) {
  // Authorize
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden: Not your exam");
  if (exam.status !== "DRAFT") throw new Error("Cannot add questions to an exam that is not a DRAFT");

  const question = await prisma.question.findUnique({ 
    where: { id: questionId },
    include: { options: true }
  });
  if (!question) throw new Error("Question not found");

  // Generate initial snapshot
  const correctAnswers = question.options.filter(o => o.isCorrect).map(o => o.label);
  
  return prisma.examQuestion.create({
    data: {
      examId,
      questionId,
      order,
      marks,
      questionTextSnapshot: question.text,
      optionsSnapshot: JSON.stringify(question.options),
      correctAnswersSnapshot: correctAnswers
    }
  });
}

export async function publishExam(teacherId, examId, timestamps) {
  const { startTime, endTime } = timestamps;
  
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { question: { include: { options: true } } } } }
  });

  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden: Not your exam");
  if (exam.status !== "DRAFT") throw new Error("Exam is already published or live");
  if (exam.questions.length === 0) throw new Error("Cannot publish an exam with zero questions");

  // We perform a "hard snapshot" right before publishing 
  // to ensure any recent edits to the Question Bank are captured.
  await prisma.$transaction(
    exam.questions.map((eq) => {
      const liveQuestion = eq.question;
      const liveCorrect = liveQuestion.options.filter(o => o.isCorrect).map(o => o.label);
      
      return prisma.examQuestion.update({
        where: { examId_questionId: { examId: eq.examId, questionId: eq.questionId } },
        data: {
          questionTextSnapshot: liveQuestion.text,
          optionsSnapshot: JSON.stringify(liveQuestion.options),
          correctAnswersSnapshot: liveCorrect
        }
      });
    })
  );

  return prisma.exam.update({
    where: { id: examId },
    data: {
      status: "PUBLISHED",
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
    }
  });
}

// --- Access Management ---
export async function grantExamAccess(teacherId, examId, targetId, isBatch = true) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden");

  return prisma.examAccess.create({
     data: {
       examId,
       batchId: isBatch ? targetId : null,
       branchId: !isBatch ? targetId : null
     }
  });
}
export async function getExamsByCreator(teacherId) {
  return prisma.exam.findMany({
    where: { creatorId: teacherId },
    include: {
      subject: true,
      _count: {
        select: { questions: true, attempts: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
