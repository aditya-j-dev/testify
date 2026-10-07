"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, User, Mail, Calendar, CheckCircle, Clock, RotateCw, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ExamAttemptsList() {
  const { id } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/grading/pending?examId=${id}`);
      const data = await res.json();
      if (data.success) setAttempts(data.attempts);
    } catch (e) { toast.error("Failed to load attempts"); }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`/api/org/exams/${id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Recovered ${data.count} student results!`);
        loadData();
      } else {
        toast.error("Sync failed: " + data.message);
      }
    } catch (e) { toast.error("Sync error occurred"); }
    setSyncing(false);
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading attempts...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/teacher/grading" className="hover:text-primary flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Total Submissions: {attempts.length}</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync} 
            disabled={syncing}
            className="rounded-xl font-bold bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 flex gap-2"
          >
            {syncing ? <RotateCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync & Recover Results
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{result.student.name}</span>
                      <span className="text-xs text-muted-foreground">{result.student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.attempt.submittedAt ? new Date(result.attempt.submittedAt).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={result.gradingStatus} />
                  </TableCell>
                  <TableCell>
                     <span className="font-semibold">{result.totalMarksObtained ?? "--"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/teacher/grading/attempt/${result.attemptId}`}>
                      <Button variant="secondary" size="sm">
                        Review & Grade
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    MANUAL_REVIEW_PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    AUTO_GRADED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FULLY_GRADED: "bg-blue-100 text-blue-700 border-blue-200"
  };

  const labels = {
    MANUAL_REVIEW_PENDING: "Pending Review",
    AUTO_GRADED: "Auto Graded",
    FULLY_GRADED: "Results Published"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
}
