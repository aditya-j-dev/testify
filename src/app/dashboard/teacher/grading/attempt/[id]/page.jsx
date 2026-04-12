"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertCircle, Save, ArrowLeft, User, Book, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AttemptGrader() {
  const { id } = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({}); // { answerId: { marks, feedback } }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/grading/pending?attemptId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAttempt(data.attempt);
          // Pre-populate grades with existing data if any
          const initialGrades = {};
          data.attempt.answers.forEach(ans => {
            if (ans.question.type === "SUBJECTIVE") {
               initialGrades[ans.id] = { marks: ans.marksObtained || 0, feedback: ans.teacherFeedback || "" };
            }
          });
          setGrades(initialGrades);
        }
        setLoading(false);
      });
  }, [id]);

  const handleGradeChange = (answerId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: { ...prev[answerId], [field]: value }
    }));
  };

  const submitGrade = async (answerId) => {
    setSaving(true);
    const { marks, feedback } = grades[answerId];
    try {
      const res = await fetch("/api/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, marksObtained: marks, feedback })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Grade saved successfully");
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (e) {
      toast.error("Error saving grade");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-center">Loading attempt details...</div>;
  if (!attempt) return <div className="p-12 text-center text-red-500">Attempt not found</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">{attempt.user.name}</span>
              <span className="text-xs text-muted-foreground">{attempt.user.email}</span>
           </div>
           <div className="p-2 bg-primary/10 rounded-full">
              <User className="w-5 h-5 text-primary" />
           </div>
        </div>
      </div>

      <header className="bg-secondary/30 p-6 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-bold">{attempt.exam.title}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center"><Book className="w-4 h-4 mr-1"/> Semester {attempt.exam.semester}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> Duration: {attempt.exam.duration} mins</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Total Marks: {attempt.exam.totalMarks}</span>
            </div>
         </div>
         {attempt.result && (
            <div className="text-right">
               <div className="text-3xl font-black text-indigo-600">{attempt.result.totalMarksObtained} <span className="text-sm text-muted-foreground font-normal">/ {attempt.exam.totalMarks}</span></div>
               <div className="text-[10px] uppercase font-bold tracking-widest opacity-40">Final Score</div>
            </div>
         )}
      </header>

      <div className="space-y-6">
        {attempt.exam.questions.map((eq, index) => {
          const answer = attempt.answers.find(a => a.questionId === eq.questionId);
          const isMcq = eq.question.type !== "SUBJECTIVE";
          
          return (
            <Card key={eq.id} className={isMcq ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-amber-400"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-md font-semibold">
                     Question {index + 1} 
                     <span className="ml-2 text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                       {eq.question.type} • {eq.marks} Marks
                     </span>
                   </CardTitle>
                </div>
                <p className="mt-2 text-sm">{eq.questionTextSnapshot}</p>
              </CardHeader>

              <CardContent className="pt-4 border-t bg-secondary/10">
                <Label className="text-xs uppercase text-muted-foreground">Student's Response</Label>
                
                {isMcq ? (
                  <div className="mt-2 space-y-2">
                      {(() => {
                        const originalOptions = eq.optionsSnapshot ? JSON.parse(eq.optionsSnapshot) : (eq.question?.options || []);
                        const getDisplay = (val) => {
                          const opt = originalOptions.find(o => o.id === val || o.label === val);
                          return opt ? `[${opt.label}] ${opt.text}` : val;
                        };

                        return (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              {answer?.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span>Selected Options: <strong>{
                                answer?.selectedOptions?.map(getDisplay).join(", ") || "No response"
                              }</strong></span>
                            </div>
                            {!answer?.isCorrect && (
                              <p className="text-xs text-muted-foreground ml-6 italic">
                                Correct Answers: {
                                  eq.correctAnswersSnapshot?.map(getDisplay).join(", ") || "None"
                                }
                              </p>
                            )}
                          </>
                        );
                      })()}
                  </div>
                ) : (
                  <div className="mt-2 p-4 bg-white border rounded text-sm italic whitespace-pre-wrap">
                    {answer?.subjectiveText || "No response provided."}
                  </div>
                )}
              </CardContent>

              {!isMcq && answer && (
                <CardFooter className="flex flex-col gap-4 pt-6 border-t bg-amber-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor={`marks-${answer.id}`}>Marks Obtained</Label>
                      <Input 
                        id={`marks-${answer.id}`}
                        type="number" 
                        max={eq.marks} 
                        value={grades[answer.id]?.marks || 0}
                        onChange={(e) => handleGradeChange(answer.id, "marks", parseFloat(e.target.value))}
                      />
                      <p className="text-[10px] text-muted-foreground italic">Max: {eq.marks}</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor={`feedback-${answer.id}`}>Teacher Feedback</Label>
                      <Input 
                        id={`feedback-${answer.id}`}
                        placeholder="Great work, but explain X more..."
                        value={grades[answer.id]?.feedback || ""}
                        onChange={(e) => handleGradeChange(answer.id, "feedback", e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        className="w-full" 
                        onClick={() => submitGrade(answer.id)}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-2" /> Save Grade
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
