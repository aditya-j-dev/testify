const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EMAIL = "iiitsadm@gmail.com";

async function main() {
  // Delete the college linked to any registration for this email (to avoid FK issues)
  const reg = await prisma.collegeRegistration.findUnique({
    where: { contactEmail: EMAIL },
  });

  if (reg?.collegeId) {
    // Delete college (cascades to users attached to it)
    await prisma.college.delete({ where: { id: reg.collegeId } }).catch(() => {});
    console.log("Deleted college:", reg.collegeId);
  }

  // Delete orphan user (if college delete didn't cascade)
  const u = await prisma.user.deleteMany({ where: { email: EMAIL } });
  console.log("Deleted users:", u.count);

  // Delete the registration record
  const r = await prisma.collegeRegistration.deleteMany({ where: { contactEmail: EMAIL } });
  console.log("Deleted registrations:", r.count);

  console.log("✅ Cleanup complete. You can now re-register with", EMAIL);
}

main().catch(console.error).finally(() => prisma.$disconnect());
