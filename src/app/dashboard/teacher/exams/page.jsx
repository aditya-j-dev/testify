"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ClipboardList,
  Trash2,
  Clock,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  StopCircle,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FacultyExamsPage() {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    subjectId: "",
    semester: 1,
    branchId: "",
    batchId: "",
  });

  useEffect(() => {
    if (user?.collegeId) {
      loadInitialData();
    }
  }, [user]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const subRes = await orgClient.subjects.list(user.collegeId);
      if (subRes.success) setSubjects(subRes.subjects);

      const brRes = await orgClient.branches.list(user.collegeId);
      if (brRes.success) setBranches(brRes.branches || []);

      const exRes = await orgClient.exams.list();
      if (exRes.success) setExams(exRes.exams);
    } catch (e) {
      console.error("Load failed", e);
    }
    setLoading(false);
  }

  async function handleBranchChange(branchId) {
    setFormData((prev) => ({ ...prev, branchId, batchId: "" }));
    setAvailableBatches([]);
    if (branchId) {
      const bRes = await orgClient.batches.list(branchId);
      if (bRes.success) setAvailableBatches(bRes.batches || []);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.subjectId) return toast.error("Select a subject");

    try {
      const res = await orgClient.exams.create(formData);
      if (res.success) {
        setIsAdding(false);
        setFormData({
          title: "",
          description: "",
          duration: 60,
          totalMarks: 100,
          subjectId: "",
          semester: 1,
          branchId: "",
          batchId: "",
        });
        setAvailableBatches([]);
        loadInitialData();
        toast.success("Exam draft created!");
      } else {
        toast.error(res.message || "Draft creation failed");
      }
    } catch (e) {
      toast.error("Draft creation failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure? Only DRAFT exams can be deleted.")) return;
    try {
      const res = await orgClient.exams.delete(id);
      if (res.success) loadInitialData();
      else toast.error(res.message);
    } catch (e) {
      toast.error("Deletion failed");
    }
  }

  async function handleComplete(id) {
    if (
      !confirm(
        "Stop this active assessment immediately? All student work will be saved and sessions closed."
      )
    )
      return;
    try {
      const res = await orgClient.exams.complete(id);
      if (res.success) {
        toast.success("Exam terminated successfully");
        loadInitialData();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Termination failed");
    }
  }

  const filteredExams = (exams || []).filter((ex) =>
    ex.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status, startTime, endTime) => {
    const now = new Date();
    if (
      (status === "ACTIVE" || status === "PUBLISHED") &&
      endTime &&
      new Date(endTime) < now
    ) {
      return { cls: "bg-slate-700 text-slate-400", label: "COMPLETED" };
    }
    if (
      status === "PUBLISHED" &&
      startTime &&
      new Date(startTime) > now
    ) {
      return { cls: "bg-amber-500/15 text-amber-400", label: "SCHEDULED" };
    }
    switch (status) {
      case "DRAFT":
        return { cls: "bg-slate-700 text-slate-300", label: "DRAFT" };
      case "PUBLISHED":
        return { cls: "bg-indigo-500/20 text-indigo-400", label: "PUBLISHED" };
      case "ACTIVE":
        return {
          cls: "bg-emerald-500/20 text-emerald-400 animate-pulse",
          label: "LIVE",
        };
      case "COMPLETED":
        return { cls: "bg-slate-700 text-slate-400", label: "COMPLETED" };
      default:
        return { cls: "bg-slate-700 text-slate-400", label: status };
    }
  };

  const selectClass =
    "w-full h-11 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Assessment Console
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">
              Design, schedule, and manage your exams.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="shrink-0 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Exam
        </button>
      </div>

      {/* Create Form */}
      {isAdding && (
        <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="h-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400 w-full" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Create Exam Draft
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Define the core parameters for this assessment.
                </p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Exam Title
                    </Label>
                    <input
                      className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-600 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="e.g. Mid-Semester Theory Exam 2024"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Academic Subject
                    </Label>
                    <select
                      className={selectClass}
                      value={formData.subjectId}
                      onChange={(e) =>
                        setFormData({ ...formData, subjectId: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Target Branch
                    </Label>
                    <select
                      className={selectClass}
                      value={formData.branchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                    >
                      <option value="">All Branches (College-Wide)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Target Batch{" "}
                      <span className="text-slate-600">(optional)</span>
                    </Label>
                    <select
                      className={`${selectClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                      value={formData.batchId}
                      onChange={(e) =>
                        setFormData({ ...formData, batchId: e.target.value })
                      }
                      disabled={!formData.branchId}
                    >
                      <option value="">All Students in Branch</option>
                      {availableBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs font-medium">
                        Duration (Mins)
                      </Label>
                      <input
                        className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-400 text-xs font-medium">
                        Semester
                      </Label>
                      <input
                        className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        type="number"
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData({ ...formData, semester: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Description / Instructions
                    </Label>
                    <textarea
                      className="w-full h-36 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-600 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      placeholder="Guidelines for students appearing in the exam..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 text-xs font-medium">
                      Total Marks
                    </Label>
                    <input
                      className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalMarks: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98]"
              >
                Initialize Assessment Draft
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 placeholder:text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          placeholder="Search by assessment title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Exam Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Loading exams...</span>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/50 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No exams found</p>
            <p className="text-slate-600 text-sm max-w-xs">
              Create your first exam draft to get started.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Create Exam
            </button>
          </div>
        ) : (
          filteredExams.map((ex) => {
            const { cls: statusCls, label: statusLabel } = getStatusConfig(
              ex.status,
              ex.startTime,
              ex.endTime
            );
            const isExpired =
              ex.endTime &&
              new Date(ex.endTime) < new Date() &&
              (ex.status === "ACTIVE" || ex.status === "PUBLISHED");

            return (
              <div
                key={ex.id}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col overflow-hidden transition-all"
              >
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusCls}`}
                    >
                      {statusLabel}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ex.duration}m</span>
                    </div>
                  </div>

                  <Link href={`/dashboard/teacher/exams/${ex.id}`}>
                    <h2 className="text-slate-100 font-semibold text-base leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2 cursor-pointer">
                      {ex.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{ex.subject?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sem {ex.semester}</span>
                    </div>
                  </div>

                  {(ex.startTime || ex.endTime) && (
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                      {ex.startTime && (
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                            Starts
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {formatDateTime(ex.startTime)}
                          </p>
                        </div>
                      )}
                      {ex.endTime && (
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                            Ends
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            {formatDateTime(ex.endTime)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between border-t border-slate-800 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[11px] font-bold text-indigo-400">
                      {ex._count.questions}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Questions
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(ex.status === "COMPLETED" || isExpired) && (
                      <Link href={`/dashboard/teacher/grading/${ex.id}`}>
                        <button className="h-8 px-3 rounded-lg border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all">
                          <ClipboardList className="w-3.5 h-3.5" />
                          Results
                        </button>
                      </Link>
                    )}
                    {ex.status === "DRAFT" && (
                      <button
                        onClick={() => handleDelete(ex.id)}
                        className="w-8 h-8 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {ex.status === "ACTIVE" &&
                      (!ex.endTime || new Date(ex.endTime) > new Date()) && (
                        <button
                          onClick={() => handleComplete(ex.id)}
                          className="w-8 h-8 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      )}
                    <Link href={`/dashboard/teacher/exams/${ex.id}`}>
                      <button className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all active:scale-95">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
