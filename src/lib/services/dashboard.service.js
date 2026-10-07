import { apiRequest } from "@/lib/api";

export async function getDashboardStats() {
  const res = await apiRequest("/dashboard");
  return res.stats;
}