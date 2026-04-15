"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, User, Book, Clock, FileText, Loader2, MessageSquare, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentAttemptDetail() {
  const { attemptId } = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/results/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAttempt(data.attempt);
        }
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Retrieving result breakdown...</span>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <p className="text-slate-400 font-medium text-lg">Detailed result not found</p>
        <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-slate-800 bg-slate-900">
          Go Back
        </Button>
      </div>
    );
  }

  const result = attempt.result;
  const exam = attempt.exam;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 px-4">
      {/* ── Header Navigation ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors -ml-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
        </Button>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-slate-200 font-semibold text-sm">{attempt.user.name}</p>
              <p className="text-slate-600 text-xs">{attempt.user.email}</p>
           </div>
           <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
           </div>
        </div>
      </div>

      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative">
         {/* Background accent */}
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="w-32 h-32 text-indigo-400" />
         </div>
         
         <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <span className="inline-flex px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                        Performance Report
                     </span>
                     <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        result?.isPassed ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                     }`}>
                        {result?.isPassed ? 'Passed' : 'Failed'}
                     </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{exam.title}</h1>
                  <div className="flex flex-wrap gap-5 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-2 saturate-0 opacity-70"><Book className="w-4 h-4"/> Sem {exam.semester}</span>
                      <span className="flex items-center gap-2 saturate-0 opacity-70"><Clock className="w-4 h-4"/> {exam.duration} mins</span>
                      <span className="flex items-center gap-2 saturate-0 opacity-70"><FileText className="w-4 h-4"/> {exam.totalMarks} Total marks</span>
                  </div>
               </div>
               
               {result && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-center min-w-[180px]">
                     <div className="text-4xl font-black text-slate-100 tracking-tighter">
                        {result.totalMarksObtained} <span className="text-sm text-slate-600 font-normal">/ {exam.totalMarks}</span>
                     </div>
                     <div className="mt-1 text-sm font-bold text-indigo-400">{result.percentage.toFixed(1)}% Score</div>
                     <div className="mt-4 pt-4 border-t border-slate-700/50 text-[10px] uppercase font-bold tracking-widest text-slate-600">
                        {result.gradingStatus === 'MANUAL_REVIEW_PENDING' ? 'Preliminary Results' : 'Final Assessment'}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* ── Questions Breakdown ─────────────────────────────────────── */}
      <div className="space-y-6">
         <div className="flex items-center gap-2 px-1">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Question Breakdown</h2>
         </div>

         {exam.questions.map((eq, index) => {
           const answer = attempt.answers.find(a => a.questionId === eq.questionId);
           const isMcq = eq.question.type !== "SUBJECTIVE";
           const isAnswered = !!answer;
           
           return (
             <div key={eq.examId + eq.questionId} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-700">
                <div className="p-6">
                   <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-400 border border-slate-700">
                            {index + 1}
                         </div>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded">
                            {eq.question.type.replace('_', ' ')}
                         </span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`text-sm font-bold ${answer?.isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {answer?.marksObtained ?? 0} <span className="text-[10px] font-normal text-slate-600">/ {eq.marks} pts</span>
                         </span>
                      </div>
                   </div>

                   <p className="text-slate-200 text-sm leading-relaxed mb-6 font-medium">
                      {eq.questionTextSnapshot}
                   </p>

                   <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-800/50">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> Your Response
                      </p>

                      {isMcq ? (
                        <div className="space-y-3">
                           {(() => {
                              const originalOptions = eq.optionsSnapshot ? JSON.parse(eq.optionsSnapshot) : (eq.question?.options || []);
                              const getDisplay = (val) => {
                                 const opt = originalOptions.find(o => o.id === val || o.label === val);
                                 return opt ? `[${opt.label}] ${opt.text}` : val;
                              };

                              const correctLabels = eq.correctAnswersSnapshot || [];
                              const selectedLabels = answer?.selectedOptions || [];

                              return (
                                 <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                       {selectedLabels.length > 0 ? (
                                          selectedLabels.map((label, idx) => {
                                             const isLabelCorrect = correctLabels.includes(label);
                                             return (
                                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                                                   isLabelCorrect ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                                                }`}>
                                                   {isLabelCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                   {getDisplay(label)}
                                                </div>
                                             );
                                          })
                                       ) : (
                                          <div className="text-slate-600 italic text-sm py-1 flex items-center gap-2">
                                             <AlertCircle className="w-4 h-4 opacity-50" /> No response provided
                                          </div>
                                       )}
                                    </div>

                                    {!answer?.isCorrect && correctLabels.length > 0 && (
                                       <div className="mt-2 pt-4 border-t border-slate-700/50">
                                          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 mb-2">Correct Method</p>
                                          <div className="flex flex-wrap gap-2">
                                             {correctLabels.map((label, idx) => (
                                                <span key={idx} className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs font-medium">
                                                   {getDisplay(label)}
                                                </span>
                                             ))}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              );
                           })()}
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-300 text-sm whitespace-pre-wrap leading-relaxed italic opacity-80">
                              {answer?.subjectiveText || "No response provided."}
                           </div>

                           {answer?.teacherFeedback && (
                              <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl space-y-2">
                                 <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Teacher Feedback
                                 </p>
                                 <p className="text-slate-300 text-sm leading-relaxed">
                                    {answer.teacherFeedback}
                                 </p>
                              </div>
                           )}
                        </div>
                      )}
                   </div>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
