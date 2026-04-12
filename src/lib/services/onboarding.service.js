import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Onboards a new college with a trial period.
 * Creates the college record, hashes the admin password,
 * creates the admin user linked to that college, and returns a JWT.
 */
export async function onboardCollege({
  collegeName,
  address,
  adminName,
  adminEmail,
  adminPassword,
  adminContact,
  adminDesignation,
}) {
  if (!collegeName) throw new Error("College name is required");
  if (!adminName) throw new Error("Admin name is required");
  if (!adminEmail) throw new Error("Admin email is required");
  if (!adminPassword) throw new Error("Password is required");

  // Check if admin email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (existingUser) throw new Error("An account with this email already exists");

  // Check if college name already exists
  const existingCollege = await prisma.college.findFirst({
    where: { name: { equals: collegeName, mode: "insensitive" } },
  });
  if (existingCollege) throw new Error("A college with this name is already registered");

  const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  // Create college with trial metadata
  const college = await prisma.college.create({
    data: {
      name: collegeName,
      address: address || null,
      // Store trial info — you can add these columns to the Prisma schema later.
      // For now we store them in the address field or extend the schema as needed.
    },
  });

  // Hash password and create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "ADMIN",
      collegeId: college.id,
    },
    include: { college: { select: { name: true } } },
  });

  const token = jwt.sign(
    {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      collegeId: admin.collegeId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { passwordHash: _, ...safeAdmin } = admin;

  return {
    token,
    user: safeAdmin,
    college,
    trialEndsAt,
  };
}
