"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit3, Check, X, PlusCircle } from "lucide-react";
import {
  ChevronLeft,
  Search,
  Trash2,
  Plus,
  Play,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Settings2,
  Save,
  Zap,
  Trash,
  GripVertical,
  RotateCcw,
  StopCircle,
  ScanSearch,
  Loader2,
} from "lucide-react";
import { OCRImporterModal } from "@/components/dashboard/ocr-importer";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection,
  useDroppable,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";

// ─── Question Composer Modal ─────────────────────────────────────────────────
function QuestionComposer({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  processing = false,
}) {
  const [form, setForm] = useState({
    text: "",
    type: "MCQ_SINGLE",
    defaultMarks: 2,
    modelAnswer: "",
    options: [
      { text: "", label: "A", isCorrect: true, order: 0 },
      { text: "", label: "B", isCorrect: false, order: 1 },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        options:
          initialData.options?.length > 0
            ? initialData.options
            : [
                { text: "", label: "A", isCorrect: true, order: 0 },
                { text: "", label: "B", isCorrect: false, order: 1 },
              ],
      });
    } else {
      setForm({
        text: "",
        type: "MCQ_SINGLE",
        defaultMarks: 2,
        modelAnswer: "",
        options: [
          { text: "", label: "A", isCorrect: true, order: 0 },
          { text: "", label: "B", isCorrect: false, order: 1 },
        ],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + form.options.length);
    setForm({
      ...form,
      options: [
        ...form.options,
        {
          text: "",
          label: nextLabel,
          isCorrect: false,
          order: form.options.length,
        },
      ],
    });
  };

  const removeOption = (idx) => {
    setForm({
      ...form,
      options: form.options
        .filter((_, i) => i !== idx)
        .map((o, i) => ({
          ...o,
          label: String.fromCharCode(65 + i),
          order: i,
        })),
    });
  };

  const toggleCorrect = (idx) => {
    if (form.type === "MCQ_SINGLE") {
      setForm({
        ...form,
        options: form.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
      });
    } else {
      setForm({
        ...form,
        options: form.options.map((o, i) =>
          i === idx ? { ...o, isCorrect: !o.isCorrect } : o
        ),
      });
    }
  };

  const inputCls =
    "w-full h-11 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-600 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
  const selectCls =
    "w-full h-11 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {initialData ? "Edit Question" : "Create Question"}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-wider font-medium">
              Question Composer
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs font-medium">
                Response Format
              </Label>
              <select
                className={selectCls}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="MCQ_SINGLE">Multiple Choice (Single)</option>
                <option value="MCQ_MULTIPLE">Multiple Choice (Multiple)</option>
                <option value="SUBJECTIVE">Written / Subjective</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs font-medium">
                Default Marks
              </Label>
              <input
                type="number"
                className={inputCls}
                value={form.defaultMarks}
                onChange={(e) =>
                  setForm({ ...form, defaultMarks: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs font-medium">
              Question Statement
            </Label>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-600 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-28"
              placeholder="Enter the question prompt..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>

          {form.type.startsWith("MCQ") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-400 text-xs font-medium">
                  Options Configuration
                </Label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Choice
                </button>
              </div>
              <div className="grid lg:grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => toggleCorrect(i)}
                      className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        opt.isCorrect
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-emerald-500/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                    <input
                      className={inputCls + " flex-1"}
                      placeholder={`Option ${opt.label}...`}
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...form.options];
                        next[i].text = e.target.value;
                        setForm({ ...form, options: next });
                      }}
                    />
                    {form.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 text-slate-600 hover:text-rose-400 flex items-center justify-center rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === "SUBJECTIVE" && (
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs font-medium">
                Model Answer / Rubric
              </Label>
              <textarea
                className="w-full rounded-xl border border-dashed border-slate-700 bg-slate-800/50 text-slate-300 placeholder:text-slate-600 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-24"
                placeholder="Enter reference answer key..."
                value={form.modelAnswer}
                onChange={(e) =>
                  setForm({ ...form, modelAnswer: e.target.value })
                }
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-all"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={processing || !form.text}
              onClick={() => onSave(form)}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {initialData ? "Save Changes" : "Create & Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Draggable Bank Question ─────────────────────────────────────────────────
function DraggableBankQuestion({
  question,
  onEdit,
  onDelete,
  onAdd,
  disabled,
  processing,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `bank-${question.id}`,
      data: { type: "bank", question },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : undefined,
      }
    : undefined;

  const isLocked = question.exams?.some(
    (usage) =>
      usage.exam.status === "ACTIVE" || usage.exam.status === "COMPLETED"
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all ${
        isDragging
          ? "shadow-2xl scale-105 border-indigo-500/40"
          : "hover:border-slate-700"
      }`}
    >
      <div className="p-4 flex gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-1 cursor-grab active:cursor-grabbing min-w-0"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
              {question.type?.replace("_", " ")}
            </span>
            <span className="text-[10px] font-semibold text-emerald-500/70 uppercase">
              {question.defaultMarks} Marks
            </span>
          </div>
          <p className="text-slate-200 font-medium text-sm leading-snug line-clamp-2">
            {question.text}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {!disabled && (
            <button
              onClick={() => onEdit(question)}
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLocked && (
            <button
              onClick={() => onDelete(question.id)}
              className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!disabled && (
            <button
              onClick={() => onAdd(question)}
              disabled={processing}
              className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {question.exams?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800 pt-2.5">
          <span className="text-[9px] font-bold uppercase text-slate-600 tracking-wider">
            In:
          </span>
          {question.exams.map((usage, i) => (
            <span
              key={`${usage.exam.id}-${i}`}
              className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-medium text-slate-500"
            >
              {usage.exam.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Drag Preview Overlay ─────────────────────────────────────────────────────
function QuestionPreview({ question, type, index }) {
  return (
    <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl shadow-2xl w-[360px] pointer-events-none opacity-95 rotate-1 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {type === "exam" && (
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200">
              {index + 1}
            </div>
          )}
          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
            {question.type?.replace("_", " ")}
          </span>
          <span className="text-[10px] font-semibold text-emerald-500/70 uppercase">
            {question.defaultMarks || question.marks} Marks
          </span>
        </div>
        <p className="text-slate-200 font-medium text-sm leading-snug line-clamp-2">
          {question.text || question.questionTextSnapshot}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full w-fit">
          <Zap className="w-3 h-3" /> Linking...
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Exam Question ──────────────────────────────────────────────────
function SortableExamQuestion({
  id,
  index,
  eq,
  examStatus,
  onEdit,
  onDeleteManual,
  onPurge,
  processing,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: eq.questionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.3 : undefined,
  };

  const isFrozen =
    examStatus === "ACTIVE" || examStatus === "COMPLETED";
  const text = isFrozen ? eq.questionTextSnapshot : eq.question.text;
  const options = isFrozen
    ? eq.optionsSnapshot
      ? JSON.parse(eq.optionsSnapshot)
      : []
    : eq.question.options || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all ${
        isDragging ? "shadow-2xl" : "hover:border-slate-700"
      }`}
    >
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 -m-1 rounded-lg hover:bg-slate-800 transition-all"
          >
            <GripVertical className="w-4 h-4 text-slate-600" />
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300">
              {index + 1}
            </div>
          </div>
          <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20">
            {eq.question.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 h-8 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-[9px] font-semibold uppercase text-slate-500">
              Marks:
            </span>
            <span className="text-sm font-bold text-indigo-400">
              {eq.marks}
            </span>
          </div>
          {!isFrozen && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(eq.question)}
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 flex items-center justify-center transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              {!eq.question.exams?.some(
                (u) =>
                  u.exam.status === "ACTIVE" || u.exam.status === "COMPLETED"
              ) && (
                <button
                  onClick={() => onPurge(eq.questionId)}
                  className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onDeleteManual(eq.questionId)}
                disabled={processing}
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-slate-200 font-medium text-sm leading-snug mb-4">
          {text}
        </p>
        {options.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <div
                key={opt.id || opt.label || i}
                className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
                  opt.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold"
                    : "bg-slate-800/50 border-slate-700/50 text-slate-500 font-medium"
                }`}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 text-[10px] font-black shrink-0">
                  {opt.label}
                </span>
                <span className="truncate">{opt.text}</span>
                {opt.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Droppable Zone ──────────────────────────────────────────────────────────
function AssessmentDropZone({ children, id }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[60vh] rounded-2xl transition-all duration-300 ${
        isOver
          ? "bg-indigo-500/5 ring-2 ring-dashed ring-indigo-500/30"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

// ─── Main Builder Page ───────────────────────────────────────────────────────
export default function ExamBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [branches, setBranches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);

  const toDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [bankSearch, setBankSearch] = useState("");
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    title: "",
    duration: 60,
    totalMarks: 100,
    description: "",
    branchId: "",
    batchId: "",
    startTime: "",
    endTime: "",
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [globalProcessing, setGlobalProcessing] = useState(false);

  useEffect(() => {
    if (user?.collegeId && id) loadData(false, true);
  }, [user, id]);

  async function loadData(isSilent = false, resetForm = false) {
    if (!isSilent) setLoading(true);
    try {
      const exRes = await orgClient.exams.getById(id, user.id);
      if (exRes.success) {
        setExam(exRes.exam);
        const currentAccess = exRes.exam.access?.[0] || {};
        if (resetForm) {
          setMetaForm({
            title: exRes.exam.title,
            duration: exRes.exam.duration,
            totalMarks: exRes.exam.totalMarks,
            description: exRes.exam.description || "",
            branchId: currentAccess.branchId || "",
            batchId: currentAccess.batchId || "",
            startTime: exRes.exam.startTime
              ? toDateTimeLocal(exRes.exam.startTime)
              : "",
            endTime: exRes.exam.endTime
              ? toDateTimeLocal(exRes.exam.endTime)
              : "",
            shuffleQuestions: exRes.exam.shuffleQuestions || false,
            shuffleOptions: exRes.exam.shuffleOptions || false,
          });
        }
        const branchRes = await orgClient.branches.list(user.collegeId);
        if (branchRes.success) setBranches(branchRes.branches || []);

        if (currentAccess.branchId) {
          const batchRes = await orgClient.batches.list(currentAccess.branchId);
          if (batchRes.success) setAvailableBatches(batchRes.batches || []);
        }

        const qRes = await orgClient.questions.list({
          subjectId: exRes.exam.subjectId,
        });
        if (qRes.success) {
          const linkedIds = new Set(
            exRes.exam.questions.map((eq) => eq.questionId)
          );
          setBankQuestions(qRes.questions.filter((q) => !linkedIds.has(q.id)));
        }
      }
    } catch (e) {
      console.error("Load failed", e);
    }
    if (!isSilent) setLoading(false);
  }

  async function handleBranchChange(branchId) {
    setMetaForm((prev) => ({ ...prev, branchId, batchId: "" }));
    setAvailableBatches([]);
    if (branchId) {
      const res = await orgClient.batches.list(branchId);
      if (res.success) setAvailableBatches(res.batches || []);
    }
  }

  const currentTotalMarks = useMemo(
    () =>
      (exam?.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0),
    [exam]
  );

  async function handleAdd(question) {
    if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") return;
    setProcessing(true);
    try {
      const res = await orgClient.exams.addQuestion(id, {
        questionId: question.id,
        order: exam.questions.length,
        marks: question.defaultMarks,
      });
      if (res.success) {
        toast.success("Question added to exam");
        loadData(true);
      }
    } catch (e) {
      toast.error("Failed to add question");
    }
    setProcessing(false);
  }

  async function handleRemove(questionId) {
    if (exam.status !== "DRAFT" && exam.status !== "PUBLISHED") return;
    setProcessing(true);
    try {
      const res = await orgClient.exams.removeQuestion(id, questionId);
      if (res.success) {
        toast.success("Question removed");
        loadData(true);
      }
    } catch (e) {
      toast.error("Failed to remove question");
    }
    setProcessing(false);
  }

  async function handleDeleteBankQuestion(questionId) {
    if (
      !confirm(
        "Permanently remove this question from the institution repository?"
      )
    )
      return;
    setProcessing(true);
    try {
      const res = await orgClient.questions.delete(questionId);
      if (res.success) loadData(true);
      else toast.error(res.message);
    } catch (e) {
      toast.error("Deletion failed");
    }
    setProcessing(false);
  }

  async function handleSaveMeta() {
    setProcessing(true);
    try {
      const res = await orgClient.exams.update(id, metaForm);
      if (res.success) {
        toast.success("Assessment configuration saved");
        setIsEditingMeta(false);
        loadData(true, true);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Update failed");
    }
    setProcessing(false);
  }

  async function handleSaveQuestion(formData) {
    setProcessing(true);
    try {
      if (editingQuestion) {
        const res = await orgClient.questions.update(editingQuestion.id, {
          ...formData,
          examId: id,
        });
        if (res.success) {
          toast.success("Question updated successfully");
          setIsComposerOpen(false);
          loadData(true);
        }
      } else {
        const res = await orgClient.questions.create({
          ...formData,
          subjectId: exam.subjectId,
          collegeId: user.collegeId,
          creatorId: user.id,
        });
        if (res.success) {
          await orgClient.exams.addQuestion(id, {
            questionId: res.question.id,
            order: exam.questions.length,
            marks: res.question.defaultMarks,
          });
          setIsComposerOpen(false);
          loadData(true);
        }
      }
    } catch (e) {
      toast.error(e.message);
    }
    setProcessing(false);
  }

  async function handlePublish() {
    if (
      !confirm("Finalize Session? Content snapshots will be generated.")
    )
      return;
    setProcessing(true);
    try {
      const res = await orgClient.exams.publish(id, {});
      if (res.success) {
        toast.success("Exam published! Snapshots generated.");
        loadData(true);
      } else toast.error(res.message);
    } catch (e) {
      toast.error("Publish failed");
    }
    setProcessing(false);
  }

  async function handleOcrImportFinalize(parsedQuestions) {
    setGlobalProcessing(true);
    let successCount = 0;
    for (const q of parsedQuestions) {
      const payload = {
        text: q.text,
        type: q.type || "SUBJECTIVE",
        defaultMarks: q.defaultMarks || 2,
        modelAnswer: q.modelAnswer || "",
        options: q.options || [],
        subjectId: exam.subjectId,
        collegeId: user.collegeId,
        creatorId: user.id,
      };
      try {
        const res = await orgClient.questions.create(payload);
        if (res.success) {
          const addRes = await orgClient.exams.addQuestion(id, {
            questionId: res.question.id,
            order: exam.questions.length + successCount,
            marks: res.question.defaultMarks,
          });
          if (addRes.success) successCount++;
        }
      } catch (e) {
        console.error("Failed to inject & link", e);
      }
    }
    toast.success(`Successfully committed ${successCount} OCR extractions!`);
    setIsOcrOpen(false);
    setGlobalProcessing(false);
    loadData(true);
  }

  async function handleStart() {
    if (!confirm("Go LIVE? Exam will become active for students.")) return;
    setProcessing(true);
    try {
      const res = await orgClient.exams.start(id);
      if (res.success) {
        toast.success("Exam is now LIVE for students!");
        loadData(true);
      } else toast.error(res.message);
    } catch (e) {
      toast.error("Activation failed");
    }
    setProcessing(false);
  }

  async function handleComplete() {
    if (
      !confirm(
        "TERMINATE ASSESSMENT? All active student sessions will be closed immediately. This action cannot be undone."
      )
    )
      return;
    setProcessing(true);
    try {
      const res = await orgClient.exams.complete(id);
      if (res.success) {
        toast.success("Exam completed. All student attempts saved.");
        loadData(true);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Termination failed");
    }
    setProcessing(false);
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const isOverStructure =
      over.id === "exam-structure-droppable" ||
      exam.questions.some((eq) => eq.questionId === over.id);

    if (active.data.current?.type === "bank" && isOverStructure) {
      const q = active.data.current.question;
      handleAdd(q);
      return;
    }

    if (active.id !== over.id && active.data.current?.type !== "bank") {
      const oldIndex = exam.questions.findIndex(
        (eq) => eq.questionId === active.id
      );
      const newIndex = exam.questions.findIndex(
        (eq) => eq.questionId === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(exam.questions, oldIndex, newIndex);
        setExam({ ...exam, questions: newItems });
        try {
          const orderedIds = newItems.map((eq) => eq.questionId);
          await orgClient.exams.reorderQuestions(id, orderedIds);
        } catch (e) {
          toast.error("Failed to sync order");
          loadData(true);
        }
      }
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-sm font-medium">Loading exam builder...</span>
      </div>
    );
  if (!exam)
    return (
      <div className="p-20 text-center text-slate-500">Exam not found.</div>
    );

  const filteredBank = bankQuestions.filter((q) =>
    q.text.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const statusBadge = {
    DRAFT: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    PUBLISHED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-slate-700 text-slate-400 border-slate-600",
  }[exam.status] || "bg-slate-700 text-slate-400 border-slate-600";

  const selectCls =
    "w-full h-11 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none";
  const inputCls =
    "w-full h-11 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-600 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      {/* Global Processing Overlay */}
      {globalProcessing && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-in zoom-in-95 duration-200">
            <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
            <div>
              <p className="font-semibold text-slate-100">
                Processing OCR Extractions...
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Please do not close this window
              </p>
            </div>
          </div>
        </div>
      )}

      <OCRImporterModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onImportFinalize={handleOcrImportFinalize}
      />

      <QuestionComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSave={handleSaveQuestion}
        initialData={editingQuestion}
        processing={processing}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/teacher/exams">
              <button className="w-10 h-10 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-100 leading-none">
                  {exam.title}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                >
                  {exam.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {exam.subject?.name}
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {exam.duration}m
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  {exam.totalMarks} Total Marks
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Marks indicator */}
            <div
              className={`px-4 h-10 rounded-xl border flex items-center gap-2 ${
                currentTotalMarks > exam.totalMarks
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  : "border-slate-800 bg-slate-900 text-slate-300"
              }`}
            >
              <span className="text-xs text-slate-500">Marks:</span>
              <span className="text-sm font-bold">
                {currentTotalMarks}
                <span className="text-slate-600"> / {exam.totalMarks}</span>
              </span>
            </div>

            {(exam.status === "DRAFT" || exam.status === "PUBLISHED") && (
              <button
                onClick={() => setIsEditingMeta(!isEditingMeta)}
                className="h-10 px-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <Settings2 className="w-4 h-4 text-indigo-400" /> Settings
              </button>
            )}

            {exam.status === "DRAFT" && (
              <button
                onClick={handlePublish}
                disabled={
                  processing ||
                  exam.questions.length === 0 ||
                  currentTotalMarks > exam.totalMarks
                }
                className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <Check className="w-4 h-4" /> Finalize
              </button>
            )}

            {exam.status === "PUBLISHED" && (
              <button
                onClick={handleStart}
                disabled={processing}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 active:scale-95"
              >
                <Zap className="w-4 h-4" /> Go Live
              </button>
            )}

            {exam.status === "ACTIVE" &&
              (!exam.endTime || new Date(exam.endTime) > new Date()) && (
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  className="h-10 px-5 rounded-xl bg-slate-900 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-40 active:scale-95"
                >
                  <StopCircle className="w-4 h-4" /> Terminate
                </button>
              )}
          </div>
        </div>

        {/* ── Meta Settings Panel ─────────────────────────────────────────── */}
        {isEditingMeta && (
          <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="h-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400" />
            <div className="p-6">
              <h2 className="text-base font-bold text-slate-100 mb-5">
                Assessment Settings
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Exam Title
                  </Label>
                  <input
                    className={inputCls}
                    value={metaForm.title}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Duration (Mins)
                  </Label>
                  <input
                    type="number"
                    className={inputCls}
                    value={metaForm.duration}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, duration: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Total Marks
                  </Label>
                  <input
                    type="number"
                    className={inputCls}
                    value={metaForm.totalMarks}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, totalMarks: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Target Branch
                  </Label>
                  <select
                    className={selectCls}
                    value={metaForm.branchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                  >
                    <option value="">Select Target Branch...</option>
                    {branches?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Target Batch
                  </Label>
                  <select
                    className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                    value={metaForm.batchId}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, batchId: e.target.value })
                    }
                    disabled={!metaForm.branchId}
                  >
                    <option value="">All Students in Branch</option>
                    {availableBatches?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Schedule: Start
                  </Label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={metaForm.startTime}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-slate-400 text-xs font-medium">
                    Schedule: End
                  </Label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={metaForm.endTime}
                    onChange={(e) =>
                      setMetaForm({ ...metaForm, endTime: e.target.value })
                    }
                  />
                </div>

                {/* Shuffle toggles */}
                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      key: "shuffleQuestions",
                      label: "Shuffle Questions",
                      desc: "Randomize sequence per student",
                      Icon: RotateCcw,
                    },
                    {
                      key: "shuffleOptions",
                      label: "Shuffle Options",
                      desc: "Randomize choices (A, B, C, D)",
                      Icon: HelpCircle,
                    },
                  ].map(({ key, label, desc, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setMetaForm({ ...metaForm, [key]: !metaForm[key] })
                      }
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all text-left ${
                        metaForm[key]
                          ? "bg-indigo-500/10 border-indigo-500/30"
                          : "bg-slate-800/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            metaForm[key]
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm font-semibold">
                            {label}
                          </p>
                          <p className="text-slate-500 text-xs">{desc}</p>
                        </div>
                      </div>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-all ${
                          metaForm[key] ? "bg-indigo-600" : "bg-slate-700"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                            metaForm[key] ? "left-5.5" : "left-0.5"
                          }`}
                          style={{ left: metaForm[key] ? "22px" : "2px" }}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="md:col-span-4 flex items-center gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingMeta(false)}
                    className="flex-1 h-10 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 text-sm font-semibold transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMeta}
                    disabled={processing}
                    className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <Save className="w-4 h-4" /> Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div
          className={`grid gap-6 items-start ${
            exam.status === "ACTIVE" || exam.status === "COMPLETED"
              ? "grid-cols-1 max-w-3xl mx-auto"
              : "lg:grid-cols-2"
          }`}
        >
          {/* Left: Question Bank */}
          {!(exam.status === "ACTIVE" || exam.status === "COMPLETED") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  Question Bank
                </h3>
                <div className="flex items-center gap-2">
                  {exam.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => setIsOcrOpen(true)}
                        className="h-8 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <ScanSearch className="w-3.5 h-3.5" /> AI Import
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setIsComposerOpen(true);
                        }}
                        className="h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Create
                      </button>
                    </>
                  )}
                  <span className="h-7 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold flex items-center">
                    {bankQuestions.length}
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Search questions..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  disabled={exam.status !== "DRAFT"}
                />
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {filteredBank.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl text-slate-600 text-sm font-medium">
                    No questions in bank
                  </div>
                ) : (
                  filteredBank.map((q) => (
                    <DraggableBankQuestion
                      key={q.id}
                      question={q}
                      onEdit={(q) => {
                        setEditingQuestion(q);
                        setIsComposerOpen(true);
                      }}
                      onDelete={handleDeleteBankQuestion}
                      onAdd={handleAdd}
                      disabled={
                        exam.status !== "DRAFT" && exam.status !== "PUBLISHED"
                      }
                      processing={processing}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Right: Exam Structure */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Assessment Structure
              </h3>
              <span className="h-7 px-3 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center">
                {exam.questions.length} Questions
              </span>
            </div>

            <SortableContext
              id="exam-structure-sortable"
              items={exam.questions.map((eq) => eq.questionId)}
              strategy={verticalListSortingStrategy}
            >
              <AssessmentDropZone id="exam-structure-droppable">
                {exam.questions.length === 0 ? (
                  <div className="p-20 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                      <ArrowRight className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">
                        Empty Canvas
                      </p>
                      <p className="text-slate-600 text-xs mt-1">
                        Drag questions here to build your exam
                      </p>
                    </div>
                  </div>
                ) : (
                  exam.questions.map((eq, idx) => (
                    <SortableExamQuestion
                      key={eq.questionId}
                      id={eq.questionId}
                      index={idx}
                      eq={eq}
                      examStatus={exam.status}
                      onEdit={(q) => {
                        setEditingQuestion(q);
                        setIsComposerOpen(true);
                      }}
                      onDeleteManual={handleRemove}
                      onPurge={handleDeleteBankQuestion}
                      processing={processing}
                    />
                  ))
                )}
              </AssessmentDropZone>
            </SortableContext>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.4" } },
            }),
          }}
        >
          {activeId && (
            <div className="flex items-center justify-center">
              {(() => {
                const bankQ = bankQuestions.find(
                  (q) => `bank-${q.id}` === activeId
                );
                const examQ = exam.questions.find(
                  (eq) => eq.questionId === activeId
                );
                if (bankQ)
                  return <QuestionPreview question={bankQ} type="bank" />;
                if (examQ)
                  return (
                    <QuestionPreview
                      question={examQ.question}
                      type="exam"
                      index={exam.questions.findIndex(
                        (q) => q.questionId === activeId
                      )}
                    />
                  );
                return null;
              })()}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
