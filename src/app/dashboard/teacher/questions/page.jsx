"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Edit3,
  HelpCircle, 
  CheckCircle2, 
  Circle, 
  Layers,
  FileText,
  Filter
} from "lucide-react";

export default function QuestionsPage() {
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  
  // Editor State
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // stores the question object being edited
  
  const [formData, setFormData] = useState({
    text: "",
    type: "MCQ_SINGLE",
    subjectId: "",
    defaultMarks: 2,
    modelAnswer: "",
    options: [
      { text: "", label: "A", isCorrect: true, order: 0 },
      { text: "", label: "B", isCorrect: false, order: 1 }
    ]
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

        const qRes = await orgClient.questions.list();
        if (qRes.success) setQuestions(qRes.questions);
    } catch (e) { console.error("Load failed", e); }
    setLoading(false);
  }

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + formData.options.length); 
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", label: nextLabel, isCorrect: false, order: formData.options.length }]
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index).map((opt, i) => ({
      ...opt,
      label: String.fromCharCode(65 + i),
      order: i
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'isCorrect' && formData.type === 'MCQ_SINGLE') {
      newOptions.forEach((opt, i) => opt.isCorrect = i === index);
    } else {
      newOptions[index][field] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const startEdit = (q) => {
    setIsEditing(q);
    setFormData({
      text: q.text,
      type: q.type,
      subjectId: q.subjectId,
      defaultMarks: q.defaultMarks,
      modelAnswer: q.modelAnswer || "",
      options: q.options && q.options.length > 0 
        ? q.options.map(opt => ({ text: opt.text, label: opt.label, isCorrect: opt.isCorrect, order: opt.order }))
        : [
            { text: "", label: "A", isCorrect: true, order: 0 },
            { text: "", label: "B", isCorrect: false, order: 1 }
          ]
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.subjectId) return alert("Select a subject");
    
    try {
        let res;
        if (isEditing) {
            res = await orgClient.questions.update(isEditing.id, formData);
        } else {
            res = await orgClient.questions.create(formData);
        }

        if (res.success) {
          setIsAdding(false);
          setIsEditing(null);
          setFormData({
            text: "",
            type: "MCQ_SINGLE",
            subjectId: "",
            defaultMarks: 2,
            modelAnswer: "",
            options: [
              { text: "", label: "A", isCorrect: true, order: 0 },
              { text: "", label: "B", isCorrect: false, order: 1 }
            ]
          });
          loadInitialData();
        }
    } catch (e) { alert("Action failed"); }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const res = await orgClient.questions.delete(id);
        if (res.success) loadInitialData();
    } catch (e) { alert("Deletion failed"); }
  }

  const filteredQuestions = (questions || []).filter(q => {
    const matchesSearch = (q.text || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubjectId === "all" || q.subjectId === selectedSubjectId;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg transition-transform hover:scale-105">
              <BookOpen className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight">Question Repository</h1>
              <p className="text-muted-foreground mt-1 font-medium italic">Full CRUD Control over institutional assessments.</p>
           </div>
        </div>
        <Button 
          onClick={() => {
            setIsEditing(null);
            setIsAdding(!isAdding);
            if (!isAdding) {
               setFormData({
                  text: "", type: "MCQ_SINGLE", subjectId: "", defaultMarks: 2, modelAnswer: "",
                  options: [{ text: "", label: "A", isCorrect: true, order: 0 }, { text: "", label: "B", isCorrect: false, order: 1 }]
               });
            }
          }} 
          variant={isAdding ? "outline" : "default"}
          className={isAdding ? "" : "bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg transition-all active:scale-95"}
        >
          {isAdding ? "Close Editor" : <><Plus className="w-5 h-5 mr-2" /> Contribute Question</>}
        </Button>
      </header>

      {isAdding && (
        <Card className="border-2 border-indigo-500/20 shadow-2xl overflow-hidden relative animate-in slide-in-from-top-4 duration-300">
          <div className="h-1.5 bg-indigo-600 w-full" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-xl font-bold">{isEditing ? "Edit Component" : "New Assessment Component"}</CardTitle>
               <CardDescription>{isEditing ? "Modify existing question parameters." : "Configure question type and target discipline."}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                        <Layers className="w-4 h-4" /> Academic Subject
                      </Label>
                      <select 
                        className="w-full h-11 rounded-xl border border-muted-foreground/20 bg-background px-3 py-2 text-sm focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                        required
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                       <Label className="font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                          <Filter className="w-4 h-4" /> Component Type
                       </Label>
                       <div className="grid grid-cols-3 gap-2">
                          {["MCQ_SINGLE", "MCQ_MULTIPLE", "SUBJECTIVE"].map(type => (
                             <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({...formData, type})}
                                className={`px-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                                   formData.type === type 
                                   ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                                   : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                                }`}
                             >
                                {type.replace('_', ' ')}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="font-bold text-indigo-900 dark:text-indigo-100">Weightage (Marks)</Label>
                       <Input 
                          type="number" 
                          className="h-11 rounded-xl border-muted-foreground/20" 
                          value={formData.defaultMarks}
                          onChange={(e) => setFormData({...formData, defaultMarks: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-indigo-900 dark:text-indigo-100">Question Statement</Label>
                      <textarea 
                        className="w-full h-40 rounded-2xl border border-muted-foreground/20 bg-background px-4 py-4 text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                        placeholder="State the core academic challenge clearly..."
                        value={formData.text}
                        onChange={(e) => setFormData({...formData, text: e.target.value})}
                        required
                      />
                    </div>
                 </div>
              </div>

              {formData.type !== "SUBJECTIVE" ? (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="flex items-center justify-between">
                     <Label className="font-bold text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                       <HelpCircle className="w-5 h-5 text-indigo-600" /> Response Options
                     </Label>
                     <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="rounded-full border-indigo-200 text-indigo-600">
                        <Plus className="w-4 h-4 mr-1" /> Add Choice
                     </Button>
                  </div>
                  <div className="grid gap-3">
                    {formData.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3 animate-in slide-in-from-left-2 transition-all">
                        <button 
                          type="button"
                          onClick={() => handleOptionChange(i, 'isCorrect', !opt.isCorrect)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            opt.isCorrect ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-muted/50 border-transparent text-muted-foreground"
                          }`}
                        >
                           {opt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <Input 
                          placeholder={`Option ${opt.label}...`}
                          className="flex-1 h-11 rounded-xl border-muted-foreground/20"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
                        />
                        {formData.options.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(i)} className="text-muted-foreground hover:text-rose-600 rounded-full">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-dashed">
                  <Label className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Comprehensive Model Answer
                  </Label>
                  <textarea 
                    className="w-full h-32 rounded-2xl border border-muted-foreground/20 bg-background px-4 py-4 text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    placeholder="Provide the gold-standard answer for comparison during grading..."
                    value={formData.modelAnswer}
                    onChange={(e) => setFormData({...formData, modelAnswer: e.target.value})}
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                 {isEditing ? "Update Repository Entry" : "Persist to Repository"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-muted/20">
               <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-black uppercase text-muted-foreground tracking-widest">Discipline Filter</CardTitle>
               </CardHeader>
               <CardContent className="space-y-1">
                  <button 
                    onClick={() => setSelectedSubjectId("all")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                       selectedSubjectId === "all" ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                     All Disciplines
                  </button>
                  {subjects.map(s => (
                     <button
                        key={s.id}
                        onClick={() => setSelectedSubjectId(s.id)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                           selectedSubjectId === s.id ? "bg-indigo-600 text-white shadow-lg" : "text-muted-foreground hover:bg-muted"
                        }`}
                     >
                        {s.name}
                     </button>
                  ))}
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-3 space-y-6">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
               <Input 
                  placeholder="Keyword search in repository..." 
                  className="pl-12 h-14 text-lg rounded-2xl border-muted/20 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>

            <div className="grid gap-6">
               {loading ? (
                  <div className="p-12 text-center animate-pulse text-muted-foreground italic">Decrypting repository data...</div>
               ) : filteredQuestions.length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed rounded-3xl bg-muted/20 flex flex-col items-center">
                     <HelpCircle className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                     <h3 className="text-xl font-bold text-muted-foreground">Empty Repository Segment</h3>
                     <p className="text-muted-foreground mt-2 max-w-xs font-medium italic">No questions found matching your criteria.</p>
                  </div>
               ) : filteredQuestions.map((q) => (
                  <Card key={q.id} className="group overflow-hidden shadow-sm hover:shadow-xl transition-all border-muted/20 hover:border-indigo-500/20">
                     <CardHeader className="flex flex-row items-start justify-between pb-4">
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-black border-indigo-100 rounded-md py-1">
                                 {q.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter bg-muted px-2 py-1 rounded">
                                {q.subject?.name || "Uncategorized"}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{q.defaultMarks} Marks</span>
                           </div>
                           <h2 className="text-xl font-black leading-tight text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                              {q.text}
                           </h2>
                        </div>
                        <div className="flex gap-1 ml-4">
                            {q.creatorId === user?.id && (
                               <>
                                 <Button variant="ghost" size="icon" onClick={() => startEdit(q)} className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-full shrink-0">
                                    <Edit3 className="w-4 h-4" />
                                 </Button>
                                 <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-full shrink-0">
                                    <Trash2 className="w-5 h-5" />
                                 </Button>
                               </>
                            )}
                        </div>
                     </CardHeader>
                     {q.options?.length > 0 && (
                        <CardContent className="pt-0 pb-6 grid md:grid-cols-2 gap-2">
                           {q.options.map((opt) => (
                              <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                opt.isCorrect ? "bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 font-bold" : "bg-muted/10 border-transparent text-muted-foreground"
                              }`}>
                                 <span className="w-6 h-6 rounded flex items-center justify-center bg-background border text-[10px] font-black group-hover:shadow-sm">{opt.label}</span>
                                 <span className="text-sm">{opt.text}</span>
                                 {opt.isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-600" />}
                              </div>
                           ))}
                        </CardContent>
                     )}
                     {q.type === "SUBJECTIVE" && q.modelAnswer && (
                        <CardContent className="pt-0 pb-6">
                           <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 italic text-sm text-slate-500 line-clamp-2">
                              <span className="font-black text-[10px] uppercase block mb-1 not-italic tracking-widest">Model Reference:</span>
                              "{q.modelAnswer}"
                           </div>
                        </CardContent>
                     )}
                  </Card>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
