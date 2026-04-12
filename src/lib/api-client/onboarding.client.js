import { apiRequest } from "@/lib/api";
import { setToken } from "@/lib/auth";

/**
 * Registers a new college with its first admin user (trial onboarding).
 * @param {Object} data - { collegeName, address, adminName, adminEmail, adminPassword, adminContact, adminDesignation }
 * @returns the admin user object
 */
export async function onboardCollegeClient(data) {
  const res = await apiRequest("/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });

  setToken(res.token);

  return res.user;
}
