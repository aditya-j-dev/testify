"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { studentClient } from "@/lib/api-client/student.client";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Zap, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Save,
  Menu,
  Monitor,
  Maximize2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ActiveExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState({}); // questionId -> { selectedOptions, subjectiveText }
  const [flags, setFlags] = useState(new Set());
  
  const [timeLeft, setTimeLeft] = useState(null);
  const syncInterval = useRef(null);

  useEffect(() => {
    if (user && id) loadSession();
    return () => { if (syncInterval.current) clearInterval(syncInterval.current); };
  }, [user, id]);

  async function loadSession() {
    setLoading(true);
    try {
        const exRes = await orgClient.exams.getById(id);
        const atRes = await studentClient.exams.start(id);
        
        if (exRes.success && atRes.success) {
            setExam(exRes.exam);
            setAttempt(atRes.attempt);
            
            // Re-inflate answers from attempt
            const initial = {};
            atRes.attempt.answers?.forEach(ans => {
                initial[ans.questionId] = {
                    selectedOptions: ans.selectedOptions || [],
                    subjectiveText: ans.subjectiveText || ""
                };
            });
            setLocalAnswers(initial);
            
            // Start Hearbeat
            startSyncLoop(atRes.attempt.id);
            
            // Calculate Time
            const expiry = new Date(atRes.attempt.expiresAt).getTime();
            updateTimer(expiry);
        }
    } catch (e) {
        console.error("Session sync failed", e);
    }
    setLoading(false);
  }

  function updateTimer(expiry) {
    const ticker = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, expiry - now);
        setTimeLeft(diff);
        if (diff === 0) {
            clearInterval(ticker);
            handleFinalSubmit(true); // Auto-submit
        }
    }, 1000);
    return () => clearInterval(ticker);
  }

  function startSyncLoop(attemptId) {
    if (syncInterval.current) clearInterval(syncInterval.current);
    syncInterval.current = setInterval(async () => {
        await handleSync(attemptId);
    }, 30000); // 30s Heartbeat
  }

  async function handleSync(attemptId) {
      setSyncing(true);
      try {
          const answersToSync = Object.entries(localAnswers).map(([qId, data]) => ({
              questionId: qId,
              ...data
          }));
          await studentClient.attempts.sync(attemptId || attempt.id, answersToSync);
      } catch (e) { console.error("Sync Pulse Error", e); }
      setSyncing(false);
  }

  async function handleFinalSubmit(isAuto = false) {
    if (!isAuto && !confirm("Irreversible: Finalize and submit assessment?")) return;
    setSubmitting(true);
    try {
        // Final Sync
        await handleSync();
        const res = await studentClient.attempts.submit(attempt.id);
        if (res.success) {
            router.push(`/dashboard/student/exams`);
        }
    } catch (e) { alert("Submission protocol failed. Re-trying..."); }
    setSubmitting(false);
  }

  function updateAnswer(questionId, data) {
    setLocalAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...data }
    }));
  }

  function toggleFlag(questionId) {
    setFlags(prev => {
        const next = new Set(prev);
        if (next.has(questionId)) next.delete(questionId);
        else next.add(questionId);
        return next;
    });
  }

  const formatTime = (ms) => {
    if (ms === null) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic">Synchronizing Active Session Hub...</div>;
  if (!exam || !attempt) return <div className="p-20 text-center font-black uppercase text-rose-500">Security Access Denied. Session Inactive.</div>;

  const currentQuestion = exam.questions[currentIndex];
  const qData = localAnswers[currentQuestion.questionId] || { selectedOptions: [], subjectiveText: "" };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* High-Fi Header: Real-time Monitor */}
       <header className="bg-slate-900 text-white h-24 flex items-center px-8 border-b-4 border-indigo-600 shadow-2xl z-40 sticky top-0">
          <div className="flex items-center gap-6 flex-1">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight leading-none">{exam.title}</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mt-1.5 flex items-center gap-2">
                   <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> Synchronized with Global Cluster
                </p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 min-w-[220px] justify-center">
                <Clock className={`w-5 h-5 ${timeLeft < 300000 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
                <span className={`text-2xl font-black tabular-nums tracking-tighter ${timeLeft < 300000 ? 'text-rose-500' : 'white'}`}>
                   {formatTime(timeLeft)}
                </span>
             </div>
             
             <div className="h-10 w-10 rounded-full border-2 border-white/10 flex items-center justify-center">
                {syncing ? <Save className="w-4 h-4 text-emerald-400 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-white/20" />}
             </div>

             <Button 
                onClick={() => handleFinalSubmit()}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 px-8 rounded-2xl shadow-xl transition-all active:scale-90 flex gap-2 border-b-4 border-emerald-800"
             >
                <Zap className="w-5 h-5 fill-white" /> Final Submission
             </Button>
          </div>
       </header>

       <div className="flex-1 flex overflow-hidden">
          {/* Left: Navigation Grid */}
          <aside className="w-[340px] bg-white border-r border-muted/20 p-8 flex flex-col gap-8 z-30 transition-all">
             <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Index Navigator</h3>
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Deterministic Sequence Order</p>
             </div>

             <div className="grid grid-cols-5 gap-3">
                {exam.questions.map((q, i) => {
                   const isAnswered = !!localAnswers[q.questionId]?.selectedOptions?.length || !!localAnswers[q.questionId]?.subjectiveText;
                   const isFlagged = flags.has(q.questionId);
                   const isCurrent = currentIndex === i;
                   
                   return (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all relative border-2 ${
                           isCurrent ? "bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-600/20" :
                           isFlagged ? "bg-amber-50 border-amber-400 text-amber-700" :
                           isAnswered ? "bg-emerald-50 border-emerald-400 text-emerald-700" :
                           "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                         {i + 1}
                         {isFlagged && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" />}
                      </button>
                   );
                })}
             </div>

             <div className="mt-auto space-y-4 pt-8 border-t border-muted/10">
                <div className="flex items-center justify-between px-2">
                   <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Progress Payload</span>
                   <span className="text-xs font-black text-slate-900">{Object.keys(localAnswers).length} / {exam.questions.length}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(Object.keys(localAnswers).length / exam.questions.length) * 100}%` }} />
                </div>
             </div>
          </aside>

          {/* Main: Question Workspace */}
          <main className="flex-1 bg-slate-50/50 p-12 overflow-y-auto relative">
             <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
                
                {/* Protocol Context */}
                <div className="flex items-center justify-between pb-6 border-b border-muted/20">
                   <Badge variant="secondary" className="font-black text-[10px] uppercase px-4 py-1.5 bg-slate-200/50 text-slate-700 tracking-widest">{currentQuestion.question?.type || 'Question Asset'}</Badge>
                   <div className="flex items-center gap-6">
                      <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                         <Zap className="w-3 h-3" /> Potential Max Score: <span className="text-slate-900">{currentQuestion.marks} PTS</span>
                      </div>
                      <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => toggleFlag(currentQuestion.questionId)}
                         className={`h-9 px-4 rounded-full font-black text-[10px] uppercase flex gap-2 transition-all ${flags.has(currentQuestion.questionId) ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-100'}`}
                      >
                         <Flag className={`w-3 h-3 ${flags.has(currentQuestion.questionId) ? 'fill-amber-600' : ''}`} /> Review Protocol
                      </Button>
                   </div>
                </div>

                {/* The Prompt */}
                <div className="space-y-8">
                   <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                      {currentQuestion.questionTextSnapshot || currentQuestion.question?.text}
                   </h2>

                   {/* Answer Area */}
                   <div className="grid gap-4 mt-12">
                      {currentQuestion.question?.type.startsWith('MCQ') ? (
                         <div className="grid gap-3">
                            {(currentQuestion.optionsSnapshot ? JSON.parse(currentQuestion.optionsSnapshot) : currentQuestion.question.options)?.map(opt => {
                               const isSelected = qData.selectedOptions.includes(opt.id || opt.label);
                               const multiple = currentQuestion.question.type === 'MCQ_MULTIPLE';

                               return (
                                 <div 
                                   key={opt.id || opt.label}
                                   onClick={() => {
                                      let next = [...qData.selectedOptions];
                                      if (multiple) {
                                         if (isSelected) next = next.filter(i => i !== (opt.id || opt.label));
                                         else next.push(opt.id || opt.label);
                                      } else {
                                         next = [opt.id || opt.label];
                                      }
                                      updateAnswer(currentQuestion.questionId, { selectedOptions: next });
                                   }}
                                   className={`p-6 rounded-[28px] border-2 cursor-pointer transition-all flex items-center gap-6 group ${
                                      isSelected ? "bg-indigo-50 border-indigo-600 shadow-xl shadow-indigo-600/5 translate-x-2" : "bg-white border-transparent hover:border-slate-200"
                                   }`}
                                 >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                       isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                    }`}>
                                       {opt.label}
                                    </div>
                                    <span className={`text-base font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                       {opt.text}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 ml-auto text-indigo-600 animate-in zoom-in" />}
                                 </div>
                               )
                            })}
                         </div>
                      ) : (
                         <textarea 
                           className="w-full h-80 p-10 rounded-[40px] bg-white border-none shadow-custom font-medium text-lg leading-relaxed focus:ring-[12px] focus:ring-indigo-100/30 transition-all resize-none"
                           placeholder="Type your academic response here..."
                           value={qData.subjectiveText}
                           onChange={e => updateAnswer(currentQuestion.questionId, { subjectiveText: e.target.value })}
                         />
                      )}
                   </div>
                </div>

                {/* Global Navigation */}
                <div className="flex items-center justify-between pt-12">
                   <Button 
                      variant="ghost" 
                      className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-30" 
                      onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                   >
                       <ChevronLeft className="w-5 h-5 mr-3" /> Backtrack
                   </Button>
                   <Button 
                      className="h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-[11px]"
                      onClick={() => {
                         if (currentIndex < exam.questions.length - 1) setCurrentIndex(prev => prev + 1);
                         else handleFinalSubmit();
                      }}
                   >
                      {currentIndex === exam.questions.length - 1 ? "Final Validation" : "Progress Payload"} <ChevronRight className="w-5 h-5 ml-3" />
                   </Button>
                </div>
             </div>

             {/* Dynamic Tooltip */}
             <div className="absolute bottom-12 left-12 flex items-center gap-3 h-10 px-4 rounded-full bg-white shadow-xl border border-muted/10 opacity-60 hover:opacity-100 transition-opacity">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Sync Pulsing: Global Network Standard</span>
             </div>
          </main>
       </div>
    </div>
  );
}
