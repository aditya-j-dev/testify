import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ── Plan Definitions ──────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Trial",
    planType: "TRIAL",
    priceInPaise: 0,
    currency: "INR",
    durationDays: 3,
    maxBranches: 1,
    maxBatches: 1,
    maxTeachers: 2,
    maxStudents: 1,
    maxExams: 1,
    features: { proctoring: false, analytics: false, bulkImport: false, apiAccess: false },
    isActive: true,
  },
  {
    name: "Starter",
    planType: "STARTER",
    priceInPaise: 99900,
    currency: "INR",
    durationDays: 30,
    maxBranches: 5,
    maxBatches: 10,
    maxTeachers: 10,
    maxStudents: 200,
    maxExams: 50,
    features: { proctoring: false, analytics: true, bulkImport: true, apiAccess: false },
    isActive: true,
  },
  {
    name: "Professional",
    planType: "PROFESSIONAL",
    priceInPaise: 299900,
    currency: "INR",
    durationDays: 30,
    maxBranches: null,
    maxBatches: null,
    maxTeachers: null,
    maxStudents: null,
    maxExams: null,
    features: { proctoring: true, analytics: true, bulkImport: true, apiAccess: false },
    isActive: true,
  },
  {
    name: "Enterprise",
    planType: "ENTERPRISE",
    priceInPaise: 999900,
    currency: "INR",
    durationDays: 30,
    maxBranches: null,
    maxBatches: null,
    maxTeachers: null,
    maxStudents: null,
    maxExams: null,
    features: { proctoring: true, analytics: true, bulkImport: true, apiAccess: true },
    isActive: true,
  },
];

// ── Super Admin ───────────────────────────────────────────────────────────
const SUPER_ADMIN = {
  name: "Platform Admin",
  email: process.env.SUPER_ADMIN_EMAIL || "admin@testify.edu",
  password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@123",
  role: "SUPER_ADMIN",
};

async function main() {
  console.log("🌱 Seeding Testify database...\n");

  // 1. Seed Plans
  console.log("📋 Seeding subscription plans...");
  for (const plan of PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { planType: plan.planType },
      update: {
        name: plan.name,
        priceInPaise: plan.priceInPaise,
        durationDays: plan.durationDays,
        maxBranches: plan.maxBranches,
        maxBatches: plan.maxBatches,
        maxTeachers: plan.maxTeachers,
        maxStudents: plan.maxStudents,
        maxExams: plan.maxExams,
        features: plan.features,
        isActive: plan.isActive,
      },
      create: plan,
    });
    console.log(`  ✅ ${plan.name} plan (${plan.planType})`);
  }

  // 2. Seed Super Admin
  console.log("\n👤 Seeding Super Admin user...");
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: SUPER_ADMIN.email },
  });

  if (existingSuperAdmin) {
    console.log(`  ⏭️  Super Admin already exists: ${SUPER_ADMIN.email}`);
  } else {
    const hash = await bcrypt.hash(SUPER_ADMIN.password, 10);
    await prisma.user.create({
      data: {
        name: SUPER_ADMIN.name,
        email: SUPER_ADMIN.email,
        passwordHash: hash,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`  ✅ Super Admin created: ${SUPER_ADMIN.email}`);
    console.log(`  🔑 Password: ${SUPER_ADMIN.password}`);
    console.log(`  ⚠️  Change this password immediately in production!`);
  }

  console.log("\n✨ Seeding complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
