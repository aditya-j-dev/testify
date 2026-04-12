import prisma from "../prisma.js";

// --- Manual Grading ---
export async function gradeSubjectiveAnswer(teacherId, answerId, marksObtained, feedback) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { attempt: { include: { exam: true } }, question: true }
  });

  if (!answer) throw new Error("Answer not found");
  if (answer.attempt.exam.creatorId !== teacherId) throw new Error("Unauthorized to grade this exam");

  // Validate marks
  const maxMarks = answer.question.defaultMarks; // Note: for ExamQuestion overridden marks, we'd need to query that table. Simple fallback here.
  if (marksObtained < 0 || marksObtained > maxMarks) {
    throw new Error(`Marks must be between 0 and ${maxMarks}`);
  }

  // Update Answer
  await prisma.answer.update({
    where: { id: answerId },
    data: {
      marksObtained,
      teacherFeedback: feedback,
      gradedById: teacherId,
      isCorrect: marksObtained > 0
    }
  });

  // Re-calculate Result total score
  const allAnswers = await prisma.answer.findMany({ where: { attemptId: answer.attemptId } });
  
  const newTotal = allAnswers.reduce((sum, ans) => sum + (ans.marksObtained || 0), 0);
  const percentage = (newTotal / answer.attempt.exam.totalMarks) * 100;
  
  const isPassed = answer.attempt.exam.passingMarks ? newTotal >= answer.attempt.exam.passingMarks : percentage >= 40;

  // Simple US 4.0 Scale Mapping
  let gradePoint = 0.0;
  if (percentage >= 90) gradePoint = 4.0;
  else if (percentage >= 80) gradePoint = 3.0;
  else if (percentage >= 70) gradePoint = 2.0;
  else if (percentage >= 60) gradePoint = 1.0;

  // Check if fully graded
  const remainingSubjective = allAnswers.some(a => a.question.type === "SUBJECTIVE" && a.marksObtained === null);

  await prisma.result.update({
    where: { attemptId: answer.attemptId },
    data: {
      totalMarksObtained: newTotal,
      percentage: percentage,
      isPassed: isPassed,
      gradePoint: gradePoint,
      gradingStatus: remainingSubjective ? "MANUAL_REVIEW_PENDING" : "FULLY_GRADED"
    }
  });

  return { success: true, newTotal, percentage, gradePoint };
}

// --- GPA Engine ---
export async function calculateSemesterGPA(studentId, semester) {
  // Find all Enrollments for the student in this semester
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, semester },
    include: { subject: true }
  });

  let totalQualityPoints = 0;
  let totalCredits = 0;
  const breakDown = [];

  for (const enrollment of enrollments) {
    const credits = enrollment.subject.credits;
    
    // Find highest Result for this subject in the specific semester exams
    const results = await prisma.result.findMany({
      where: {
        studentId,
        exam: { subjectId: enrollment.subjectId, semester: semester },
        gradingStatus: { in: ["AUTO_GRADED", "FULLY_GRADED", "PUBLISHED"] }
      },
      orderBy: { gradePoint: 'desc' }, // take best attempt if multiple exist
      take: 1,
      include: { exam: true }
    });

    const gradePoint = results.length > 0 ? (results[0].gradePoint || 0) : 0;
    
    totalQualityPoints += (gradePoint * credits);
    totalCredits += credits;

    breakDown.push({
       subject: enrollment.subject.name,
       credits,
       gradePoint,
       examTitle: results.length > 0 ? results[0].exam.title : "No Data"
    });
  }

  const gpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 0.00;

  return {
    studentId,
    semester,
    gpa,
    totalCredits,
    breakDown
  };
}

// --- Query Methods for UI ---

export async function getPendingGradingExams(teacherId) {
  // Find exams created by this teacher that have any results (pending or auto-graded)
  const exams = await prisma.exam.findMany({
    where: {
      creatorId: teacherId,
      results: {
        some: {} // Any result
      }
    },
    include: {
      results: {
        select: { gradingStatus: true }
      },
      subject: true
    }
  });

  return exams.map(e => {
    const pendingCount = e.results.filter(r => r.gradingStatus === "MANUAL_REVIEW_PENDING").length;
    const completedCount = e.results.length - pendingCount;
    
    return {
      id: e.id,
      title: e.title,
      subject: e.subject.name,
      pendingCount,
      completedCount,
      totalCount: e.results.length,
      updatedAt: e.updatedAt
    };
  });
}

export async function getExamAttemptsForGrading(teacherId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { creatorId: true }
  });

  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");

  return prisma.result.findMany({
    where: { examId },
    include: {
      student: {
        select: { id: true, name: true, email: true }
      },
      attempt: {
        select: { id: true, status: true, submittedAt: true }
      }
    },
    orderBy: { gradingStatus: 'asc' } // show pending first
  });
}

