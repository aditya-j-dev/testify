import prisma from "../prisma.js";

// --- College ---
export async function createCollege({ name, address }) {
  if (!name) throw new Error("College name is required");

  // Create college
  const college = await prisma.college.create({
    data: {
      name,
      address,
    },
  });

  return college;
}

export async function getColleges() {
  return prisma.college.findMany({
    include: {
      _count: {
        select: { users: { where: { role: "ADMIN" } } }
      }
    }
  });
}

export async function getCollegeById(id) {
  return prisma.college.findUnique({
    where: { id },
    include: {
      users: {
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true, createdAt: true }
      }
    }
  });
}

export async function updateCollege(id, { name, address }) {
  return prisma.college.update({
    where: { id },
    data: { name, address }
  });
}

export async function getUsersByCollege(collegeId, role) {
  return prisma.user.findMany({
    where: { collegeId, role },
    select: { id: true, name: true, email: true, createdAt: true, batchId: true, branchId: true }
  });
}

export async function getUsersByBatch(batchId) {
  return prisma.user.findMany({
    where: { batchId, role: "STUDENT" },
    select: { id: true, name: true, email: true, createdAt: true }
  });
}

import bcrypt from "bcrypt";
export async function createUserForCollege(collegeId, { name, email, password, role, batchId, branchId }) {
  if (!name || !email || !password || !role) throw new Error("Missing required user data");
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("User with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role.toUpperCase(),
      collegeId,
      batchId,
      branchId
    }
  });
}

// --- Branch ---
export async function createBranch({ name, collegeId }) {
  if (!name || !collegeId) throw new Error("Branch name and collegeId are required");

  // Check if college exists
  const collegeExists = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!collegeExists) throw new Error("Invalid collegeId block");

  // Ensure unique branch name per college
  const existingBranch = await prisma.branch.findUnique({
    where: {
      name_collegeId: {
        name,
        collegeId,
      },
    },
  });

  if (existingBranch) throw new Error("Branch already exists for this college");

  const branch = await prisma.branch.create({
    data: {
      name,
      collegeId,
    },
  });

  return branch;
}

export async function getBranchesByCollege(collegeId) {
  return prisma.branch.findMany({
    where: { collegeId },
  });
}

// --- Batch ---
export async function createBatch({ name, graduationYear, branchId }) {
  if (!name || !graduationYear || !branchId) {
    throw new Error("Batch name, graduationYear, and branchId are required");
  }

  // Check if branch exists
  const branchExists = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branchExists) throw new Error("Invalid branchId");

  // Ensure unique batch per branch
  const existingBatch = await prisma.batch.findUnique({
    where: {
      name_branchId: {
        name,
        branchId,
      },
    },
  });

  if (existingBatch) throw new Error("Batch already exists for this branch");

  const batch = await prisma.batch.create({
    data: {
      name,
      graduationYear: parseInt(graduationYear, 10),
      branchId,
    },
  });

  return batch;
}

export async function getBatchesByBranch(branchId) {
  return prisma.batch.findMany({
    where: { branchId },
  });
}

// --- Subject ---
export async function createSubject({ name, collegeId, credits }) {
  if (!name || !collegeId) throw new Error("Name and collegeId are required");
  
  return prisma.subject.create({
    data: {
      name,
      collegeId,
      credits: credits ? parseInt(credits, 10) : 3,
    }
  });
}

export async function getSubjectsByCollege(collegeId) {
  return prisma.subject.findMany({
    where: { collegeId },
    orderBy: { name: 'asc' }
  });
}

export async function updateSubject(id, { name, credits }) {
  return prisma.subject.update({
    where: { id },
    data: { 
      name,
      credits: credits ? parseInt(credits, 10) : undefined,
    }
  });
}

export async function deleteSubject(id) {
  return prisma.subject.delete({
    where: { id }
  });
}
