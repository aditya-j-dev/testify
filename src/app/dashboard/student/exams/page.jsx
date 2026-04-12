"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { studentClient } from "@/lib/api-client/student.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, FileText, ChevronRight, Zap, History, Calendar } from "lucide-react";
import Link from "next/link";

export default function StudentExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadExams();
  }, [user]);

  async function loadExams() {
    setLoading(true);
    try {
      const res = await studentClient.exams.list();
      if (res.success) setExams(res.exams);
    } catch (e) { console.error("Load failed", e); }
    setLoading(false);
  }

  const formatDateTime = (date) => {
     if (!date) return "";
     return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
     });
  };

  const now = new Date();
  
  const activeExams = exams.filter(e => {
    const isActuallyActive = e.status === 'ACTIVE';
    const isInWindow = e.status === 'PUBLISHED' && e.startTime && new Date(e.startTime) <= now && (!e.endTime || new Date(e.endTime) >= now);
    const isWithinTime = !e.endTime || new Date(e.endTime) >= now;
    const notCompleted = !e.attempts[0] || e.attempts[0].status === 'IN_PROGRESS';
    return (isActuallyActive || isInWindow) && isWithinTime && notCompleted;
  });

  const upcomingExams = exams.filter(e => 
    e.status === 'PUBLISHED' && e.startTime && new Date(e.startTime) > now
  );

  const pastExams = exams.filter(e => {
    const isCompletedStatus = e.status === 'COMPLETED';
    const isPastWindow = e.endTime && new Date(e.endTime) < now;
    const hasFinishedAttempt = e.attempts[0]?.status === 'SUBMITTED' || e.attempts[0]?.status === 'TIMED_OUT' || e.attempts[0]?.status === 'COMPLETED' || e.attempts[0]?.status === 'CHEATED';
    return isCompletedStatus || isPastWindow || hasFinishedAttempt;
  });

  return (
    <div className="space-y-10 container mx-auto pb-20 mt-8 px-4">
      {/* Welcome & Context */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-muted/10 shadow-custom">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none capitalize">Academic Assessments</h1>
          <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">{user?.branch?.name || 'Assigned curricula'} • {user?.batch?.name || 'Class of 2024'}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase">Available</span>
              <span className="text-xl font-black text-indigo-700">{activeExams.length}</span>
           </div>
        </div>
      </div>

      {/* Active Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Active Now</h2>
        </div>

        {activeExams.length === 0 ? (
          <Card className="p-20 text-center border-4 border-dashed rounded-[48px] bg-muted/5 flex flex-col items-center">
             <Calendar className="w-12 h-12 text-muted-foreground/20 mb-4" />
             <h3 className="text-xl font-black text-slate-900/40 uppercase tracking-tight italic">No Active Sessions</h3>
             <p className="text-xs font-bold text-muted-foreground/30 uppercase mt-1">Check the schedule for upcoming tests</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeExams.map(exam => {
              const attempt = exam.attempts[0];
              const isStarted = attempt?.status === 'IN_PROGRESS';
              
              return (
                <Card key={exam.id} className="group relative overflow-hidden transition-all hover:shadow-2xl border-none shadow-custom rounded-[32px] bg-white dark:bg-slate-900 border-b-4 border-b-emerald-100">
                  <div className="absolute top-0 right-0 p-6">
                     {isStarted && <Badge className="bg-emerald-500 text-white font-black animate-pulse px-4">RESUME</Badge>}
                  </div>
                  <CardHeader className="p-8 pb-4">
                    <Badge variant="outline" className="w-fit mb-3 text-[10px] font-black uppercase tracking-widest bg-slate-50 border-muted/10">{exam.subject?.name}</Badge>
                    <CardTitle className="text-2xl font-black group-hover:text-indigo-600 transition-colors">{exam.title}</CardTitle>
                    <div className="flex items-center gap-5 mt-4 text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-60">
                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> {exam.duration}m</span>
                       <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-400" /> {exam.totalMarks} Pts</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 flex gap-4">
                    <Link href={`/dashboard/student/exams/${exam.id}/lobby`} className="flex-1">
                      <Button className="w-full h-14 rounded-2xl bg-slate-900 border-b-4 border-slate-700 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] active:scale-95 active:border-b-0 transition-all flex gap-3">
                         {isStarted ? "Continue Assessment" : "Launch Session"} <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Upcoming Section */}
      {upcomingExams.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <Calendar className="w-6 h-6 text-indigo-500" />
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Upcoming Assessments</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingExams.map(exam => (
              <Card key={exam.id} className="p-6 rounded-[32px] border border-muted/10 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-indigo-50">
                <div className="flex justify-between items-start mb-4">
                   <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-50">{exam.subject?.name}</Badge>
                   <div className="text-[10px] font-black text-indigo-500 uppercase">Starts {formatDateTime(exam.startTime)}</div>
                </div>
                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-4">{exam.title}</h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                   <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration}m</span>
                   <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {exam.totalMarks} Pts</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* History Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2 opacity-50">
           <History className="w-6 h-6 text-slate-400" />
           <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Participation History</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           {pastExams.map(exam => {
             const attempt = exam.attempts[0];
             const isAttempted = !!attempt && (attempt.status === 'SUBMITTED' || attempt.status === 'TIMED_OUT' || attempt.status === 'COMPLETED' || attempt.status === 'CHEATED');
             const isCheatedAttempt = attempt?.status === 'CHEATED';
             const isMissed = !isAttempted && new Date(exam.endTime) < now;

             return (
              <Card key={exam.id} className={`p-6 rounded-[28px] border border-muted/10 transition-all ${isAttempted ? 'bg-white shadow-sm' : 'bg-slate-50/50 opacity-70'}`}>
                 <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="text-[9px] font-black opacity-50 uppercase">{exam.subject?.name}</Badge>
                    {isCheatedAttempt ? (
                       <Badge className="bg-rose-600 text-white border-none font-black text-[8px] uppercase tracking-wider animate-pulse">Cheated</Badge>
                    ) : isAttempted ? (
                       <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[8px] uppercase tracking-wider">Attempted</Badge>
                    ) : (
                       <Badge className="bg-rose-100 text-rose-700 border-none font-black text-[8px] uppercase tracking-wider">Not Attempted</Badge>
                    )}
                 </div>
                 <h4 className="font-black text-slate-800 dark:text-white leading-tight">{exam.title}</h4>
                 <div className="mt-4 flex items-center justify-between border-t border-muted/5 pt-4">
                    <div className="text-[9px] font-black uppercase text-muted-foreground/40 italic">
                       {isCheatedAttempt ? 'Terminated for Breach' : isAttempted ? `Result: ${attempt.status}` : 'Window Closed'}
                    </div>
                    <Badge variant="outline" className={`font-black border-muted/10 text-[9px] uppercase ${isCheatedAttempt ? 'text-rose-600 border-rose-100' : ''}`}>{isCheatedAttempt ? 'Violation' : exam.status}</Badge>
                 </div>
              </Card>
             );
           })}
        </div>
      </section>
    </div>
  );
}
