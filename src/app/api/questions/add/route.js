import prisma from "@/lib/prisma.js";

export async function addQuestionsService(teacherId, data) {

  const { examId, questions } = data;

  if (!examId || !questions || questions.length === 0) {
    throw new Error("Invalid input");
  }

  // Verify exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  // Verify ownership
  if (exam.creatorId !== teacherId) {
    throw new Error("Forbidden: You can only modify your own exams");
  }

  // Transaction ensures atomic operation
  const createdQuestions = await prisma.$transaction(

    questions.map((question) =>

      prisma.question.create({

        data: {

          text: question.text,
          marks: question.marks,
          examId: examId,

          options: {
            create: question.options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },

        },

      })

    )

  );

  return {
    success: true,
    questionsCreated: createdQuestions.length,
  };

}