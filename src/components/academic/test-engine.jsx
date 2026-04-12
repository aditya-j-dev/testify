"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Send, ShieldAlert, CloudOff, CloudCheck } from "lucide-react";


export default function TestEngine({ attemptId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | error | success
  
  // Mock Data for UI presentation
  const mockExam = {
    title: "Data Structures Midterm",
    timeLeftMins: 59,
    questions: [
      { id: "q1", text: "What is the time complexity of binary search tree insertion?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"] },
      { id: "q2", text: "Explain how a Hash Table works.", subjective: true }
    ]
  };

  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const lastSyncTime = useRef(new Date());

  // Background Auto-Save Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 15000); // Auto-save every 15s
    return () => clearInterval(interval);
  }, [answers, activeQuestion]);

  // --- Proctoring Script ---
  useEffect(() => {
    const logEvent = (eventName, metadata = {}) => {
       fetch(`/api/attempt/${attemptId}/proctor-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: eventName, metadata })
       }).catch(() => {}); // silent fail on metrics
    };

    const handleVisibility = () => {
       if (document.hidden) logEvent("TAB_SWITCH");
       else logEvent("FOCUS", { returnedAt: Date.now() });
    };

    const handleCopy = (e) => { e.preventDefault(); logEvent("COPY"); };
    const handlePaste = (e) => { e.preventDefault(); logEvent("PASTE"); };
    const handleContextMenu = (e) => { e.preventDefault(); logEvent("RIGHT_CLICK"); };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [attemptId]);

  const handleAutoSave = async () => {
    const currentQId = mockExam.questions[activeQuestion].id;
    const currentAnswerData = answers[currentQId];
    if (!currentAnswerData) return; // Nothing to save yet

    setSyncStatus("syncing");
    
    // In real app, you compare ref with answer changes to avoid useless API calls.
    try {
      const res = await fetch(`/api/attempt/${attemptId}/sync`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQId,
          selectedOptions: currentAnswerData.selected || [],
          subjectiveText: currentAnswerData.text || "",
          clientSavedAt: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        setSyncStatus("success");
      } else if (res.status === 409) {
         setSyncStatus("error");
         alert("Security Violation: Clock drift detected or Time Expired!");
      } else {
         setSyncStatus("error");
      }
    } catch {
       setSyncStatus("error");
    }
  };

  const submitFinal = async () => {
    setLoading(true);
    try {
       const res = await fetch(`/api/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "SUBMIT", attemptId })
       });
       if(res.ok) {
          router.push("/dashboard/student");
       } else {
          alert("Failed to close attempt cleanly");
       }
    } finally {
       setLoading(false);
    }
  };

  const currentQ = mockExam.questions[activeQuestion];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4">
         <div>
            <h1 className="text-2xl font-bold tracking-tight">{mockExam.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground font-mono">
               <Clock className="w-4 h-4 text-primary" /> {mockExam.timeLeftMins} Minutes Remaining
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            {/* Sync Indicator */}
            {syncStatus === "syncing" && <span className="text-sm text-amber-500 animate-pulse">Syncing...</span>}
            {syncStatus === "success" && <span className="text-sm text-emerald-500 flex items-center gap-1"><CloudCheck className="w-4 h-4"/> Saved</span>}

            {syncStatus === "error" && <span className="text-sm text-rose-500 flex items-center gap-1"><CloudOff className="w-4 h-4"/> Network Error</span>}
            
            <button onClick={submitFinal} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 flex items-center gap-2 rounded-md font-medium shadow-sm transition-colors">
               <Send className="w-4 h-4" /> End Exam
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* Sidebar Nav */}
         <div className="col-span-1 rounded-md border p-4 space-y-4 shadow-sm bg-card h-fit">
            <h3 className="font-semibold text-sm mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
               {mockExam.questions.map((q, idx) => (
                  <button 
                     key={idx}
                     onClick={() => setActiveQuestion(idx)}
                     className={`h-10 w-full rounded-md border font-medium text-sm transition-all
                        ${activeQuestion === idx ? 'ring-2 ring-primary border-primary' : ''}
                        ${answers[q.id] ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-secondary'}
                     `}
                  >
                     {idx + 1}
                  </button>
               ))}
            </div>
            
            <div className="mt-8 pt-4 border-t space-y-2">
               <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><ShieldAlert className="w-4 h-4 text-amber-500" /> Focus Tracking Active</div>
            </div>
         </div>

         {/* Main Question Panel */}
         <div className="col-span-1 md:col-span-3">
            <Card className="min-h-[400px] shadow-sm">
               <CardHeader className="border-b bg-secondary/20">
                  <span className="text-sm font-semibold text-primary mb-2 inline-block">Question {activeQuestion + 1}</span>
                  <CardTitle className="text-xl leading-relaxed">{currentQ.text}</CardTitle>
               </CardHeader>
               <CardContent className="pt-8">
                  {currentQ.subjective ? (
                     <textarea 
                        className="w-full min-h-[200px] p-4 rounded-md border bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 text-sm leading-relaxed"
                        placeholder="Type your detailed answer here..."
                        value={answers[currentQ.id]?.text || ""}
                        onChange={(e) => {
                           setAnswers({...answers, [currentQ.id]: { text: e.target.value }});
                           setSyncStatus("idle");
                        }}
                     />
                  ) : (
                     <div className="space-y-3">
                        {currentQ.options.map((opt, i) => (
                           <label 
                              key={i} 
                              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${answers[currentQ.id]?.selected?.includes(opt) ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'hover:bg-secondary/50 hover:border-border/80'}`}
                           >
                              <input 
                                 type="radio" 
                                 name={`q-${currentQ.id}`}
                                 checked={answers[currentQ.id]?.selected?.includes(opt) || false}
                                 onChange={() => {
                                    setAnswers({...answers, [currentQ.id]: { selected: [opt] }});
                                    setSyncStatus("idle");
                                 }}
                                 className="w-4 h-4 text-primary focus:ring-primary border-muted"
                              />
                              <span className="font-medium">{opt}</span>
                           </label>
                        ))}
                     </div>
                  )}
               </CardContent>
            </Card>
            
            <div className="flex justify-between mt-4">
               <button 
                  disabled={activeQuestion === 0}
                  onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                  className="px-6 py-2 border rounded-md disabled:opacity-50 text-sm font-medium hover:bg-secondary"
               >
                  Previous
               </button>
               <button 
                  disabled={activeQuestion === mockExam.questions.length - 1}
                  onClick={() => {
                     handleAutoSave(); // force sync on next
                     setActiveQuestion(prev => Math.min(mockExam.questions.length - 1, prev + 1));
                  }}
                  className="px-6 py-2 bg-secondary text-foreground border rounded-md disabled:opacity-50 text-sm font-medium hover:bg-secondary/80"
               >
                  Next Question
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
