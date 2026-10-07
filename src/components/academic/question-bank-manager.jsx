"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Search, Edit2, CheckCircle2 } from "lucide-react";

export default function QuestionBankManager({ collegeId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState(false);
  
  // State for new question draft
  const [draft, setDraft] = useState({
    text: "",
    type: "MCQ_SINGLE",
    defaultMarks: 1,
    options: [
      { text: "", isCorrect: true, label: "A" },
      { text: "", isCorrect: false, label: "B" },
      { text: "", isCorrect: false, label: "C" },
      { text: "", isCorrect: false, label: "D" }
    ]
  });

  // Mock fetch - in reality you pass a subjectId
  useEffect(() => {
    // getQuestionsBySubject API call
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Normally subjectId would come from a dropdown context
          subjectId: "dummy-subject-id", 
          collegeId: collegeId,
          text: draft.text,
          type: draft.type,
          defaultMarks: draft.defaultMarks,
          options: draft.options
        })
      });
      
      if (res.ok) {
        setQuestions([...questions, draft]);
        setNewQuestionForm(false);
        setDraft({ ...draft, text: "" }); // reset
      } else {
        const err = await res.json();
        alert("Failed to save: " + err.message);
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
          <h2 className="text-xl font-bold tracking-tight">Question Bank</h2>
          <p className="text-sm text-muted-foreground">Manage your exam questions and model answers.</p>
        </div>
        <button 
          onClick={() => setNewQuestionForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" /> Add Question
        </button>
      </div>

      {newQuestionForm && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Create New Question</CardTitle>
            <CardDescription>Select subject, type, and fill out options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Text</label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What is the capital of France?"
                value={draft.text}
                onChange={e => setDraft({...draft, text: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Type</label>
                <select 
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={draft.type}
                  onChange={e => setDraft({...draft, type: e.target.value})}
                >
                  <option value="MCQ_SINGLE">Multiple Choice (Single Answer)</option>
                  <option value="MCQ_MULTIPLE">Multiple Choice (Multi Answer)</option>
                  <option value="SUBJECTIVE">Subjective (Essay)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Marks</label>
                <input 
                  type="number"
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={draft.defaultMarks}
                  onChange={e => setDraft({...draft, defaultMarks: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {draft.type !== "SUBJECTIVE" && (
              <div className="space-y-3 pt-4 border-t">
                <label className="text-sm font-medium">Options</label>
                {draft.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <button 
                      onClick={() => setDraft(prev => ({
                        ...prev,
                        options: prev.options.map((o, i) => ({ ...o, isCorrect: i === idx }))
                      }))}
                      className={`p-2 rounded-full border ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'border-input text-muted-foreground'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm text-muted-foreground w-4">{opt.label}.</span>
                    <input 
                      type="text"
                      placeholder={`Option ${opt.label}`}
                      className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={opt.text}
                      onChange={e => setDraft(prev => {
                        const newOpts = [...prev.options];
                        newOpts[idx].text = e.target.value;
                        return { ...prev, options: newOpts };
                      })}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-4">
            <button onClick={() => setNewQuestionForm(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md">Cancel</button>
            <button onClick={handleSave} disabled={loading || !draft.text} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50">Save Question</button>
          </CardFooter>
        </Card>
      )}

      {/* List Display */}
      <div className="border rounded-md divide-y">
         <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Search className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">Select a subject to view its question bank.</p>
         </div>
      </div>
    </div>
  );
}
