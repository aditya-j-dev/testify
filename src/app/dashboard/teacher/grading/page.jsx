"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function GradingDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grading/pending")
      .then(res => res.json())
      .then(data => {
        if (data.success) setExams(data.exams);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Loading grading tasks...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grading Dashboard</h1>
        <p className="text-muted-foreground">Manage and review student submissions.</p>
      </div>

      {exams.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <CardTitle>All caught up!</CardTitle>
          <p className="text-muted-foreground mt-2">No exams currently have pending manual reviews.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{exam.subject}</span>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Clock className="w-3 h-3 mr-1" />
                    {exam.pendingCount} Pending
                  </div>
                </div>
                <CardTitle className="text-lg mt-1">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Last submission: {new Date(exam.updatedAt).toLocaleDateString()}
                </p>
                <Link href={`/dashboard/teacher/grading/${exam.id}`}>
                  <Button className="w-full justify-between" variant="outline">
                    View Submissions
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
