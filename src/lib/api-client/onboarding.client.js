import { apiRequest } from "@/lib/api";

/**
 * Submits the "Get Started" registration form.
 * Creates a CollegeRegistration + provisions the college.
 * Sends a setup email to the admin — no token is returned.
 *
 * @param {Object} data - { collegeName, address, adminName, adminEmail, adminContact, adminDesignation }
 * @returns { success: true, email: string }
 */
export async function onboardCollegeClient(data) {
  const res = await apiRequest("/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res;
}
