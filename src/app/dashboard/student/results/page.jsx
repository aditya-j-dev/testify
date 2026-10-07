"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GraduationCap, Award, BookOpen, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG = {
  MANUAL_REVIEW_PENDING: { 
    cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", 
    label: "Pending", 
    Icon: Clock 
  },
  AUTO_GRADED: { 
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", 
    label: "Released", 
    Icon: CheckCircle2 
  },
  FULLY_GRADED: { 
    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", 
    label: "Released", 
    Icon: CheckCircle2 
  },
  PUBLISHED: { 
    cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", 
    label: "Published", 
    Icon: CheckCircle2 
  }
};

export default function StudentResults() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSummary(data.summary);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Loading academic history...</span>
      </div>
    );
  }

  const latestGPA = summary?.gpaBySemester?.[0]?.gpa || "0.00";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-100">Academic Performance</h1>
           <p className="text-slate-500 mt-1 text-sm">Your semester-wise results and aggregate GPA breakdown.</p>
        </div>
        <div className="bg-indigo-600 rounded-2xl p-5 min-w-[240px] border border-indigo-500/50 shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-16 w-16 text-white" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 opacity-80">Current GPA</p>
              <p className="text-4xl font-black text-white mt-1 tracking-tighter">{latestGPA}</p>
           </div>
        </div>
      </header>

      {/* ── Semester GPA Cards ───────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {summary?.gpaBySemester?.map((gpaData) => (
           <div key={gpaData.semester} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                 <h3 className="text-sm font-semibold text-slate-300">Semester {gpaData.semester}</h3>
                 <span className="text-xl font-bold text-indigo-400">{gpaData.gpa}</span>
              </div>
              <div className="p-4 space-y-3">
                 {gpaData.breakDown.map((sub, idx) => (
                   <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium truncate max-w-[140px]">{sub.subject}</span>
                      <span className="font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">GP {sub.gradePoint.toFixed(1)}</span>
                   </div>
                 ))}
                 <div className="pt-3 border-t border-slate-800 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <span>Credits: {gpaData.totalCredits}</span>
                    <span className="text-emerald-500/70">Regular</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* ── Recent Exam Results ──────────────────────────────────────── */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 px-1">
            <Award className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Exam Results</h2>
         </div>
         
         <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                 <TableHeader className="bg-slate-800/30">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                       <TableHead className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Exam Title</TableHead>
                       <TableHead className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Subject</TableHead>
                       <TableHead className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Score</TableHead>
                       <TableHead className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
                       <TableHead className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Result</TableHead>
                       <TableHead className="text-right text-slate-500 text-[10px] font-bold uppercase tracking-wider pr-6">Action</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {summary?.results?.map((res) => (
                      <TableRow key={res.id} className="border-slate-800 hover:bg-slate-800/20 transition-colors">
                         <TableCell className="font-semibold text-slate-200 py-4">{res.exam.title}</TableCell>
                         <TableCell className="text-slate-500 text-xs">{res.exam.subject.name}</TableCell>
                         <TableCell>
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-200">{res.totalMarksObtained} <span className="text-xs text-slate-600 font-normal">/ {res.exam.totalMarks}</span></span>
                               <span className="text-[10px] text-slate-500 mt-0.5">{res.percentage.toFixed(1)}%</span>
                            </div>
                         </TableCell>
                         <TableCell>
                            <StatusBadge status={res.gradingStatus} />
                         </TableCell>
                         <TableCell>
                            {res.isPassed === true && <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Pass</span>}
                            {res.isPassed === false && <span className="text-rose-500 font-bold text-xs uppercase tracking-wider">Fail</span>}
                            {res.isPassed === null && <span className="text-slate-600 text-xs italic">--</span>}
                         </TableCell>
                         <TableCell className="text-right pr-6">
                            <Link href={`/dashboard/student/results/${res.attemptId}`}>
                               <Button variant="outline" size="sm" className="rounded-xl border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs h-8 group active:scale-95 transition-all">
                                  View Details <ChevronRight className="w-3.5 h-3.5 ml-1.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                               </Button>
                            </Link>
                         </TableCell>
                      </TableRow>
                    ))}
                    {(!summary?.results || summary.results.length === 0) && (
                      <TableRow className="hover:bg-transparent">
                         <TableCell colSpan={6} className="h-40 text-center py-10">
                            <div className="flex flex-col items-center gap-3">
                               <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-slate-600" />
                               </div>
                               <p className="text-slate-500 text-sm font-medium">No exam results found yet.</p>
                               <p className="text-slate-600 text-xs">Complete your first exam to see your performance here.</p>
                            </div>
                         </TableCell>
                      </TableRow>
                    )}
                 </TableBody>
              </Table>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.AUTO_GRADED;
  const { cls, label, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls} uppercase tracking-wider`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
