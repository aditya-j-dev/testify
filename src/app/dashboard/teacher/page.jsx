"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ClipboardCheck,
  Plus,
  ArrowRight,
  Loader2,
  PenLine,
  Users,
  AlertCircle,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";

const STATUS_CONFIG = {
  DRAFT:     { cls: "bg-slate-700 text-slate-300",            label: "Draft"     },
  PUBLISHED: { cls: "bg-indigo-500/20 text-indigo-400",       label: "Published" },
  ACTIVE:    { cls: "bg-emerald-500/20 text-emerald-400",     label: "Live"      },
  COMPLETED: { cls: "bg-slate-700 text-slate-400",            label: "Completed" },
};

function StatCard({ icon: Icon, label, value, sub, accent = "indigo", urgent }) {
  const colors = {
    indigo:  { icon: "bg-indigo-500/10",  text: "text-indigo-400"  },
    emerald: { icon: "bg-emerald-500/10", text: "text-emerald-400" },
    amber:   { icon: "bg-amber-500/10",   text: "text-amber-400"   },
    slate:   { icon: "bg-slate-800",      text: "text-slate-400"   },
  }[accent];

  return (
    <div
      className={`bg-slate-900 rounded-2xl p-5 space-y-4 border transition-all ${
        urgent ? "border-amber-500/20" : "border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        {urgent && value > 0 && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium">{label}</p>
        <p
          className={`text-3xl font-bold mt-1 tracking-tight ${
            urgent && value > 0 ? "text-amber-400" : "text-slate-100"
          }`}
        >
          {value ?? "—"}
        </p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
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
    ])
      .then(([statsRes, examsRes]) => {
        if (statsRes.success) setStats(statsRes.stats);
        if (examsRes.success) setExams(examsRes.exams || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeExams    = exams.filter((e) => e.status === "ACTIVE");
  const publishedExams = exams.filter((e) => e.status === "PUBLISHED");
  const draftExams     = exams.filter((e) => e.status === "DRAFT");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Welcome back, {user?.name?.split(" ")[0] || "Teacher"} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your exams today.
          </p>
        </div>
        <Link
          href="/dashboard/exams"
          className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Exam
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-sm">Loading stats...</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total Exams"
            value={exams.length}
            sub={`${draftExams.length} draft${draftExams.length !== 1 ? "s" : ""}`}
            accent="indigo"
          />
          <StatCard
            icon={Zap}
            label="Active Now"
            value={activeExams.length}
            sub={activeExams.length > 0 ? "Students can attempt" : "None running"}
            accent="emerald"
          />
          <StatCard
            icon={Users}
            label="Live Attempts"
            value={stats?.activeAttempts ?? 0}
            sub="In progress right now"
            accent="indigo"
          />
          <StatCard
            icon={Clock}
            label="Pending Grades"
            value={stats?.pendingGrades ?? 0}
            sub="Awaiting your review"
            accent="amber"
            urgent
          />
        </div>
      )}

      {/* ── Pending Grades Alert ─────────────────────────────────────── */}
      {(stats?.pendingGrades ?? 0) > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-300 font-semibold text-sm">
                {stats.pendingGrades} subjective answer
                {stats.pendingGrades !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-amber-400/60 text-xs mt-0.5">
                Students are waiting for their results
              </p>
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

      {/* ── Your Exams ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Your Exams</h2>
          <Link
            href="/dashboard/exams"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span className="text-sm">Loading exams...</span>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium text-sm">No exams yet</p>
            <p className="text-slate-600 text-xs">Create your first exam to get started.</p>
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
              const { cls: statusCls, label: statusLabel } =
                STATUS_CONFIG[exam.status] || STATUS_CONFIG.COMPLETED;

              return (
                <Link key={exam.id} href={`/dashboard/teacher/exams/${exam.id}`}>
                  <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusCls}`}
                          >
                            {statusLabel}
                          </span>
                          <p className="text-slate-200 font-medium text-sm truncate">
                            {exam.title}
                          </p>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">
                          {exam.subject?.name} · {exam._count?.questions ?? 0} questions ·{" "}
                          {exam._count?.attempts ?? 0} attempts
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Create Exam",
              desc: "Draft a new assessment",
              icon: Plus,
              href: "/dashboard/exams",
              accent: "indigo",
            },
            {
              label: "Question Bank",
              desc: "Manage your questions",
              icon: PenLine,
              href: "/dashboard/teacher/questions",
              accent: "indigo",
            },
            {
              label: "Grade Answers",
              desc: "Review subjective answers",
              icon: ClipboardCheck,
              href: "/dashboard/teacher/grading",
              accent: "amber",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 rounded-xl p-4 flex items-center gap-3 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                  <item.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-200 text-sm font-semibold">{item.label}</p>
                  <p className="text-slate-600 text-xs">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
