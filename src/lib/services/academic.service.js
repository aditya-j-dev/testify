import prisma from "../prisma.js";

// --- Subject Methods ---

export async function createSubject(data) {
  const { name, credits, collegeId } = data;
  if (!name || !collegeId) throw new Error("Name and collegeId are required");

  return prisma.subject.create({
    data: {
      name,
      credits: parseInt(credits, 10) || 3,
      collegeId,
    },
  });
}

export async function getSubjectsByCollege(collegeId) {
  return prisma.subject.findMany({
    where: { collegeId }
  });
}

// --- Enrollment Methods ---

export async function enrollStudent(data) {
  const { studentId, subjectId, semester } = data;
  if (!studentId || !subjectId) throw new Error("studentId and subjectId are required");

  // Verify it's a student
  const student = await prisma.user.findUnique({
    where: { id: studentId }
  });
  
  if (!student || student.role !== "STUDENT") {
    throw new Error("Invalid student ID");
  }

  return prisma.enrollment.create({
    data: {
      studentId,
      subjectId,
      semester: parseInt(semester, 10) || null,
    }
  });
}

export async function getStudentEnrollments(studentId) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      subject: true
    }
  });
}
