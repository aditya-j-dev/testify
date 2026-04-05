import prisma from "../prisma.js";
import { syncExamSnapshots } from "./exam.service.js";

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
  options 
}) {
  return prisma.$transaction(async (tx) => {
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
  const questionRecord = await prisma.question.findUnique({ 
    where: { id },
    include: { exams: { include: { exam: { select: { status: true } } } } }
  });

  if (!questionRecord) throw new Error("Question not found");
  if (questionRecord.creatorId !== userId) throw new Error("Unauthorized: You do not own this question");

  const isLocked = questionRecord.exams.some(eq => eq.exam.status === 'ACTIVE' || eq.exam.status === 'COMPLETED');
  
  if (isLocked) {
     return createQuestion({
        ...data,
        subjectId: questionRecord.subjectId,
        collegeId: questionRecord.collegeId,
        creatorId: userId,
        type: questionRecord.type
     });
  }

  const { options, ...questionData } = data;

  return prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id },
      data: {
        ...questionData,
        defaultMarks: questionData.defaultMarks ? parseInt(questionData.defaultMarks, 10) : undefined,
      }
    });

    if (options) {
      await tx.questionOption.deleteMany({ where: { questionId: id } });
      await tx.questionOption.createMany({
        data: options.map((opt) => ({
          ...opt,
          questionId: id,
        }))
      });
    }

    const updated = await tx.question.findUnique({
      where: { id },
      include: { options: true }
    });

    await syncExamSnapshots(id);

    return updated;
  });
}