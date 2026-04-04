import { apiRequest } from "@/lib/api";

export async function getExamsService() {
  const res = await apiRequest("/exams");
  return res.exams;
}