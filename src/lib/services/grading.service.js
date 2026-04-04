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
  // Find exams created by this teacher that have pending results
  const exams = await prisma.exam.findMany({
    where: {
      creatorId: teacherId,
      results: {
        some: { gradingStatus: "MANUAL_REVIEW_PENDING" }
      }
    },
    include: {
      _count: {
        select: {
          results: {
            where: { gradingStatus: "MANUAL_REVIEW_PENDING" }
          }
        }
      },
      subject: true
    }
  });

  return exams.map(e => ({
    id: e.id,
    title: e.title,
    subject: e.subject.name,
    pendingCount: e._count.results,
    updatedAt: e.updatedAt
  }));
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
      }
    }
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.exam.creatorId !== teacherId) throw new Error("Unauthorized");

  return attempt;
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
