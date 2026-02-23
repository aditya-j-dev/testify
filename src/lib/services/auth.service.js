import prisma from "../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerUser({ email, password, role }) {

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role.toUpperCase(), // Ensure role is stored in uppercase (e.g., "STUDENT", "TEACHER")
    },
  });

  const { password: _, ...safeUser } = user;
return safeUser;
}

export async function loginUser({ email, password }) {

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  //we dont want to gieve the password back to the user, so we destructure it out and return the rest of the user data as safeUser
  const { password: _, ...safeUser } = user;

    return {
    token,
    user: safeUser,
    };
}