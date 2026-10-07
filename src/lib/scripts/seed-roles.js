import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database role initialization...");

  const superAdminEmail = "superadmin@testify.com";
  const adminEmail = "admin@testify.com";
  const collegeName = "Testify University";

  // 1. Setup Super Admin
  const hashedSuperPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: superAdminEmail,
      name: "Global Super Admin",
      passwordHash: hashedSuperPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}`);

  // 2. Setup College
  // Check if college already exists to avoid duplicates (since name isn't unique in schema)
  let college = await prisma.college.findFirst({
    where: { name: collegeName }
  });

  if (!college) {
    college = await prisma.college.create({
      data: {
        name: collegeName,
        address: "New Delhi, India",
      },
    });
    console.log(`✅ College Created: ${college.name}`);
  } else {
    console.log(`ℹ️ College "${collegeName}" already exists.`);
  }

  // 3. Setup College Admin
  const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);
  const collegeAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: "ADMIN",
      collegeId: college.id 
    },
    create: {
      email: adminEmail,
      name: "College Administrator",
      passwordHash: hashedAdminPassword,
      role: "ADMIN",
      collegeId: college.id,
    },
  });
  console.log(`✅ College Admin: ${collegeAdmin.email} linked to ${college.name}`);

  console.log("\n🎉 Initialization complete! You can now login with these credentials.");
}

main()
  .catch((e) => {
    console.error("❌ Error during initialization:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
