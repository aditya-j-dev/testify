import prisma from "../prisma.js";

/**
 * Question Bank Service
 */

export async function createQuestion({ 
  subjectId, 
  collegeId, 
  creatorId, 
  text, 
  type, 
  modelAnswer, 
  defaultMarks,
  options // array of { text, label, isCorrect, order }
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Create Question
    const question = await tx.question.create({
      data: {
        text,
        type: type.toUpperCase(),
        modelAnswer,
        defaultMarks: parseInt(defaultMarks, 10),
        subject: { connect: { id: subjectId } },
        college: { connect: { id: collegeId } },
        creator: { connect: { id: creatorId } },
      }
    });

    // 2. Create Options if MCQ
    if (options && options.length > 0) {
      await tx.questionOption.createMany({
        data: options.map((opt) => ({
          ...opt,
          questionId: question.id,
        }))
      });
    }

    return tx.question.findUnique({
      where: { id: question.id },
      include: { options: true }
    });
  });
}

export async function getQuestionsBySubject(subjectId) {
  return prisma.question.findMany({
    where: { subjectId },
    include: { options: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getQuestionsByCollege(collegeId, filters = {}) {
  const { subjectId, type, creatorId } = filters;
  
  return prisma.question.findMany({
    where: {
      collegeId,
      ...(subjectId && { subjectId }),
      ...(type && { type }),
      ...(creatorId && { creatorId }),
    },
    include: { 
      options: { orderBy: { order: 'asc' } },
      subject: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteQuestion(id, userId) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new Error("Question not found");
  if (question.creatorId !== userId) throw new Error("Unauthorized: You do not own this question");

  return prisma.question.delete({
    where: { id }
  });
}

export async function updateQuestion(id, userId, data) {
  const questionRecord = await prisma.question.findUnique({ where: { id } });
  if (!questionRecord) throw new Error("Question not found");
  if (questionRecord.creatorId !== userId) throw new Error("Unauthorized: You do not own this question");

  const { options, ...questionData } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Update basic fields
    await tx.question.update({
      where: { id },
      data: {
        ...questionData,
        defaultMarks: questionData.defaultMarks ? parseInt(questionData.defaultMarks, 10) : undefined,
      }
    });

    // 2. If options are provided, replace them
    if (options) {
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionOption.createMany({
        data: options.map((opt) => ({
          ...opt,
          questionId: id,
        }))
      });
    }

    return tx.question.findUnique({
      where: { id },
      include: { options: true }
    });
  });
}