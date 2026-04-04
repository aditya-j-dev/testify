import TestEngine from "@/components/academic/test-engine";

export default function TakeExamPage({ params }) {
  // In a real app we would hit API "START" here using the attemptId or examId passed in params
  return (
    <main className="p-6 h-[calc(100vh-64px)] overflow-y-auto bg-secondary/10">
       <div className="max-w-6xl mx-auto">
          <TestEngine attemptId={params.id} />
       </div>
    </main>
  );
}
