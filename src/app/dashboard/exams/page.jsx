"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import ExamsList from "@/components/exams/exams-list";

export default function ExamsPage() {
  return (
    <ProtectedRoute>
      <ExamsList />
    </ProtectedRoute>
  );
}