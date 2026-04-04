"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Search, 
  Trash2, 
  GripVertical, 
  Plus, 
  Play, 
  BookOpen, 
  Clock, 
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ExamBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Search state
  const [bankSearch, setBankSearch] = useState("");
  
  useEffect(() => {
    if (user?.collegeId && id) {
      loadData();
    }
  }, [user, id]);

  async function loadData() {
    setLoading(true);
    try {
        const exRes = await orgClient.exams.getById(id);
        if (exRes.success) {
            setExam(exRes.exam);
            
            // Load bank questions for the SAME subject
            const qRes = await orgClient.questions.list({ subjectId: exRes.exam.subjectId });
            if (qRes.success) {
                // Filter out questions already in the exam
                const linkedIds = new Set(exRes.exam.questions.map(eq => eq.questionId));
                setBankQuestions(qRes.questions.filter(q => !linkedIds.has(q.id)));
            }
        }
    } catch (e) {
        console.error("Load failed", e);
    }
    setLoading(false);
  }

  const currentTotalMarks = useMemo(() => {
    return (exam?.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0);
  }, [exam]);

  async function handleAdd(question) {
    if (exam.status !== 'DRAFT') return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.addQuestion(id, {
            questionId: question.id,
            order: exam.questions.length,
            marks: question.defaultMarks
        });
        if (res.success) {
            loadData();
        }
    } catch (e) { alert("Failed to add question"); }
    setProcessing(false);
  }

  async function handleRemove(questionId) {
    if (exam.status !== 'DRAFT') return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.removeQuestion(id, questionId);
        if (res.success) {
            loadData();
        }
    } catch (e) { alert("Failed to remove question"); }
    setProcessing(false);
  }

  async function handlePublish() {
    if (!confirm("Are you sure? Once published, questions will be snapshotted and the exam structure will be locked for integrity.")) return;
    setProcessing(true);
    try {
        const res = await orgClient.exams.publish(id, {});
        if (res.success) {
            router.push('/dashboard/teacher/exams');
        } else {
            alert(res.message);
        }
    } catch (e) { alert("Publish failed"); }
    setProcessing(false);
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic">Synchronizing Assessment Builder...</div>;
  if (!exam) return <div className="p-20 text-center">Exam not found.</div>;

  const filteredBank = bankQuestions.filter(q => 
    q.text.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 container mx-auto pb-20">
      {/* Top Navigation & Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link href="/dashboard/teacher/exams">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 hover:text-indigo-600">
                 <ChevronLeft className="w-5 h-5" />
              </Button>
           </Link>
           <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-black tracking-tight">{exam.title}</h1>
                 <Badge variant="outline" className={`font-black uppercase text-[10px] tracking-widest ${exam.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {exam.status}
                 </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> {exam.subject?.name} • <Clock className="w-4 h-4 ml-2" /> {exam.duration} Mins
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center ${currentTotalMarks > exam.totalMarks ? 'border-rose-200 bg-rose-50 text-rose-700 animate-bounce' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
              <span className="text-[10px] font-black uppercase tracking-tighter shrink-0">Accumulated Marks</span>
              <span className="text-lg font-black leading-none">{currentTotalMarks} <span className="text-xs opacity-50">/ {exam.totalMarks}</span></span>
           </div>
           {exam.status === 'DRAFT' && (
              <Button 
                onClick={handlePublish}
                disabled={processing || exam.questions.length === 0 || currentTotalMarks > exam.totalMarks}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg transition-all active:scale-95"
              >
                 <Play className="w-5 h-5 mr-2" /> Publish Session
              </Button>
           )}
        </div>
      </div>

      {exam.status === 'PUBLISHED' && (
        <Card className="bg-indigo-50/50 border-indigo-100 border-2 overflow-hidden">
           <div className="bg-indigo-500 h-1 w-full" />
           <CardContent className="p-4 flex items-center gap-4">
              <Lock className="w-8 h-8 text-indigo-600" />
              <div>
                 <h3 className="font-bold text-indigo-900">Immutable Snapshot Active</h3>
                 <p className="text-sm text-indigo-700 font-medium tracking-tight">This assessment structure and question content are locked to ensure long-term integrity.</p>
              </div>
           </CardContent>
        </Card>
      )}

      {/* Main Builder Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Question Library */}
        <div className="space-y-4">
           <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Search className="w-4 h-4" /> Academic Library
              </h3>
              <Badge variant="secondary" className="font-black text-[10px]">{bankQuestions.length} Available</Badge>
           </div>
           
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                 placeholder="Search Bank content..." 
                 className="pl-9 h-11 rounded-xl bg-muted/20 border-none focus:ring-4 focus:ring-indigo-50"
                 value={bankSearch}
                 onChange={(e) => setBankSearch(e.target.value)}
                 disabled={exam.status !== 'DRAFT'}
              />
           </div>

           <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredBank.length === 0 ? (
                 <div className="p-12 text-center border border-dashed rounded-3xl bg-muted/10 italic text-muted-foreground">
                    No relevant questions available in the subject library.
                 </div>
              ) : filteredBank.map(q => (
                 <Card key={q.id} className="group hover:border-indigo-200 transition-all shadow-sm">
                    <CardContent className="p-4 flex gap-4">
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             <Badge className="text-[9px] font-black uppercase leading-none py-1 h-fit" variant="secondary">{q.type.replace('_', ' ')}</Badge>
                             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{q.defaultMarks} Marks Asset</span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{q.text}</p>
                       </div>
                       {exam.status === 'DRAFT' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleAdd(q)} 
                            disabled={processing}
                            className="shrink-0 rounded-full hover:bg-emerald-50 hover:text-emerald-600"
                          >
                             <Plus className="w-5 h-5" />
                          </Button>
                       )}
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>

        {/* Right: Exam Structure */}
        <div className="space-y-4">
           <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 underline decoration-indigo-300 underline-offset-8">
                 <FileText className="w-4 h-4" /> Assessment Flow
              </h3>
              <Badge variant="secondary" className="font-black text-[10px]">{exam.questions.length} Selected</Badge>
           </div>

           <div className="space-y-4">
              {exam.questions.length === 0 ? (
                 <div className="p-32 text-center border-2 border-dashed rounded-[32px] bg-indigo-50/20 flex flex-col items-center">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                       <ArrowRight className="w-8 h-8 text-indigo-400 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900">Assemble Assessment</h3>
                    <p className="text-indigo-700/60 text-sm max-w-xs font-medium">Select assets from the left panel to begin construction.</p>
                 </div>
              ) : exam.questions.map((eq, idx) => (
                 <Card key={eq.questionId} className="group relative overflow-hidden transition-all hover:shadow-lg border-indigo-500/10">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                       <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-black text-indigo-600 tracking-tighter">
                             {idx + 1}
                          </span>
                          <Badge variant="outline" className="text-[8px] font-black bg-white dark:bg-slate-900 border-indigo-100">{eq.question.type}</Badge>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-lg border border-transparent hover:border-muted-foreground/20">
                             <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Allocation:</span>
                             <span className="text-xs font-bold text-indigo-600">{eq.marks}</span>
                          </div>
                          {exam.status === 'DRAFT' && (
                             <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleRemove(eq.questionId)} 
                                disabled={processing}
                                className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-full"
                             >
                                <Trash2 className="w-4 h-4" />
                             </Button>
                          )}
                       </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                       <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{eq.question.text}</p>
                       
                       {/* Options Preview */}
                       {eq.question.options?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                             {eq.question.options.map(opt => (
                                <div key={opt.id} className={`p-2 rounded-lg text-[10px] border flex items-center gap-2 ${opt.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-muted/10 border-transparent text-muted-foreground'}`}>
                                   <span className="w-4 h-4 flex items-center justify-center bg-background border text-[8px] font-black rounded">{opt.label}</span>
                                   <span className="truncate">{opt.text}</span>
                                   {opt.isCorrect && <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-600" />}
                                </div>
                             ))}
                          </div>
                       )}
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
