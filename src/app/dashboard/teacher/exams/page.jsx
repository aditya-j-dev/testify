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
  ClipboardList, 
  Trash2, 
  Clock, 
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function FacultyExamsPage() {
  const { user } = useAuth();
  
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
    semester: 1
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

        const exRes = await orgClient.exams.list();
        if (exRes.success) setExams(exRes.exams);
    } catch (e) {
        console.error("Load failed", e);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.subjectId) return alert("Select a subject");
    
    try {
        const res = await orgClient.exams.create(formData);
        if (res.success) {
          setIsAdding(false);
          loadInitialData();
          // Navigate to the builder or stay here? 
          // For now stays here to see the list update.
        }
    } catch (e) { alert("Draft creation failed"); }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure? Only DRAFT exams can be deleted.")) return;
    try {
        const res = await orgClient.exams.delete(id);
        if (res.success) loadInitialData();
        else alert(res.message);
    } catch (e) { alert("Deletion failed"); }
  }

  const filteredExams = (exams || []).filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'PUBLISHED': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'LIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse';
      case 'COMPLETED': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg transition-transform hover:scale-105">
              <ClipboardList className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight">Assessment Console</h1>
              <p className="text-muted-foreground mt-1 font-medium tracking-tight">Design, schedule, and snapshot institutional exams.</p>
           </div>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Design New Exam
        </Button>
      </header>

      {isAdding && (
        <Card className="border-2 border-indigo-500/20 shadow-2xl overflow-hidden relative animate-in slide-in-from-top-4 duration-300">
          <div className="h-1.5 bg-indigo-600 w-full" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
               <CardTitle className="text-xl font-bold">Initiate Assessment Draft</CardTitle>
               <CardDescription>Define the core parameters and context for this exam.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-full text-muted-foreground hover:text-indigo-600 transition-colors">
               Cancel
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="font-bold text-indigo-900 dark:text-indigo-100">Exam Title</Label>
                       <Input 
                          placeholder="e.g. Mid-Semester Theory Exam 2024"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                       />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-indigo-900 dark:text-indigo-100">Academic Subject</Label>
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
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="font-bold text-indigo-900 dark:text-indigo-100">Duration (Mins)</Label>
                          <Input 
                             type="number"
                             value={formData.duration}
                             onChange={(e) => setFormData({...formData, duration: e.target.value})}
                             required
                          />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-bold text-indigo-900 dark:text-indigo-100">Semester</Label>
                          <Input 
                             type="number"
                             value={formData.semester}
                             onChange={(e) => setFormData({...formData, semester: e.target.value})}
                             required
                          />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="font-bold text-indigo-900 dark:text-indigo-100">Description / Instructions</Label>
                       <textarea 
                          className="w-full h-[152px] rounded-xl border border-muted-foreground/20 bg-background px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                          placeholder="Guidelines for students appearing in the exam..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-indigo-900 dark:text-indigo-100">Total Marks (Cap)</Label>
                        <Input 
                           type="number"
                           value={formData.totalMarks}
                           onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                           required
                        />
                    </div>
                 </div>
              </div>
              <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                 Initialize Assessment Build
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Registry Search */}
      <div className="relative group">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
         <Input 
            placeholder="Search by assessment title..." 
            className="pl-12 h-14 text-lg rounded-2xl border-muted/20 shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
         />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic">Decrypting examination catalog...</div>
         ) : filteredExams.length === 0 ? (
            <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[32px] bg-muted/20 flex flex-col items-center">
               <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
               <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-tight">Registry Empty</h3>
               <p className="text-muted-foreground mt-2 max-w-xs font-medium italic">Initiate your first draft assessment to begin the examination lifecycle.</p>
            </div>
         ) : filteredExams.map((ex) => (
            <Card key={ex.id} className="group relative overflow-hidden shadow-sm hover:shadow-2xl transition-all border-muted/20 hover:border-indigo-500/20 rounded-[28px] flex flex-col">
               <div className="p-1.5 flex flex-col h-full">
                  <div className="p-6 pb-4 space-y-4 flex-1">
                     <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`font-black tracking-widest uppercase text-[10px] py-1 border-opacity-50 ${getStatusColor(ex.status)}`}>
                           {ex.status}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-tighter">
                           <Clock className="w-3.5 h-3.5" />
                           {ex.duration} Mins
                        </div>
                     </div>
                     
                     <Link href={`/dashboard/teacher/exams/${ex.id}`}>
                        <h2 className="text-xl font-black leading-tight text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2">
                           {ex.title}
                        </h2>
                     </Link>

                     <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                           <BookOpen className="w-4 h-4 text-indigo-400" />
                           <span className="truncate">{ex.subject?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                           <Calendar className="w-4 h-4 text-indigo-400" />
                           <span>Sem {ex.semester}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto px-6 py-4 flex items-center justify-between border-t border-dashed bg-muted/5 group-hover:bg-indigo-50/10 transition-colors">
                     <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                           {ex._count.questions}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground ml-4 flex items-center">
                           Questions
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1">
                        {ex.status === 'DRAFT' && (
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(ex.id)} className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-full">
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        )}
                        <Link href={`/dashboard/teacher/exams/${ex.id}`}>
                           <Button size="icon" className="h-9 w-9 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                              <ChevronRight className="w-5 h-5" />
                           </Button>
                        </Link>
                     </div>
                  </div>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
}
