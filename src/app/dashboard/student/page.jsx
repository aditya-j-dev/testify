"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  BookOpen, Play, GraduationCap, ArrowRight, Loader2,
  CheckCircle2, Clock, Trophy, AlertCircle,
} from "lucide-react";

const EXAM_STATUS_STYLE = {
  PUBLISHED: { label: "Upcoming", color: "bg-blue-500/15 text-blue-400" },
  ACTIVE: { label: "Live Now", color: "bg-emerald-500/15 text-emerald-400" },
  COMPLETED: { label: "Completed", color: "bg-slate-700 text-slate-400" },
};

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || "bg-indigo-500/10"}`}>
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/student/exams").then((r) => r.json()),
    ]).then(([statsRes, examsRes]) => {
      if (statsRes.success) setStats(statsRes.stats);
      if (examsRes.success) setExams(examsRes.exams || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const liveExams = exams.filter((e) => e.status === "ACTIVE");
  const upcomingExams = exams.filter((e) => e.status === "PUBLISHED");
  const completedExams = exams.filter((e) => e.status === "COMPLETED");

  // In-progress attempt from dashboard stats
  const inProgress = stats?.inProgressAttempt;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Welcome, {user?.name?.split(" ")[0] || "Student"} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Stay on top of your exams and results.</p>
      </div>

      {/* Resume exam alert */}
      {inProgress && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-indigo-300 font-medium text-sm">
                Resume: {inProgress.exam?.title}
              </p>
              <p className="text-indigo-400/70 text-xs mt-0.5">
                You have an exam in progress — pick up where you left off
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/student/take-exam/${inProgress.id}`}
            className="shrink-0 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Play className="w-3 h-3" /> Resume
          </Link>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Play}
            label="Available Exams"
            value={stats?.availableExams ?? exams.filter((e) => e.status !== "COMPLETED").length}
            sub={liveExams.length > 0 ? `${liveExams.length} live now!` : "Ready to attempt"}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats?.completedAttempts ?? completedExams.length}
            sub="Exams submitted"
          />
          <StatCard
            icon={Trophy}
            label="Avg. Score"
            value={stats?.avgPercentage != null ? `${stats.avgPercentage}%` : "—"}
            sub="Across all exams"
          />
        </div>
      )}

      {/* Live exams */}
      {liveExams.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Exams
          </h2>
          <div className="space-y-2">
            {liveExams.map((exam) => {
              const attempt = exam.attempts?.[0];
              const isAttempted = attempt && attempt.status !== "IN_PROGRESS";
              const isInProgress = attempt?.status === "IN_PROGRESS";

              return (
                <div key={exam.id} className="bg-slate-900 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                        Live Now
                      </span>
                      <p className="text-slate-200 font-medium text-sm truncate">{exam.title}</p>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {exam.subject?.name} · {exam.duration} mins
                      {exam.endTime && ` · Closes ${new Date(exam.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                  </div>
                  {isAttempted ? (
                    <span className="shrink-0 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg">Submitted</span>
                  ) : (
                    <Link
                      href={`/dashboard/student/take-exam/${exam.id}`}
                      className="shrink-0 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3" /> {isInProgress ? "Resume" : "Start"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All exams list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-300">All Exams</h2>
          <Link href="/dashboard/student/exams" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">No exams assigned yet</p>
            <p className="text-slate-500 text-sm">Your teacher hasn't assigned any exams to your batch yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 8).map((exam) => {
              const statusConf = EXAM_STATUS_STYLE[exam.status] || EXAM_STATUS_STYLE.PUBLISHED;
              const attempt = exam.attempts?.[0];
              const attemptLabel = attempt?.status === "SUBMITTED" ? "Submitted ✓"
                : attempt?.status === "IN_PROGRESS" ? "In Progress"
                : attempt?.status === "TIMED_OUT" ? "Timed Out"
                : null;

              return (
                <Link key={exam.id} href={`/dashboard/student/take-exam/${exam.id}`}>
                  <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                        <p className="text-slate-200 font-medium text-sm truncate">{exam.title}</p>
                      </div>
                      <p className="text-slate-500 text-xs">
                        {exam.subject?.name} · {exam.duration} mins
                        {attemptLabel && ` · ${attemptLabel}`}
                        {attempt?.score != null && ` · Score: ${attempt.score.toFixed(1)}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-slate-300 mb-4">Quick Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "My Exams", desc: "View available assessments", icon: BookOpen, href: "/dashboard/student/exams" },
            { label: "My Results", desc: "Check grades and feedback", icon: Trophy, href: "/dashboard/student/results" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl p-4 flex items-center gap-3 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 ml-auto shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
