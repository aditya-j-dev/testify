import prisma from "../prisma.js";

export async function createQuestion(teacherId, data) {
  const { subjectId, collegeId, text, type, modelAnswer, defaultMarks, options } = data;

  if (!subjectId || !collegeId || !text || !type || !defaultMarks) {
    throw new Error("Missing required question fields");
  }

  // Ensure teacher exists and works at the college
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || teacher.collegeId !== collegeId || teacher.role !== "TEACHER" && teacher.role !== "ADMIN") {
    throw new Error("Forbidden: Invalid teacher credentials for this college");
  }

  // Transaction for Question + Options
  const question = await prisma.question.create({
    data: {
      subjectId,
      collegeId,
      creatorId: teacherId,
      text,
      type,
      modelAnswer: modelAnswer || null,
      defaultMarks: parseInt(defaultMarks, 10),
      options: type !== "SUBJECTIVE" && options ? {
        create: options.map((opt, i) => ({
          label: opt.label || String.fromCharCode(65 + i), // A, B, C, D
          text: opt.text,
          isCorrect: opt.isCorrect || false,
          order: i,
        }))
      } : undefined
    },
    include: {
      options: true
    }
  });

  return question;
}

export async function updateQuestion(teacherId, questionId, newData) {
  // Verify ownership
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new Error("Question not found");
  
  if (question.creatorId !== teacherId) {
    throw new Error("Forbidden: You can only edit your own questions");
  }

  // We are NOT updating Exam snapshot here. 
  // It specifically asks to update Question Bank only, letting Exam snapshots persist if Exam is live.
  return prisma.question.update({
    where: { id: questionId },
    data: {
      text: newData.text,
      modelAnswer: newData.modelAnswer,
      defaultMarks: newData.defaultMarks !== undefined ? parseInt(newData.defaultMarks, 10) : undefined,
    }
  });
}

export async function getQuestionsBySubject(subjectId) {
  return prisma.question.findMany({
    where: { subjectId },
    include: { options: true }
  });
}