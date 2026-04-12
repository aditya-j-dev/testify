import prisma from "../prisma.js";
import { autoGradeAttempt } from "./grading.service.js";

// --- Collision Detection ---
async function checkSchedulingConflict(targetBatchId, targetStartTime, targetEndTime, currentExamId) {
  if (!targetBatchId || !targetStartTime || !targetEndTime) return;

  const conflictingExam = await prisma.exam.findFirst({
    where: {
      id: { not: currentExamId },
      access: {
        some: { batchId: targetBatchId }
      },
      startTime: { lt: targetEndTime },
      endTime: { gt: targetStartTime },
      status: { not: "COMPLETED" } 
    }
  });

  if (conflictingExam) {
    throw new Error(`Scheduling Conflict: Another exam ("${conflictingExam.title}") is already scheduled for this batch during the selected time.`);
  }
}

// --- Exam Creation ---
export async function createDraftExam(teacherId, data) {
  const { title, description, semester, duration, totalMarks, passingMarks, collegeId, subjectId, branchId, batchId } = data;

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
      access: (branchId || batchId) ? {
        create: {
          branchId: branchId || null,
          batchId: batchId || null
        }
      } : undefined
    }
  });
}

// --- Question Linking & Snapshotting ---
export async function addQuestionToExam(teacherId, examId, questionId, order, marks) {
  // Authorize
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden: Not your exam");
  if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") throw new Error("Cannot modify questions for this assessment phase.");

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

export async function removeQuestionFromExam(teacherId, examId, questionId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden");
  if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") throw new Error("Cannot modify questions for this assessment phase.");

  return prisma.examQuestion.delete({
    where: { examId_questionId: { examId, questionId } }
  });
}

export async function reorderExamQuestions(teacherId, examId, orderedIds) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden: Not your exam");
  if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") throw new Error("Layout is locked for this phase.");

  return prisma.$transaction(
    orderedIds.map((questionId, index) => 
      prisma.examQuestion.update({
        where: { examId_questionId: { examId, questionId } },
        data: { order: index }
      })
    )
  );
}

export async function publishExam(teacherId, examId, timestamps) {
  const { startTime, endTime } = timestamps;
  
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { 
      questions: { include: { question: { include: { options: true } } } },
      access: true
    }
  });

  if (!exam || exam.creatorId !== teacherId) throw new Error("Forbidden: Not your exam");
  if (exam.status !== "DRAFT") throw new Error("Exam is already published or live");
  if (exam.questions.length === 0) throw new Error("Cannot publish an exam with zero questions");

  const targetBatchId = exam.access.length > 0 ? exam.access[0].batchId : null;
  const targetStartTime = startTime ? new Date(startTime) : exam.startTime;
  const targetEndTime = endTime ? new Date(endTime) : exam.endTime;

  await checkSchedulingConflict(targetBatchId, targetStartTime, targetEndTime, examId);


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
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    }
  });
}

/**
 * Synchronizes snapshots for all exams that are currently in PUBLISHED status
 * when their source question is updated. 
 * This allows "hot-fixes" for typos/clarifications before students start.
 */
export async function syncExamSnapshots(questionId) {
  const linkedExamQuestions = await prisma.examQuestion.findMany({
    where: { 
      questionId,
      exam: { status: 'PUBLISHED' } 
    },
    include: { question: { include: { options: true } } }
  });

  if (linkedExamQuestions.length === 0) return;

  await prisma.$transaction(
    linkedExamQuestions.map((eq) => {
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

export async function getExamById(id, teacherId) {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      questions: {
        orderBy: { order: 'asc' },
        include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }
      },
      access: {
         include: { branch: true, batch: true }
      }
    }
  });

  if (exam && exam.creatorId !== teacherId) throw new Error("Unauthorized");
  return exam;
}

