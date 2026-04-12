"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  BookOpen, Clock, ClipboardCheck, Plus, ArrowRight, Loader2,
  PenLine, Users, AlertCircle,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, urgent }) {
  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 space-y-3 ${urgent ? "border-amber-500/30" : "border-slate-800"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color || "bg-indigo-500/10"}`}>
        <Icon className={`w-5 h-5 ${urgent ? "text-amber-400" : "text-indigo-400"}`} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${urgent && value > 0 ? "text-amber-400" : "text-slate-100"}`}>
          {value ?? "—"}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/exams").then((r) => r.json()),
    ]).then(([statsRes, examsRes]) => {
      if (statsRes.success) setStats(statsRes.stats);
      if (examsRes.success) setExams(examsRes.exams || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeExams = exams.filter((e) => e.status === "ACTIVE");
  const publishedExams = exams.filter((e) => e.status === "PUBLISHED");
  const draftExams = exams.filter((e) => e.status === "DRAFT");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome back, {user?.name?.split(" ")[0] || "Teacher"} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's what's happening with your exams today.</p>
        </div>
        <Link
          href="/dashboard/exams"
          className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> New Exam
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total Exams"
            value={exams.length}
            sub={`${draftExams.length} draft${draftExams.length !== 1 ? "s" : ""}`}
          />
          <StatCard
            icon={ClipboardCheck}
            label="Active Now"
            value={activeExams.length}
            sub={activeExams.length > 0 ? "Students can attempt" : "None running"}
          />
          <StatCard
            icon={Users}
            label="Live Attempts"
            value={stats?.activeAttempts ?? 0}
            sub="In progress right now"
          />
          <StatCard
            icon={Clock}
            label="Pending Grades"
            value={stats?.pendingGrades ?? 0}
            sub="Subjective answers awaiting review"
            urgent
          />
        </div>
      )}

      {/* Pending grades alert */}
      {(stats?.pendingGrades ?? 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-300 font-medium text-sm">
                {stats.pendingGrades} subjective answer{stats.pendingGrades !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-amber-400/70 text-xs mt-0.5">Students are waiting for their results</p>
            </div>
          </div>
          <Link
            href="/dashboard/teacher/grading"
            className="shrink-0 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-lg transition-all"
          >
            Grade Now →
          </Link>
        </div>
      )}

      {/* Recent exams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-300">Your Exams</h2>
          <Link href="/dashboard/exams" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {exams.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">No exams yet</p>
            <p className="text-slate-500 text-sm">Create your first exam to get started.</p>
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all mt-2"
            >
              <Plus className="w-4 h-4" /> Create Exam
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 6).map((exam) => {
              const statusColor = {
                DRAFT: "bg-slate-700 text-slate-300",
                PUBLISHED: "bg-blue-500/15 text-blue-400",
                ACTIVE: "bg-emerald-500/15 text-emerald-400",
                COMPLETED: "bg-slate-700 text-slate-400",
              }[exam.status] || "bg-slate-700 text-slate-400";

              return (
                <Link key={exam.id} href={`/dashboard/exams/${exam.id}`}>
                  <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {exam.status}
                        </span>
                        <p className="text-slate-200 font-medium text-sm truncate">{exam.title}</p>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        {exam.subject?.name} · {exam._count?.questions ?? 0} questions · {exam._count?.attempts ?? 0} attempts
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

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-300 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Create Exam", desc: "Draft a new assessment", icon: Plus, href: "/dashboard/exams" },
            { label: "Question Bank", desc: "Manage your questions", icon: PenLine, href: "/dashboard/teacher/questions" },
            { label: "Grade Answers", desc: "Review subjective answers", icon: ClipboardCheck, href: "/dashboard/teacher/grading" },
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
