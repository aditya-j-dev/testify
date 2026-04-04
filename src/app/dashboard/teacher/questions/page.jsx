import QuestionBankManager from "@/components/academic/question-bank-manager";

export default function QuestionsPage() {
  return (
    <main className="p-6">
       <div className="max-w-5xl mx-auto">
          <QuestionBankManager collegeId="fallback-session-id" />
       </div>
    </main>
  );
}
