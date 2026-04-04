"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Save, Calendar, Send } from "lucide-react";

export default function ExamBuilder({ collegeId }) {
  const [loading, setLoading] = useState(false);
  
  // State for new exam
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    semester: 1,
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
  });

  const handleCreateDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          subjectId: "dummy-subject-id", 
          collegeId: collegeId,
        })
      });
      
      if (res.ok) {
        alert("Draft Exam Created Successfully!");
        setDraft({ ...draft, title: "", description: "" });
      } else {
        const err = await res.json();
        alert("Failed to create: " + err.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Exam Builder</h2>
          <p className="text-sm text-muted-foreground">Define parameters, link questions, and publish exams.</p>
        </div>
      </div>

      <Card className="border-primary/50 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Exam Metadata</CardTitle>
          <CardDescription>Setup the core settings for the new DRAFT exam.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Title</label>
            <input 
              type="text"
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. Data Structures Midterm"
              value={draft.title}
              onChange={e => setDraft({...draft, title: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Instructions for students..."
              value={draft.description}
              onChange={e => setDraft({...draft, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (Mins)</label>
              <input 
                type="number"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.duration}
                onChange={e => setDraft({...draft, duration: parseInt(e.target.value)})}
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium">Semester Target</label>
              <input 
                type="number"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.semester}
                onChange={e => setDraft({...draft, semester: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Marks</label>
              <input 
                type="number"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.totalMarks}
                onChange={e => setDraft({...draft, totalMarks: parseInt(e.target.value)})}
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium">Passing Marks</label>
              <input 
                type="number"
                className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={draft.passingMarks}
                onChange={e => setDraft({...draft, passingMarks: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4">
          <button onClick={handleCreateDraft} disabled={loading || !draft.title} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50 hover:bg-primary/90">
            <Save className="w-4 h-4" /> Save as DRAFT
          </button>
        </CardFooter>
      </Card>

      <Card className="opacity-50 pointer-events-none">
        <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5"/> Step 2: Publish & Snapshot Exam</CardTitle>
           <CardDescription>Lock the exam questions and make it live for students.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="bg-secondary/50 border border-dashed rounded-md p-8 text-center text-sm font-medium text-muted-foreground">
              Please create a DRAFT exam outline first to unlock this section.
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
