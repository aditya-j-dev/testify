"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Trash
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// --- Sub-Component: Question Composer Modal ---
function QuestionComposer({ isOpen, onClose, onSave, initialData = null, processing = false }) {
  const [form, setForm] = useState({
    text: "",
    type: "MCQ_SINGLE",
    defaultMarks: 2,
    modelAnswer: "",
    options: [
      { text: "", label: "A", isCorrect: true, order: 0 },
      { text: "", label: "B", isCorrect: false, order: 1 }
    ]
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        options: initialData.options?.length > 0 ? initialData.options : [
          { text: "", label: "A", isCorrect: true, order: 0 },
          { text: "", label: "B", isCorrect: false, order: 1 }
        ]
      });
    } else {
      setForm({
        text: "",
        type: "MCQ_SINGLE",
        defaultMarks: 2,
        modelAnswer: "",
        options: [
          { text: "", label: "A", isCorrect: true, order: 0 },
          { text: "", label: "B", isCorrect: false, order: 1 }
        ]
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + form.options.length);
    setForm({
      ...form,
      options: [...form.options, { text: "", label: nextLabel, isCorrect: false, order: form.options.length }]
    });
  };

  const removeOption = (idx) => {
    setForm({
      ...form,
      options: form.options.filter((_, i) => i !== idx).map((o, i) => ({ ...o, label: String.fromCharCode(65 + i), order: i }))
    });
  };

  const toggleCorrect = (idx) => {
    if (form.type === "MCQ_SINGLE") {
      setForm({ ...form, options: form.options.map((o, i) => ({ ...o, isCorrect: i === idx })) });
    } else {
      setForm({ ...form, options: form.options.map((o, i) => i === idx ? { ...o, isCorrect: !o.isCorrect } : o) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-none rounded-[32px]">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black">{initialData ? "Edit Assessment Asset" : "Create New Asset"}</CardTitle>
              <CardDescription className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mt-1">Question Composer Engine</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10"><X className="w-5 h-5" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest opacity-50">Response Format</Label>
                <select className="w-full h-12 rounded-xl bg-muted/20 border-none font-bold px-4 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                   <option value="MCQ_SINGLE">Multiple Choice (Single)</option>
                   <option value="MCQ_MULTIPLE">Multiple Choice (Multiple)</option>
                   <option value="SUBJECTIVE">Written / Subjective</option>
                </select>
             </div>
             <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest opacity-50">Default marks</Label>
                <Input type="number" value={form.defaultMarks} onChange={e => setForm({...form, defaultMarks: e.target.value})} className="h-12 rounded-xl border-muted/20 font-bold" />
             </div>
          </div>
          <div className="space-y-2">
             <Label className="font-black text-[10px] uppercase tracking-widest opacity-50">Question Statement</Label>
             <textarea className="w-full p-4 rounded-2xl bg-muted/20 border-none font-medium h-32 focus:ring-4 focus:ring-indigo-50 transition-all resize-none" placeholder="Enter the core educational prompt..." value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
          </div>
          {form.type.startsWith("MCQ") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                 <Label className="font-black text-[10px] uppercase tracking-widest opacity-50">Options Configuration</Label>
                 <Button variant="ghost" size="sm" onClick={addOption} className="text-indigo-600 font-bold text-[10px] uppercase h-7 px-3 rounded-full hover:bg-indigo-50"><Plus className="w-3 h-3 mr-1" /> Add Choice</Button>
              </div>
              <div className="grid lg:grid-cols-2 gap-3">
                 {form.options.map((opt, i) => (
                   <div key={i} className="flex items-center gap-2 group">
                      <div onClick={() => toggleCorrect(i)} className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${opt.isCorrect ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/30"}`}>
                         <span className="text-xs font-black">{opt.label}</span>
                      </div>
                      <Input placeholder={`Option ${opt.label}...`} value={opt.text} onChange={e => { const next = [...form.options]; next[i].text = e.target.value; setForm({...form, options: next}); }} className="h-10 rounded-xl border-muted/10 font-medium text-sm" />
                      {form.options.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeOption(i)} className="opacity-0 group-hover:opacity-100 h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-full transition-all"><Trash2 className="w-4 h-4" /></Button>}
                   </div>
                 ))}
              </div>
            </div>
          )}
          {form.type === "SUBJECTIVE" && (
            <div className="space-y-2">
               <Label className="font-black text-[10px] uppercase tracking-widest opacity-50">Model Answer / Rubric</Label>
               <textarea className="w-full p-4 rounded-2xl bg-muted/5 border-2 border-dashed border-muted/20 font-medium h-24 focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-sm italic" placeholder="Enter reference answer key..." value={form.modelAnswer} onChange={e => setForm({...form, modelAnswer: e.target.value})} />
            </div>
          )}
          <div className="flex gap-4 pt-4">
             <Button variant="ghost" onClick={onClose} className="h-14 flex-1 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-50">Discard Changes</Button>
             <Button disabled={processing || !form.text} onClick={() => onSave(form)} className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20 flex gap-2"><Save className="w-5 h-5 mr-1" /> {initialData ? "Save Global Changes" : "Create & Auto-Link"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Builder Page ---
export default function ExamBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Discovery / Access Targeting
  const [branches, setBranches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  
  const [bankSearch, setBankSearch] = useState("");
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({ 
    title: "", 
    duration: 60, 
    totalMarks: 100, 
    description: "",
    branchId: "",
    batchId: ""
  });

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  useEffect(() => {
    if (user?.collegeId && id) loadData();
  }, [user, id]);

  async function loadData() {
    setLoading(true);
    try {
        const exRes = await orgClient.exams.getById(id, user.id);
        if (exRes.success) {
            setExam(exRes.exam);
            
            // Extract current access targeting
            const currentAccess = exRes.exam.access?.[0] || {};
            
            setMetaForm({ 
              title: exRes.exam.title, 
              duration: exRes.exam.duration, 
              totalMarks: exRes.exam.totalMarks, 
              description: exRes.exam.description || "",
              branchId: currentAccess.branchId || "",
              batchId: currentAccess.batchId || ""
            });

            // Fetch metadata for targeting
            const branchRes = await orgClient.branches.list(user.collegeId);
            if (branchRes.success) setBranches(branchRes.branches || []);

            if (currentAccess.branchId) {
                const batchRes = await orgClient.batches.list(currentAccess.branchId);
                if (batchRes.success) setAvailableBatches(batchRes.batches || []);
            }

            const qRes = await orgClient.questions.list({ subjectId: exRes.exam.subjectId });
            if (qRes.success) {
                const linkedIds = new Set(exRes.exam.questions.map(eq => eq.questionId));
                setBankQuestions(qRes.questions.filter(q => !linkedIds.has(q.id)));
            }
        }
    } catch (e) { console.error("Load failed", e); }
    setLoading(false);
  }

  async function handleBranchChange(branchId) {
    setMetaForm(prev => ({ ...prev, branchId, batchId: "" }));
    setAvailableBatches([]);
    if (branchId) {
       const res = await orgClient.batches.list(branchId);
       if (res.success) setAvailableBatches(res.batches || []);
    }
  }

  const currentTotalMarks = useMemo(() => (exam?.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0), [exam]);

  async function handleAdd(question) {
    if (exam.status !== 'DRAFT' && exam.status !== 'PUBLISHED') return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.addQuestion(id, { questionId: question.id, order: exam.questions.length, marks: question.defaultMarks });
        if (res.success) { toast.success("Question added to exam"); loadData(); }
    } catch (e) { toast.error("Failed to add question"); }
    setProcessing(false);
  }

  async function handleRemove(questionId) {
    if (exam.status !== 'DRAFT' && exam.status !== 'PUBLISHED') return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.removeQuestion(id, questionId);
        if (res.success) { toast.success("Question removed"); loadData(); }
    } catch (e) { toast.error("Failed to remove question"); }
    setProcessing(false);
  }

  async function handleDeleteBankQuestion(questionId) {
    if (!confirm("PURGE ASSET? This will permanently remove the question from the entire institution repository.")) return;
    setProcessing(true);
    try {
        const res = await orgClient.questions.delete(questionId);
        if (res.success) loadData();
        else toast.error(res.message);
    } catch (e) { toast.error("Deletion failed"); }
    setProcessing(false);
  }

  async function handleSaveMeta() {
    setProcessing(true);
    try {
        const res = await orgClient.exams.update(id, metaForm);
        if (res.success) { 
           toast.success("Assessment configuration saved");
           setIsEditingMeta(false); 
           loadData(); 
        } else {
           toast.error(res.message);
        }
    } catch (e) { toast.error("Update failed"); }
    setProcessing(false);
  }

  async function handleSaveQuestion(formData) {
    setProcessing(true);
    try {
      if (editingQuestion) {
        const res = await orgClient.questions.update(editingQuestion.id, { ...formData, examId: id });
        if (res.success) { toast.success("Question updated successfully"); setIsComposerOpen(false); loadData(); }
      } else {
        const res = await orgClient.questions.create({ ...formData, subjectId: exam.subjectId, collegeId: user.collegeId, creatorId: user.id });
        if (res.success) {
          await orgClient.exams.addQuestion(id, { questionId: res.question.id, order: exam.questions.length, marks: res.question.defaultMarks });
          setIsComposerOpen(false);
          loadData();
        }
      }
    } catch (e) { toast.error(e.message); }
    setProcessing(false);
  }

  async function handlePublish() {
    if (!confirm("Finalize Session? Content snapshots will be generated.")) return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.publish(user.id, id, {});
        if (res.success) { toast.success("Exam published! Snapshots generated."); loadData(); }
        else toast.error(res.message);
    } catch (e) { toast.error("Publish failed"); }
    setProcessing(false);
  }

  async function handleStart() {
    if (!confirm("Go LIVE? Exam will become active for students.")) return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.start(user.id, id);
        if (res.success) { toast.success("Exam is now LIVE for students!"); loadData(); }
        else toast.error(res.message);
    } catch (e) { toast.error("Activation failed"); }
    setProcessing(false);
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic">Synchronizing Assessment Builder...</div>;
  if (!exam) return <div className="p-20 text-center">Exam not found.</div>;

  const filteredBank = bankQuestions.filter(q => q.text.toLowerCase().includes(bankSearch.toLowerCase()));

  return (
    <div className="space-y-6 container mx-auto pb-20 mt-8 px-4 md:px-0">
      <QuestionComposer isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} onSave={handleSaveQuestion} initialData={editingQuestion} processing={processing} />

      {/* Header Section */}
      <div className="flex flex-col lg:grid-cols-2 items-start lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-muted/10 shadow-custom">
        <div className="flex items-center gap-6">
           <Link href="/dashboard/teacher/exams">
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full border border-muted/10"><ChevronLeft className="w-7 h-7" /></Button>
           </Link>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-slate-900 leading-none">{exam.title}</h1>
                 <Badge variant="outline" className={`font-black uppercase text-[10px] px-3 py-1 ${exam.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 border-amber-200' : exam.status === 'PUBLISHED' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>{exam.status}</Badge>
              </div>
              <div className="flex items-center gap-5 mt-3 text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-60">
                 <span><BookOpen className="w-4 h-4 inline mr-1 text-indigo-500" /> {exam.subject?.name}</span>
                 <span><Clock className="w-4 h-4 inline mr-1 text-indigo-500" /> {exam.duration}m</span>
                 <span><FileText className="w-4 h-4 inline mr-1 text-indigo-500" /> {exam.totalMarks} Total</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-6 h-16 rounded-2xl border flex flex-col items-center justify-center min-w-[160px] ${currentTotalMarks > exam.totalMarks ? 'border-rose-200 bg-rose-50 text-rose-700 animate-bounce' : 'bg-slate-50/50 border-slate-100 text-slate-600'}`}>
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Marks Load</span>
              <span className="text-2xl font-black leading-none">{currentTotalMarks} <span className="text-xs opacity-30">/ {exam.totalMarks}</span></span>
           </div>
           {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && (
              <Button variant="outline" onClick={() => setIsEditingMeta(!isEditingMeta)} className="h-16 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest border-muted-foreground/10"><Settings2 className="w-5 h-5 mr-2 text-indigo-500" /> Config</Button>
           )}
           {exam.status === 'DRAFT' && (
              <Button onClick={handlePublish} disabled={processing || exam.questions.length === 0 || currentTotalMarks > exam.totalMarks} className="bg-slate-900 border-b-4 border-slate-700 hover:bg-slate-800 text-white font-black h-16 px-10 rounded-2xl shadow-xl transition-all active:scale-95 active:border-b-0 flex gap-2"><Check className="w-5 h-5 text-indigo-400" /> Finalize Builder</Button>
           )}
           {exam.status === 'PUBLISHED' && (
              <Button onClick={handleStart} disabled={processing} className="bg-emerald-600 border-b-4 border-emerald-800 hover:bg-emerald-700 text-white font-black h-16 px-10 rounded-2xl shadow-xl transition-all active:scale-90 active:border-b-0 flex gap-2 animate-in zoom-in"><Zap className="w-6 h-6 fill-white" /> Activate Exam</Button>
           )}
        </div>
      </div>

      {isEditingMeta && (
         <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden animate-in fade-in slide-in-from-top-10 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-slate-900 h-2 w-full" />
            <CardHeader className="p-10 pb-4"><CardTitle className="text-2xl font-black">Assessment Calibration</CardTitle></CardHeader>
            <CardContent className="p-10 pt-4">
               <div className="grid md:grid-cols-4 gap-8">
                  <div className="md:col-span-2 space-y-3">
                     <Label className="font-black text-xs uppercase opacity-40">Asset Name</Label>
                     <Input value={metaForm.title} onChange={e => setMetaForm({...metaForm, title: e.target.value})} className="h-14 rounded-2xl bg-muted/20 border-none font-bold text-lg px-6" />
                  </div>
                  <div className="space-y-3">
                     <Label className="font-black text-xs uppercase opacity-40">Time Cap (Mins)</Label>
                     <Input type="number" value={metaForm.duration} onChange={e => setMetaForm({...metaForm, duration: e.target.value})} className="h-14 rounded-2xl bg-muted/20 border-none font-black text-lg px-6" />
                  </div>
                  <div className="space-y-3">
                     <Label className="font-black text-xs uppercase opacity-40">Points Ceiling</Label>
                     <Input type="number" value={metaForm.totalMarks} onChange={e => setMetaForm({...metaForm, totalMarks: e.target.value})} className="h-14 rounded-2xl bg-muted/20 border-none font-black text-lg px-6" />
                  </div>
                  
                  {/* Phase 4.4: Target Audience Selection */}
                  <div className="md:col-span-2 space-y-3">
                     <Label className="font-black text-xs uppercase opacity-40">Target Branch (Primary Audience)</Label>
                     <select 
                       className="w-full h-14 rounded-2xl bg-muted/20 border-none font-bold px-6 appearance-none cursor-pointer"
                       value={metaForm.branchId}
                       onChange={(e) => handleBranchChange(e.target.value)}
                     >
                        <option value="">Select Target Branch...</option>
                        {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                     </select>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <Label className="font-black text-xs uppercase opacity-40">Target Batch (Specific Cohort - Optional)</Label>
                     <select 
                       className="w-full h-14 rounded-2xl bg-muted/20 border-none font-bold px-6 appearance-none cursor-pointer"
                       value={metaForm.batchId}
                       onChange={(e) => setMetaForm({ ...metaForm, batchId: e.target.value })}
                       disabled={!metaForm.branchId}
                     >
                        <option value="">All Students in Branch</option>
                        {availableBatches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                     </select>
                  </div>

                  <div className="md:col-span-4 flex items-center gap-4 pt-4 border-t border-muted/10 mt-2">
                     <Button variant="ghost" onClick={() => setIsEditingMeta(false)} className="h-14 flex-1 rounded-2xl font-black uppercase text-[11px]">Discard</Button>
                     <Button onClick={handleSaveMeta} disabled={processing} className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex gap-2 uppercase text-[11px]"><Save className="w-5 h-5" /> Save Assessment Attributes</Button>
                  </div>
               </div>
            </CardContent>
         </Card>
      )}

      {exam.status === 'ACTIVE' && (
        <Card className="bg-emerald-500 border-none p-1 rounded-[32px] shadow-xl shadow-emerald-500/10">
           <CardContent className="p-6 bg-white dark:bg-slate-900 rounded-[28px] border-2 border-emerald-50 flex items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-emerald-500 flex items-center justify-center text-white"><Zap className="w-8 h-8 fill-white animate-pulse" /></div>
              <div><h3 className="text-xl font-black text-emerald-950 dark:text-emerald-400 leading-none">Assessment Live</h3><p className="text-sm font-bold text-emerald-800/60 dark:text-emerald-400/60 mt-1 uppercase tracking-widest">Global snapshot locked for participants</p></div>
              <Badge className="ml-auto bg-emerald-500 text-white font-black px-6 h-10 rounded-full">Uptime Monitor Active</Badge>
           </CardContent>
        </Card>
      )}

      {/* Main Grid: Adaptive Layout */}
      <div className={`grid gap-12 items-start ${
        (exam.status === 'ACTIVE' || exam.status === 'COMPLETED') 
          ? 'grid-cols-1 max-w-4xl mx-auto' 
          : 'lg:grid-cols-2 w-full'
      }`}>
        
        {/* Left Panel: Question Registry (Masked in Active/Completed phases) */}
        {!(exam.status === 'ACTIVE' || exam.status === 'COMPLETED') && (
           <div className="space-y-6 animate-in fade-in slide-in-from-left-5 duration-300">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                    <Search className="w-5 h-5 text-indigo-500" /> Academic Registry
                 </h3>
                 <div className="flex items-center gap-3">
                    {exam.status === 'DRAFT' && (
                       <Button 
                         onClick={() => { setEditingQuestion(null); setIsComposerOpen(true); }} 
                         className="h-10 px-4 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-black text-[10px] uppercase tracking-widest flex gap-2"
                       >
                          <PlusCircle className="w-4 h-4" /> Create Asset
                       </Button>
                    )}
                    <Badge variant="secondary" className="font-black text-[10px] bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full">{bankQuestions.length} Total</Badge>
                 </div>
              </div>
              <div className="relative group">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                 <Input 
                   placeholder="Search repository for specific curricula..." 
                   className="pl-14 h-16 rounded-[24px] bg-white border-muted/20 shadow-custom font-bold text-lg focus:ring-4 focus:ring-indigo-50 transition-all" 
                   value={bankSearch} 
                   onChange={(e) => setBankSearch(e.target.value)} 
                   disabled={exam.status !== 'DRAFT'} 
                 />
              </div>
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar px-2">
                 {filteredBank.length === 0 ? (
                    <div className="p-20 text-center border-4 border-dashed rounded-[40px] bg-muted/5 italic text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">Registry Empty</div>
                 ) : (
                    filteredBank.map(q => {
                       const isLocked = q.exams?.some(usage => usage.exam.status === 'ACTIVE' || usage.exam.status === 'COMPLETED');
                       return (
                        <Card key={q.id} className="group hover:border-indigo-600/30 transition-all shadow-md rounded-[28px] border border-muted/10 bg-white border-b-4 border-b-muted/10 active:scale-[0.98]">
                            <CardContent className="p-6 flex flex-col gap-4">
                              <div className="flex gap-6">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className="text-[10px] font-black uppercase bg-slate-100 text-slate-800" variant="secondary">{q.type.replace('_', ' ')}</Badge>
                                        <span className="text-[10px] font-black text-emerald-600/60 uppercase">{q.defaultMarks} Marks Assets</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 leading-tight">{q.text}</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && (
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => { setEditingQuestion(q); setIsComposerOpen(true); }}
                                          className="h-10 w-10 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
                                        >
                                          <Edit3 className="w-5 h-5" />
                                        </Button>
                                    )}
                                    {!isLocked && (
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => handleDeleteBankQuestion(q.id)}
                                          className="h-10 w-10 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-full"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                    {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && (
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          onClick={() => handleAdd(q)} 
                                          disabled={processing}
                                          className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                        >
                                          <Plus className="w-6 h-6" />
                                        </Button>
                                    )}
                                  </div>
                              </div>

                              {/* Asset Traceability Metadata */}
                              {q.exams && q.exams.length > 0 && (
                                  <div className="pt-4 border-t border-slate-50 flex flex-wrap items-center gap-2">
                                    <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest mr-1">Utilized In:</span>
                                    {q.exams.map((usage, i) => (
                                        <div key={i} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100/50 text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                          {usage.exam.title}
                                        </div>
                                    ))}
                                  </div>
                              )}
                            </CardContent>
                        </Card>
                       );
                    })
                 )}
              </div>
           </div>
        )}

        {/* Right Panel: Exam Structure */}
        <div className="space-y-6 bg-slate-50/30 p-8 rounded-[48px] border border-muted/10 min-h-[90vh]">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3"><FileText className="w-5 h-5 text-indigo-500" /> Assessment Structure</h3>
              <Badge variant="secondary" className="font-black text-[11px] bg-slate-900 text-white px-5 py-2 rounded-full shadow-lg">{exam.questions.length} Linked</Badge>
           </div>
           <div className="space-y-6">
              {exam.questions.length === 0 ? <div className="p-40 text-center border-4 border-dashed rounded-[48px] bg-white flex flex-col items-center"><div className="p-8 bg-indigo-50 rounded-[32px] mb-8 animate-bounce"><ArrowRight className="w-12 h-12 text-indigo-600" /></div><h3 className="text-2xl font-black uppercase tracking-tight">Empty Canvas</h3></div> : exam.questions.map((eq, idx) => (
                 <Card key={eq.questionId} className="group relative overflow-hidden transition-all shadow-custom rounded-[32px] bg-white border-none border-b-4 border-b-indigo-100">
                    <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between space-y-0">
                       <div className="flex items-center gap-5">
                          <span className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[12px] font-black text-white tracking-widest shadow-lg">{idx + 1}</span>
                          <Badge variant="outline" className="text-[9px] font-black bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-widest px-3 py-1">{eq.question.type}</Badge>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 rounded-xl border border-muted/10"><span className="text-[10px] font-black uppercase opacity-60">Weightage:</span><span className="text-sm font-black text-indigo-700">{eq.marks} PTS</span></div>
                          {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && (
                             <>
                                <Button size="icon" variant="ghost" onClick={() => { setEditingQuestion(eq.question); setIsComposerOpen(true); }} className="h-10 w-10 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 rounded-full"><Edit3 className="w-5 h-5" /></Button>
                                {!eq.question.exams?.some(usage => usage.exam.status === 'ACTIVE' || usage.exam.status === 'COMPLETED') && (
                                   <Button size="icon" variant="ghost" onClick={() => handleDeleteBankQuestion(eq.questionId)} className="h-10 w-10 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-full" title="Purge from Repository"><Trash className="w-5 h-5" /></Button>
                                )}
                             </>
                          )}
                          {(exam.status === 'DRAFT' || exam.status === 'PUBLISHED') && <Button size="icon" variant="ghost" onClick={() => handleRemove(eq.questionId)} disabled={processing} className="h-10 w-10 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-full active:scale-95"><Trash2 className="w-5 h-5" /></Button>}
                       </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        {(() => {
                          const isFrozen = exam.status === 'ACTIVE' || exam.status === 'COMPLETED';
                          const text = isFrozen ? eq.questionTextSnapshot : eq.question.text;
                          const options = isFrozen ? (eq.optionsSnapshot ? JSON.parse(eq.optionsSnapshot) : []) : (eq.question.options || []);
                          return (
                             <>
                                <p className="text-xl font-bold text-slate-800 leading-tight mb-6">{text}</p>
                                {options.length > 0 && <div className="grid grid-cols-2 gap-4">{options.map(opt => <div key={opt.id || opt.label} className={`p-4 rounded-[20px] text-xs border flex items-center gap-4 transition-all ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50/50 border-slate-100 text-slate-500 font-medium'}`}><span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-muted/10 shadow-sm text-xs font-black">{opt.label}</span><span className="truncate">{opt.text}</span>{opt.isCorrect && <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-600" />}</div>)}</div>}
                             </>
                          );
                       })()}
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
