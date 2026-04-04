"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Award, BookOpen, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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

  if (loading) return <div className="p-12 text-center">Loading academic history...</div>;

  const latestGPA = summary?.gpaBySemester?.[0]?.gpa || "0.00";

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Academic Performance</h1>
           <p className="text-muted-foreground mt-1 text-lg">Your semester-wise results and aggregate GPA.</p>
        </div>
        <Card className="bg-primary text-primary-foreground min-w-[240px]">
           <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Current GPA</p>
                    <p className="text-4xl font-black">{latestGPA}</p>
                 </div>
                 <div className="bg-white/20 p-3 rounded-xl border border-white/30">
                    <GraduationCap className="h-8 w-8 text-white" />
                 </div>
              </div>
           </CardContent>
        </Card>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {summary?.gpaBySemester?.map((gpaData) => (
           <Card key={gpaData.semester} className="hover:border-primary transition-colors">
              <CardHeader className="bg-secondary/20 border-b">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Semester {gpaData.semester}</CardTitle>
                    <span className="text-2xl font-bold text-primary">{gpaData.gpa}</span>
                 </div>
              </CardHeader>
              <CardContent className="pt-4">
                 <div className="space-y-3">
                    {gpaData.breakDown.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">{sub.subject}</span>
                         <span className="font-semibold text-xs bg-secondary px-2 py-0.5 rounded italic">GP {sub.gradePoint}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t flex justify-between text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                       <span>Total Credits: {gpaData.totalCredits}</span>
                       <span>Status: Regular</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="space-y-4">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Recent Exam Results
         </h2>
         <Card>
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Exam Title</TableHead>
                     <TableHead>Subject</TableHead>
                     <TableHead>Score</TableHead>
                     <TableHead>Percentage</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Result</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {summary?.results?.map((res) => (
                    <TableRow key={res.id}>
                       <TableCell className="font-medium">{res.exam.title}</TableCell>
                       <TableCell className="text-muted-foreground">{res.exam.subject.name}</TableCell>
                       <TableCell>
                          <span className="font-semibold">{res.totalMarksObtained}</span>
                          <span className="text-xs text-muted-foreground ml-1">/ {res.exam.totalMarks}</span>
                       </TableCell>
                       <TableCell>{res.percentage.toFixed(1)}%</TableCell>
                       <TableCell>
                          <StatusBadge status={res.gradingStatus} />
                       </TableCell>
                       <TableCell>
                          {res.isPassed === true && <span className="text-emerald-500 font-bold">Pass</span>}
                          {res.isPassed === false && <span className="text-red-500 font-bold">Fail</span>}
                          {res.isPassed === null && <span className="text-muted-foreground">--</span>}
                       </TableCell>
                    </TableRow>
                  ))}
                  {(!summary?.results || summary.results.length === 0) && (
                    <TableRow>
                       <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No exam results found yet.
                       </TableCell>
                    </TableRow>
                  )}
               </TableBody>
            </Table>
         </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "MANUAL_REVIEW_PENDING") {
    return <span className="flex items-center text-amber-500 text-xs gap-1 font-medium"><Clock className="w-3 h-3"/> Pending</span>;
  }
  return <span className="flex items-center text-emerald-500 text-xs gap-1 font-medium"><CheckCircle2 className="w-3 h-3"/> Released</span>;
}
