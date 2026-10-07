"use client";

import ProtectedRoute from "@/components/auth/protected-route";
//import CreateExamForm from "@/components/exams/create-exam-form";

export default function CreateExamPage() {

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <CreateExamForm />
    </ProtectedRoute>
  );

}