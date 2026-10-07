"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { studentClient } from "@/lib/api-client/student.client";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Info, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  MonitorX, 
  MonitorCheck, 
  Lock,
  Maximize2,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ExamLobbyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Hardware, 3: Fullscreen
  const [screenSecurity, setScreenSecurity] = useState({ verified: false, count: 0, error: null });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (user && id) loadExam();
    
    const handleFullscreenChange = () => {
       setIsFullscreen(!!document.fullscreenElement);
    };

    // Monitor hardware continuously if on step 2
    let interval;
    if (currentStep === 2) {
       checkScreenSecurity();
       interval = setInterval(checkScreenSecurity, 2000);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
       if (interval) clearInterval(interval);
       document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [user, id, currentStep]);

  async function checkScreenSecurity() {
    try {
       if (window.screen.isExtended) {
          setScreenSecurity({ verified: false, count: 2, error: "Multiple displays detected" });
          return;
       }

       if ('getScreenDetails' in window) {
          const details = await window.getScreenDetails();
          if (details.screens.length > 1) {
             setScreenSecurity({ verified: false, count: details.screens.length, error: "Hardware Violation: Secondary Monitor Active" });
          } else {
             setScreenSecurity({ verified: true, count: 1, error: null });
          }
       } else {
          setScreenSecurity({ verified: true, count: 1, error: null });
       }
    } catch (err) {
       if (err.name === 'NotAllowedError') {
          setScreenSecurity({ verified: false, count: 0, error: "Permission Denied: Screen Security Access Required" });
       } else {
          setScreenSecurity({ verified: true, count: 1, error: null });
       }
    }
  }

  async function loadExam() {
    setLoading(true);
    try {
      const res = await studentClient.exams.getById(id);
      if (res.success) setExam(res.exam);
    } catch (e) { console.error("Load failed", e); }
    setLoading(false);
  }

  async function handleFullscreenRequest() {
    try {
       await document.documentElement.requestFullscreen();
    } catch (err) {
       alert("Fullscreen engage failed. Please check permissions.");
    }
  }

  async function handleLaunch() {
    setStarting(true);
    try {
       const res = await studentClient.exams.start(id);
       if (res.success) {
          router.push(`/dashboard/student/exams/${id}/active`);
       } else {
          alert(res.message);
       }
    } catch (e) { alert("Initialization failed"); }
    setStarting(false);
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-muted-foreground font-black uppercase tracking-widest italic text-sm">Synchronizing Gate Registry...</div>;
  if (!exam) return <div className="p-20 text-center font-black uppercase text-rose-500">Security Access Denied. Registry Corrupted.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 mt-12 px-4 space-y-12">
       {/* Header & Step Track */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-6">
             <Link href="/dashboard/student/exams">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full border border-muted/10 hover:bg-slate-50 transition-all active:scale-95">
                   <ChevronLeft className="w-7 h-7" />
                </Button>
             </Link>
             <div>
                <h1 className="text-4xl font-black text-slate-900 leading-none tracking-tight italic">ENTRANCE GATEWAY</h1>
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-2">Protocol: {exam.title}</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center gap-4">
                   <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-xs border-2 transition-all ${
                      currentStep === step ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl shadow-indigo-600/20 scale-110' :
                      currentStep > step ? 'bg-emerald-500 border-emerald-600 text-white' :
                      'bg-white border-muted/10 text-slate-300'
                   }`}>
                      {currentStep > step ? <CheckCircle2 className="size-5" /> : step}
                   </div>
                   {step < 3 && <div className={`w-12 h-0.5 rounded-full ${currentStep > step ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                </div>
             ))}
          </div>
       </div>

       {/* Step Content */}
       <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          {currentStep === 1 && (
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <Card className="border-none shadow-2xl rounded-[40px] bg-white overflow-hidden border-b-[12px] border-b-indigo-100">
                      <CardHeader className="p-12 border-b border-muted/5">
                         <div className="flex items-center gap-4 mb-4">
                            <Badge className="bg-indigo-50 text-indigo-700 font-black border-none px-4 py-1.5 uppercase text-[10px] tracking-widest italic">Phase 01: Rules of Engagement</Badge>
                         </div>
                         <CardTitle className="text-4xl font-black tracking-tight">{exam.title}</CardTitle>
                         <CardDescription className="font-bold text-slate-400 mt-4 uppercase tracking-[0.1em] text-[11px] flex flex-wrap gap-6">
                            <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-indigo-400" /> {exam.duration}m Duration</span>
                            <span className="flex items-center gap-2.5 text-emerald-600"><Zap className="w-4 h-4" /> {exam.totalMarks} Points</span>
                            <span className="flex items-center gap-2.5 text-slate-900"><ShieldCheck className="w-4 h-4" /> Proctoring Active</span>
                         </CardDescription>
                      </CardHeader>
                      <CardContent className="p-12 bg-slate-50/30">
                         <div className="grid md:grid-cols-2 gap-8">
                            {[
                               { t: "FullScreen Focus", d: "Window must remain in dedicated FullScreen mode at all times.", i: <Maximize2 className="size-5 text-indigo-500" /> },
                               { t: "Hardware Lockdown", d: "Secondary displays and recording devices are strictly prohibited.", i: <MonitorX className="size-5 text-rose-500" /> },
                               { t: "Institutional Sync", d: "Automated pulse synchronization occurs every 30 seconds.", i: <RotateCcw className="size-5 text-emerald-500" /> },
                               { t: "Final Integrity", d: "Once submitted, the academic payload cannot be modified.", i: <Zap className="size-5 text-amber-500" /> }
                            ].map((rule, i) => (
                               <div key={i} className="flex gap-5 group">
                                  <div className="size-12 rounded-2xl bg-white border border-muted/10 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                                     {rule.i}
                                  </div>
                                  <div>
                                     <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{rule.t}</h4>
                                     <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">{rule.d}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </CardContent>
                   </Card>
                </div>
                <div className="space-y-6">
                   <Card className="rounded-[40px] border-none shadow-2xl bg-slate-900 text-white p-10 flex flex-col items-center justify-center text-center">
                      <div className="size-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 shadow-inner shadow-black/20">
                         <FileText className="size-10 text-indigo-400" />
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tighter">PROTOCOL ACCEPECTANCE</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-3 leading-relaxed">By proceeding, you agree to institutional proctoring standards.</p>
                      <Button 
                         onClick={() => setCurrentStep(2)}
                         className="w-full h-16 mt-10 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase tracking-[0.15em] text-[11px] shadow-2xl transition-all active:scale-95 flex gap-3 border-b-4 border-indigo-900"
                      >
                         PROCEED TO SCAN <ChevronRight className="w-4 h-4" />
                      </Button>
                   </Card>
                </div>
             </div>
          )}

          {currentStep === 2 && (
             <div className="max-w-2xl mx-auto">
                <Card className="border-none shadow-2xl rounded-[48px] bg-white overflow-hidden p-16 text-center space-y-12">
                   <div className="flex flex-col items-center">
                      <div className={`size-32 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl transition-all duration-700 ${screenSecurity.verified ? 'bg-emerald-50 text-emerald-600 scale-110' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
                         {screenSecurity.verified ? <MonitorCheck className="size-16" /> : <MonitorX className="size-16" />}
                      </div>
                      <Badge className={`font-black uppercase tracking-widest px-6 py-2 rounded-full border-none mb-4 ${screenSecurity.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                         Phase 02: Hardware Integrity
                      </Badge>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">
                         {screenSecurity.verified ? "HARDWARE VERIFIED" : "HARDWARE BREACH DETECTED"}
                      </h2>
                      <p className="text-sm font-bold text-slate-400 mt-4 max-w-sm mx-auto leading-relaxed uppercase tracking-tighter italic">
                         {screenSecurity.verified 
                           ? "System registry confirms a single-display environment. You are cleared for the secure environment engagement." 
                           : screenSecurity.error || "Please disconnect all secondary monitors and extended displays to proceed."}
                      </p>
                   </div>

                   <div className="grid gap-4">
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        disabled={!screenSecurity.verified}
                        className={`w-full h-20 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl flex gap-4 transition-all ${
                           screenSecurity.verified 
                           ? "bg-indigo-600 text-white hover:bg-indigo-700 border-b-8 border-indigo-900 active:translate-y-1" 
                           : "bg-slate-100 text-slate-300 cursor-not-allowed grayscale"
                        }`}
                      >
                         SECURE ENVIRONMENT ENGAGEMENT <Lock className="size-5" />
                      </Button>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60 italic pt-4">Polling Registry for hardware changes...</p>
                   </div>
                </Card>
             </div>
          )}

          {currentStep === 3 && (
             <div className="max-w-2xl mx-auto">
                <Card className="border-none shadow-2xl rounded-[48px] bg-indigo-900 overflow-hidden p-16 text-center space-y-12 text-white relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="size-64" />
                   </div>
                   <div className="flex flex-col items-center relative z-10">
                      <div className={`size-32 rounded-[40px] flex items-center justify-center mb-10 shadow-2xl transition-all duration-700 border-4 ${isFullscreen ? 'bg-white text-indigo-900 border-indigo-400 scale-110' : 'bg-indigo-800 text-indigo-400 border-indigo-700 animate-bounce'}`}>
                         <ShieldCheck className="size-16" />
                      </div>
                      <Badge className="bg-white/10 text-white font-black uppercase tracking-widest px-6 py-2 rounded-full border-none mb-4 italic">
                         Phase 03: Final Security Handshake
                      </Badge>
                      <h2 className="text-3xl font-black tracking-tight italic">
                         {isFullscreen ? "SECURITY PROTOCOL ACTIVE" : "LOCKDOWN REQUIRED"}
                      </h2>
                      <p className="text-sm font-bold opacity-60 mt-4 max-w-sm mx-auto leading-relaxed uppercase tracking-tighter italic">
                         {isFullscreen 
                           ? "Assessment engine is pressurized and ready for launch. Do not attempt to minimize or switch tabs once started." 
                           : "The global assessment cluster requires a locked browser context. Please engage FullScreen mode to manifest the launch gate."}
                      </p>
                   </div>

                   <div className="space-y-6 relative z-10">
                      {!isFullscreen ? (
                         <Button 
                           onClick={handleFullscreenRequest}
                           className="w-full h-20 rounded-3xl bg-white text-indigo-900 hover:bg-slate-50 font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl border-b-8 border-slate-300 active:translate-y-1 transition-all flex gap-4"
                         >
                            ENGAGE FULLSCREEN MODE <Maximize2 className="size-5" />
                         </Button>
                      ) : (
                         <Button 
                           onClick={handleLaunch}
                           disabled={starting}
                           className="w-full h-20 rounded-3xl bg-emerald-500 text-white hover:bg-emerald-600 font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl border-b-8 border-emerald-800 animate-in zoom-in active:translate-y-1 transition-all flex gap-4"
                         >
                            {starting ? "INITIALIZING PAYLOAD..." : "LAUNCH ASSESSMENT ENGINE"} <Play className="size-5 fill-white" />
                         </Button>
                      )}
                      
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">
                         Secure Handshake synchronized with Regional Cluster
                      </p>
                   </div>
                </Card>
             </div>
          )}
       </div>
    </div>
  );
}