export async function getFullAttemptForGrading(teacherId, attemptId) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            include: { 
              question: {
                include: { options: true }
              } 
            },
            orderBy: { order: 'asc' }
          }
        }
      },
      user: {
        select: { name: true, email: true }
      },
      answers: {
        include: {
          question: true
        }
      },
      result: true
    }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.exam.creatorId !== teacherId) throw new Error("Unauthorized");

  return attempt;
}


export async function autoGradeAttempt(attemptId, tx = null) {
  const client = tx || prisma;
  
  try {
    const attempt = await client.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!attempt) {
      console.error(`[Grading Engine] Attempt ${attemptId} not found`);
      return null;
    }

    let totalMarks = 0;
    let hasSubjective = false;

    const gradingOperations = attempt.exam.questions.map((eq) => {
      const answer = attempt.answers.find((a) => a.questionId === eq.questionId);
      if (!answer) return null;

      const isMcq = eq.question.type !== "SUBJECTIVE";
      if (isMcq) {
        const studentResponseIds = answer.selectedOptions || [];
        
        let originalOptions = [];
        try {
            if (eq.optionsSnapshot) originalOptions = JSON.parse(eq.optionsSnapshot);
        } catch(e) {}
        
        const studentResponseLabels = studentResponseIds.map(idOrLabel => {
            const opt = originalOptions.find(o => o.id === idOrLabel || o.label === idOrLabel);
            return opt ? opt.label : idOrLabel;
        });

        const studentResponse = studentResponseLabels.sort();
        const correctResponse = (eq.correctAnswersSnapshot || []).sort();
        
        const isCorrect = JSON.stringify(studentResponse) === JSON.stringify(correctResponse);
        const marks = isCorrect ? eq.marks : 0;
        
        totalMarks += marks;

        return client.answer.update({
          where: { id: answer.id },
          data: {
            marksObtained: marks,
            isCorrect: isCorrect
          }
        });
      } else {
        hasSubjective = true;
        return null;
      }
    }).filter(Boolean);

    // Run answer updates
    if (gradingOperations.length > 0) {
       // If we're already in a transaction (tx is provided), we can't use $transaction on it easily.
       // We just wait for all of them.
       await Promise.all(gradingOperations);
    }

    // Recalculate totals safely
    const examTotal = attempt.exam.totalMarks || 1; // prevent div by zero
    const percentage = (totalMarks / examTotal) * 100;
    const isPassed = attempt.exam.passingMarks ? totalMarks >= attempt.exam.passingMarks : percentage >= 40;

    // Map to 4.0 scale
    let gradePoint = 0.0;
    if (percentage >= 90) gradePoint = 4.0;
    else if (percentage >= 80) gradePoint = 3.0;
    else if (percentage >= 70) gradePoint = 2.0;
    else if (percentage >= 60) gradePoint = 1.0;

    // Create Result row
    return client.result.upsert({
      where: { attemptId },
      update: {
        totalMarksObtained: totalMarks,
        percentage,
        isPassed,
        gradePoint,
        gradingStatus: hasSubjective ? "MANUAL_REVIEW_PENDING" : "AUTO_GRADED"
      },
      create: {
        attemptId,
        studentId: attempt.userId,
        examId: attempt.examId,
        totalMarksObtained: totalMarks,
        percentage,
        isPassed,
        gradePoint,
        gradingStatus: hasSubjective ? "MANUAL_REVIEW_PENDING" : "AUTO_GRADED"
      }
    });
  } catch (err) {
    console.error(`[Grading Engine] Error grading attempt ${attemptId}:`, err);
    throw err; // Re-throw to inform the caller
  }
}

export async function recalculateExamResults(teacherId, examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { creatorId: true }
  });

  if (!exam || exam.creatorId !== teacherId) throw new Error("Unauthorized");

  const attempts = await prisma.attempt.findMany({
    where: {
      examId,
      status: { in: ['SUBMITTED', 'TIMED_OUT', 'CHEATED'] }
    },
    select: { id: true }
  });

  // Process all through auto-grading engine
  for (const attempt of attempts) {
    await autoGradeAttempt(attempt.id);
  }

  return { success: true, count: attempts.length };
}

export async function getStudentResultSummary(studentId) {
  const results = await prisma.result.findMany({
    where: { studentId },
    include: {
      exam: {
        include: { subject: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Unique semesters from results
  const semesters = [...new Set(results.map(r => r.exam.semester).filter(Boolean))];
  
  const gpaBySemester = await Promise.all(semesters.map(async sem => {
    return calculateSemesterGPA(studentId, sem);
  }));

  return {
    results,
    gpaBySemester
  };
}
