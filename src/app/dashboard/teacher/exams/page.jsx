import ExamBuilder from "@/components/academic/exam-builder";

export default function ExamsPage() {
  return (
    <main className="p-6">
       <div className="max-w-5xl mx-auto">
          <ExamBuilder collegeId="fallback-session-id" />
       </div>
    </main>
  );
}
