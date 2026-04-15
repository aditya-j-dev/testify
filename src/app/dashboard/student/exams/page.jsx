"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { studentClient } from "@/lib/api-client/student.client";
import {
  BookOpen,
  Clock,
  FileText,
  ChevronRight,
  Zap,
  History,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
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
    } catch (e) {
      console.error("Load failed", e);
    }
    setLoading(false);
  }

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();

  const activeExams = exams.filter((e) => {
    const isActuallyActive = e.status === "ACTIVE";
    const isInWindow =
      e.status === "PUBLISHED" &&
      e.startTime &&
      new Date(e.startTime) <= now &&
      (!e.endTime || new Date(e.endTime) >= now);
    const isWithinTime = !e.endTime || new Date(e.endTime) >= now;
    const notCompleted =
      !e.attempts[0] || e.attempts[0].status === "IN_PROGRESS";
    return (isActuallyActive || isInWindow) && isWithinTime && notCompleted;
  });

  const upcomingExams = exams.filter(
    (e) =>
      e.status === "PUBLISHED" && e.startTime && new Date(e.startTime) > now
  );

  const pastExams = exams.filter((e) => {
    const isCompletedStatus = e.status === "COMPLETED";
    const isPastWindow = e.endTime && new Date(e.endTime) < now;
    const hasFinishedAttempt =
      e.attempts[0]?.status === "SUBMITTED" ||
      e.attempts[0]?.status === "TIMED_OUT" ||
      e.attempts[0]?.status === "COMPLETED" ||
      e.attempts[0]?.status === "CHEATED";
    return isCompletedStatus || isPastWindow || hasFinishedAttempt;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Loading assessments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Academic Assessments
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {user?.branch?.name || "Assigned curricula"} ·{" "}
            {user?.batch?.name || "Class of 2024"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">
              Available
            </p>
            <p className="text-2xl font-bold text-slate-100 leading-none mt-0.5">
              {activeExams.length}
            </p>
          </div>
          <div className="text-center px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming
            </p>
            <p className="text-2xl font-bold text-slate-100 leading-none mt-0.5">
              {upcomingExams.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Active Now ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Active Now
          </h2>
          {activeExams.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>

        {activeExams.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium text-sm">
              No active sessions right now
            </p>
            <p className="text-slate-600 text-xs">
              Check the upcoming schedule below
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeExams.map((exam) => {
              const attempt = exam.attempts[0];
              const isStarted = attempt?.status === "IN_PROGRESS";

              return (
                <div
                  key={exam.id}
                  className="group bg-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/40"
                >
                  {/* Top accent */}
                  <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500" />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 mb-2.5">
                          {exam.subject?.name}
                        </span>
                        <h3 className="text-slate-100 font-semibold text-base leading-snug group-hover:text-emerald-400 transition-colors">
                          {exam.title}
                        </h3>
                      </div>
                      {isStarted && (
                        <span className="shrink-0 inline-flex px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Resume
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {exam.duration}m
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {exam.totalMarks} pts
                      </span>
                      {exam.endTime && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          Ends {formatDateTime(exam.endTime)}
                        </span>
                      )}
                    </div>

                    <Link href={`/dashboard/student/exams/${exam.id}/lobby`}>
                      <button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        {isStarted ? "Continue Assessment" : "Launch Session"}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Upcoming ────────────────────────────────────────────────── */}
      {upcomingExams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Upcoming Assessments
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-500">
                    {exam.subject?.name}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400 text-right shrink-0">
                    {formatDateTime(exam.startTime)}
                  </span>
                </div>

                <h4 className="text-slate-200 font-semibold text-sm leading-snug">
                  {exam.title}
                </h4>

                <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.duration}m
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <FileText className="w-3.5 h-3.5" />
                    {exam.totalMarks} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── History ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Participation History
          </h2>
        </div>

        {pastExams.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-slate-600 text-sm">No exam history yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {pastExams.map((exam) => {
              const attempt = exam.attempts[0];
              const isAttempted =
                !!attempt &&
                (attempt.status === "SUBMITTED" ||
                  attempt.status === "TIMED_OUT" ||
                  attempt.status === "COMPLETED" ||
                  attempt.status === "CHEATED");
              const isCheated = attempt?.status === "CHEATED";
              const isMissed = !isAttempted;

              const statusConfig = isCheated
                ? {
                    cls: "bg-rose-500/10 border-rose-500/20 text-rose-400",
                    Icon: ShieldAlert,
                    label: "Violation",
                    sub: "Terminated for breach",
                  }
                : isAttempted
                ? {
                    cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                    Icon: CheckCircle2,
                    label: "Attempted",
                    sub: attempt.status === "TIMED_OUT" ? "Timed out" : "Submitted",
                  }
                : {
                    cls: "bg-slate-800 border-slate-700 text-slate-500",
                    Icon: XCircle,
                    label: "Not Attempted",
                    sub: "Window closed",
                  };

              return (
                <div
                  key={exam.id}
                  className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 transition-all ${
                    isMissed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-500">
                      {exam.subject?.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${statusConfig.cls}`}
                    >
                      <statusConfig.Icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <h4 className="text-slate-300 font-semibold text-sm leading-snug">
                    {exam.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-600">
                      {statusConfig.sub}
                    </span>
                    <span className="text-[10px] font-medium text-slate-700 uppercase tracking-wider">
                      {exam.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
