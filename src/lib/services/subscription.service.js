import prisma from "../prisma.js";
import { safeQuery } from "../db-retry.js";

// ─── Plan Definitions ─────────────────────────────────────────────────────
// This is the ONLY place plan limits are defined. All application code
// reads from the DB — never hardcodes these values.

const PLAN_DEFINITIONS = [
  {
    name: "Trial",
    planType: "TRIAL",
    priceInPaise: 0,
    currency: "INR",
    durationDays: 3,
    maxBranches: 1,
    maxBatches: 1,
    maxTeachers: 1,
    maxStudents: 1,
    maxExams: 1,
    features: {
      proctoring: false,
      analytics: false,
      bulkImport: false,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    name: "Starter",
    planType: "STARTER",
    priceInPaise: 99900, // ₹999/month
    currency: "INR",
    durationDays: 30,
    maxBranches: 5,
    maxBatches: 10,
    maxTeachers: 10,
    maxStudents: 200,
    maxExams: 50,
    features: {
      proctoring: false,
      analytics: true,
      bulkImport: true,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    name: "Professional",
    planType: "PROFESSIONAL",
    priceInPaise: 299900, // ₹2,999/month
    currency: "INR",
    durationDays: 30,
    maxBranches: null,  // unlimited
    maxBatches: null,
    maxTeachers: null,
    maxStudents: null,
    maxExams: null,
    features: {
      proctoring: true,
      analytics: true,
      bulkImport: true,
      apiAccess: false,
    },
    isActive: true,
  },
  {
    name: "Enterprise",
    planType: "ENTERPRISE",
    priceInPaise: 999900, // ₹9,999/month (custom pricing)
    currency: "INR",
    durationDays: 30,
    maxBranches: null,
    maxBatches: null,
    maxTeachers: null,
    maxStudents: null,
    maxExams: null,
    features: {
      proctoring: true,
      analytics: true,
      bulkImport: true,
      apiAccess: true,
    },
    isActive: true,
  },
];

/**
 * Seeds all 4 subscription plans into the DB.
 * Safe to call multiple times — uses upsert.
 */
export async function seedSubscriptionPlans() {
  const results = [];
  for (const plan of PLAN_DEFINITIONS) {
    const result = await prisma.subscriptionPlan.upsert({
      where: { planType: plan.planType },
      update: {
        name: plan.name,
        priceInPaise: plan.priceInPaise,
        currency: plan.currency,
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
    results.push(result);
  }
  return results;
}

/**
 * Fetches a plan by its PlanType enum value.
 * Always use this — never hardcode limits in application code.
 */
export async function getPlanByType(planType) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { planType },
  });
  if (!plan) throw new Error(`Plan not found: ${planType}`);
  return plan;
}

/**
 * Checks whether a college has reached its plan limit for a given resource.
 * Throws a 403-style error if the limit is exceeded.
 *
 * @param {string} collegeId
 * @param {"branches"|"teachers"|"students"|"batches"|"exams"} resource
 */
export async function checkResourceLimit(collegeId, resource) {
  // Fetch college + plan
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { planType: true },
  });
  if (!college) throw new Error("College not found");

  const plan = await getPlanByType(college.planType);

  // Map resource name → plan field + count query
  // branches and batches are unlimited on all plans
  const limitMap = {
    teachers: {
      max: plan.maxTeachers,
      count: () => prisma.user.count({ where: { collegeId, role: "TEACHER" } }),
      label: "teacher",
    },
    students: {
      max: plan.maxStudents,
      count: () => prisma.user.count({ where: { collegeId, role: "STUDENT" } }),
      label: "student",
    },
    exams: {
      max: plan.maxExams,
      count: () => prisma.exam.count({ where: { collegeId } }),
      label: "exam",
    },
  };

  const entry = limitMap[resource];
  if (!entry) throw new Error(`Unknown resource: ${resource}`);

  // null = unlimited
  if (entry.max === null) return;

  const current = await entry.count();
  if (current >= entry.max) {
    throw Object.assign(
      new Error(
        `You've reached the ${entry.label} limit (${entry.max}) on your current plan. Upgrade to add more.`
      ),
      { statusCode: 403, code: "PLAN_LIMIT_EXCEEDED", current, max: entry.max }
    );
  }
}

/**
 * Returns the current resource usage vs. plan limits for a college.
 * Used to display usage indicators in the admin dashboard.
 */
export async function getCollegeUsage(collegeId) {
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { planType: true },
  });
  if (!college) return null;

  const plan = await getPlanByType(college.planType);

  const teacherCount = await safeQuery(() => prisma.user.count({ where: { collegeId, role: "TEACHER" } }));
  const studentCount = await safeQuery(() => prisma.user.count({ where: { collegeId, role: "STUDENT" } }));
  const examCount = await safeQuery(() => prisma.exam.count({ where: { collegeId } }));

  return {
    plan: plan.name,
    planType: plan.planType,
    features: plan.features,
    usage: {
      teachers: { current: teacherCount, max: plan.maxTeachers },
      students: { current: studentCount, max: plan.maxStudents },
      exams: { current: examCount, max: plan.maxExams },
    },
  };
}