// --- Deterministic Randomization Helpers ---
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function seededShuffle(array, seed) {
  if (!array || array.length <= 1) return array;
  let m = array.length, t, i;
  let seedNum = 0;
  for (let j = 0; j < seed.length; j++) {
    seedNum = (seedNum << 5) - seedNum + seed.charCodeAt(j);
    seedNum |= 0; 
  }
  
  const rnd = mulberry32(seedNum);
  while (m) {
    i = Math.floor(rnd() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export async function getExamForStudent(id, studentId) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { branchId: true, batchId: true, collegeId: true }
  });

  if (!user) throw new Error("User not found");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      questions: {
        orderBy: { order: 'asc' },
        include: { question: { include: { options: { orderBy: { order: 'asc' } } } } }
      },
      access: true
    }
  });

  if (!exam || exam.status === 'DRAFT') throw new Error("Exam not available");

  // Verify access targeting
  const hasAccess = exam.access.some(acc => 
    (acc.batchId === user.batchId) || 
    (acc.branchId === user.branchId && !acc.batchId) || 
    (!acc.branchId && !acc.batchId)
  );

  if (!hasAccess && exam.collegeId !== user.collegeId) throw new Error("Unauthorized");

  // Strip sensitive info & apply shuffling
  let questionsToProcess = [...exam.questions];
  
  // 1. Shuffle Questions if enabled
  if (exam.shuffleQuestions) {
     questionsToProcess = seededShuffle(questionsToProcess, `${studentId}_${exam.id}_q`);
  }

  const secureQuestions = questionsToProcess.map(eq => {
    const { correctAnswersSnapshot, ...safeEq } = eq;
    
    // 2. Shuffle Options if enabled (and it's an MCQ)
    let finalOptions = [...eq.question.options];
    let snapshotToUse = eq.optionsSnapshot;

    if (snapshotToUse) {
      try { finalOptions = JSON.parse(snapshotToUse); } catch(e) {}
    }

    if (exam.shuffleOptions && eq.question.type !== 'SUBJECTIVE') {
       finalOptions = seededShuffle(finalOptions, `${studentId}_${exam.id}_opt_${eq.questionId}`);
       // If we were using a snapshot, update the snapshot field for the frontend to consume
       if (snapshotToUse) {
         snapshotToUse = JSON.stringify(finalOptions);
       }
    }

    return {
      ...safeEq,
      optionsSnapshot: snapshotToUse,
      question: {
        ...eq.question,
        options: finalOptions.map(opt => {
          const { isCorrect, ...safeOpt } = opt;
          return safeOpt;
        })
      }
    };
  });

  const { access: _, ...safeExam } = exam;
  return { ...safeExam, questions: secureQuestions };
}

export async function startExam(teacherId, examId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");
  if (exam.status !== "PUBLISHED") throw new Error("Only published exams can be started");

  return prisma.exam.update({
    where: { id: examId },
    data: { status: "ACTIVE" }
  });
}

export async function updateExam(id, teacherId, data) {
  const exam = await prisma.exam.findUnique({ where: { id }, include: { access: true } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");
  
  if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") {
    throw new Error("Only draft and published exams can be modified");
  }

  const { 
    title, description, semester, duration, totalMarks, 
    passingMarks, subjectId, branchId, batchId, 
    startTime, endTime, shuffleQuestions, shuffleOptions 
  } = data;

  const targetBatchId = batchId !== undefined ? batchId : (exam.access.length > 0 ? exam.access[0].batchId : null);
  const targetStartTime = startTime !== undefined ? (startTime ? new Date(startTime) : null) : exam.startTime;
  const targetEndTime = endTime !== undefined ? (endTime ? new Date(endTime) : null) : exam.endTime;

  await checkSchedulingConflict(targetBatchId, targetStartTime, targetEndTime, id);

  return prisma.$transaction(async (tx) => {
    // 1. Update core metadata
    const updated = await tx.exam.update({
      where: { id },
      data: {
        title,
        description,
        semester: semester ? parseInt(semester, 10) : undefined,
        duration: duration ? parseInt(duration, 10) : undefined,
        totalMarks: totalMarks ? parseInt(totalMarks, 10) : undefined,
        passingMarks: passingMarks ? parseInt(passingMarks, 10) : undefined,
        subjectId,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        shuffleQuestions: shuffleQuestions !== undefined ? !!shuffleQuestions : undefined,
        shuffleOptions: shuffleOptions !== undefined ? !!shuffleOptions : undefined
      }
    });

    // 2. Manage Access Control (Atomic Upsert)
    if (branchId || batchId) {
      if (exam.access.length > 0) {
        await tx.examAccess.update({
          where: { id: exam.access[0].id },
          data: {
            branchId: branchId || null,
            batchId: batchId || null
          }
        });
      } else {
        await tx.examAccess.create({
          data: {
            examId: id,
            branchId: branchId || null,
            batchId: batchId || null
          }
        });
      }
    }

    return updated;
  });
}


export async function completeExam(teacherId, examId) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");
  if (exam.status !== "ACTIVE") throw new Error("Only active exams can be terminated");

  return prisma.$transaction(async (tx) => {
    // 1. Mark exam as completed
    const updated = await tx.exam.update({
      where: { id: examId },
      data: { 
        status: "COMPLETED",
        endTime: new Date() // Force end time to now
      }
    });

    // 2. Force-submit all in-progress attempts
    const pendingAttempts = await tx.attempt.findMany({
      where: { 
        examId: examId,
        status: "IN_PROGRESS"
      }
    });

    await tx.attempt.updateMany({
      where: { 
        examId: examId,
        status: "IN_PROGRESS"
      },
      data: {
        status: "TIMED_OUT",
        submittedAt: new Date()
      }
    });

    // 3. Trigger auto-grading for all just-closed attempts
    for (const attempt of pendingAttempts) {
      await autoGradeAttempt(attempt.id, tx);
    }

    return updated;
  });
}

export async function deleteExam(id, teacherId) {
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");
  
  if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") {
    throw new Error("Only draft and published exams can be deleted");
  }

  return prisma.exam.delete({ where: { id } });
}
