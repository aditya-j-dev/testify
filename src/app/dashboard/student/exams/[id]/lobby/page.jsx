"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { studentClient } from "@/lib/api-client/student.client";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Info, Clock, FileText, AlertTriangle, Play, ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ExamLobbyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (user && id) loadExam();
  }, [user, id]);

  async function loadExam() {
    setLoading(true);
    try {
      const res = await orgClient.exams.getById(id);
      if (res.success) setExam(res.exam);
    } catch (e) { console.error("Load failed", e); }
    setLoading(false);
  }

  async function handleStart() {
    setStarting(true);
    try {
       const res = await studentClient.exams.start(id);
       if (res.success) {
          router.push(`/dashboard/student/exams/${id}/active`);
       } else {
          alert(res.message);
       }
    } catch (e) { alert("Initialization failed"); }
    setStarting(false);
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic">Verifying Admission Eligibility...</div>;
  if (!exam) return <div className="p-20 text-center font-black uppercase text-rose-500">Assessment Data Corrupted or Unavailable.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 mt-12 px-4">
       {/* Breadcrumbs & Header */}
       <div className="flex items-center gap-6">
          <Link href="/dashboard/student/exams">
             <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full border border-muted/10 hover:bg-slate-50 transition-all active:scale-95">
                <ChevronLeft className="w-7 h-7" />
             </Button>
          </Link>
          <div>
             <h1 className="text-4xl font-black text-slate-900 leading-none tracking-tight">Entrance Gateway</h1>
             <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.3em] mt-2">Protocol: {exam.title}</p>
          </div>
       </div>

       <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
             <Card className="border-none shadow-2xl rounded-[40px] bg-white overflow-hidden border-b-8 border-b-indigo-100">
                <CardHeader className="p-10 border-b border-muted/10">
                   <div className="flex items-center gap-4 mb-3">
                      <Badge className="bg-indigo-50 text-indigo-700 font-black border-none px-4 py-1.5 uppercase text-[10px] tracking-widest">Assessment Profile</Badge>
                   </div>
                   <CardTitle className="text-3xl font-black">{exam.title}</CardTitle>
                   <CardDescription className="font-bold text-slate-400 mt-2 uppercase tracking-widest text-[11px] flex gap-3">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> {exam.duration}m Limit</span>
                      <span className="flex items-center gap-1.5 text-emerald-600"><Zap className="w-4 h-4" /> {exam.totalMarks} Weightage</span>
                   </CardDescription>
                </CardHeader>
                <CardContent className="p-10 bg-slate-50/50">
                   <div className="space-y-6">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                         <ShieldCheck className="w-5 h-5 text-emerald-500" /> Conduct Integrity Protocol
                      </h3>
                      <div className="grid gap-4">
                         {[
                            "FullScreen engagement is mandatory.",
                            "Global synchronization occurs every 30 seconds.",
                            "Tab switching triggers institutional flag alerts.",
                            "Final submission is irreversible and deterministic."
                         ].map((rule, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                               <div className="w-8 h-8 rounded-xl bg-white border border-muted/10 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{i+1}</div>
                               <p className="font-bold text-slate-600 text-sm tracking-tight">{rule}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </CardContent>
             </Card>

             <div className="flex items-center gap-4 p-8 bg-amber-50 rounded-[32px] border-2 border-amber-100 border-dashed animate-in fade-in slide-in-from-bottom-5">
                <AlertTriangle className="w-10 h-10 text-amber-600 animate-pulse" />
                <div>
                   <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest leading-none">Security Alert</h4>
                   <p className="text-sm font-bold text-amber-700 mt-1 opacity-70 leading-tight">Closing this window or disconnecting during the exam may impact synchronization integrity.</p>
                </div>
             </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
             <Card className="rounded-[40px] border-none shadow-2xl bg-indigo-600 text-white overflow-hidden p-8 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-white/10 rounded-[32px] mb-8 shadow-inner shadow-black/5 animate-bounce">
                   <Play className="w-10 h-10 fill-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-none">Ready for Launch</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-2">Initialize Exam Runner</p>
                
                <Button 
                   onClick={handleStart}
                   disabled={starting}
                   className="w-full h-16 mt-10 rounded-2xl bg-white text-indigo-700 hover:bg-slate-50 font-black uppercase tracking-[0.1em] shadow-2xl text-[11px] active:scale-95 transition-all flex gap-3"
                >
                   {starting ? "Processing Admission..." : "Launch Assessment Engine"} <ChevronRight className="w-4 h-4" />
                </Button>
                
                <p className="mt-6 text-[9px] font-bold opacity-40 uppercase tracking-widest leading-relaxed px-4">By initiating, you agree to the institution's examination code of conduct.</p>
             </Card>

             <Card className="rounded-[32px] border border-muted/10 p-6 flex items-center gap-4 bg-white opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <Info className="w-6 h-6 text-indigo-400" />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Support Registry: System Check PASSED</div>
             </Card>
          </div>
       </div>
    </div>
  );
}
