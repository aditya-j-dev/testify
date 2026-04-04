"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Search, Layers, Edit3, Trash2, X } from "lucide-react";

export default function SubjectsPage() {
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Editor State
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", credits: 3 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.collegeId) {
      loadSubjects();
    }
  }, [user]);

  async function loadSubjects() {
    setLoading(true);
    try {
        const res = await orgClient.subjects.list(user.collegeId);
        if (res.success) setSubjects(res.subjects);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !user?.collegeId) return;
    setProcessing(true);
    
    try {
        let res;
        if (isEditing) {
            res = await orgClient.subjects.update(isEditing.id, formData);
        } else {
            res = await orgClient.subjects.create({ ...formData, collegeId: user.collegeId });
        }

        if (res.success) {
            setFormData({ name: "", credits: 3 });
            setIsEditing(null);
            loadSubjects();
        } else {
            alert(res.message || "Action failed");
        }
    } catch (e) { alert("An error occurred"); }
    setProcessing(false);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure? This may affect linked questions and exams.")) return;
    try {
        const res = await orgClient.subjects.delete(id);
        if (res.success) loadSubjects();
    } catch (e) { alert("Deletion failed"); }
  }

  const startEdit = (s) => {
    setIsEditing(s);
    setFormData({ name: s.name, credits: s.credits });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSubjects = (subjects || []).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg transition-transform hover:scale-105">
              <BookOpen className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-3xl font-black tracking-tight">Academic Subjects</h1>
              <p className="text-muted-foreground mt-1 font-medium italic">Full Lifecycle Management of institutional disciplines.</p>
           </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Editor Form */}
        <Card className={`lg:col-span-1 h-fit border-l-4 shadow-sm transition-all ${isEditing ? "border-l-amber-500 shadow-amber-50" : "border-l-indigo-500"}`}>
          <CardHeader className="relative">
            {isEditing && (
              <Button 
                variant="ghost" size="icon" 
                onClick={() => { setIsEditing(null); setFormData({ name: "", credits: 3 }); }}
                className="absolute right-4 top-4 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="text-lg flex items-center gap-2">
              {isEditing ? <Edit3 className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
              {isEditing ? "Modify Discipline" : "Define Subject"}
            </CardTitle>
            <CardDescription>{isEditing ? "Update subject parameters below." : "Register a new discipline in the curriculum."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sName">Subject Title</Label>
                <Input 
                  id="sName" 
                  placeholder="e.g. Artificial Intelligence"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sCredits">Credits</Label>
                <Input 
                  id="sCredits" 
                  type="number"
                  placeholder="3"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" 
                className={`w-full text-white shadow-lg transition-all active:scale-95 ${
                  isEditing 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "bg-indigo-600 hover:bg-indigo-700"
                }`} 
                disabled={processing}
              >
                {processing ? "Syncing..." : isEditing ? "Update Subject" : "Register Subject"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Directory */}
        <Card className="lg:col-span-2 shadow-sm border-muted/20">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
             <CardTitle className="text-lg font-bold">Curriculum Directory</CardTitle>
             <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search subjects..." 
                  className="pl-8 rounded-full h-9 bg-muted/20 focus:ring-4 focus:ring-indigo-100 transition-all border-none" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Discipline Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">Accessing curriculum data...</TableCell></TableRow>
                ) : filteredSubjects.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">
                        {searchQuery ? "No matches found." : "No subjects defined yet."}
                     </TableCell>
                  </TableRow>
                ) : filteredSubjects.map((s) => (
                  <TableRow key={s.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-3">
                       <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900 rounded border border-indigo-100 dark:border-indigo-800">
                         <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                       </div>
                       {s.name}
                    </TableCell>
                    <TableCell>
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                         {s.credits} Credits
                       </span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-full h-8 w-8">
                           <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-full h-8 w-8">
                           <Trash2 className="w-4 h-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
