"use client";

import { useEffect, useRef, useState } from "react";

export function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = [
    { title: "Onboard your college", desc: "Import students and faculty via CSV or direct integration securely." },
    { title: "Create your exam", desc: "Build question papers with randomization rules and specific grading schemes." },
    { title: "Conduct & monitor live", desc: "Students take exams while AI flags any suspicious tab switches or device behavior." },
    { title: "Publish instant results", desc: "Auto-grade submissions and push results immediately to student dashboards." },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-testify-bg2 border-y border-testify-border relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* Left: Steps */}
        <div className="flex flex-col gap-8 pr-0 lg:pr-12">
          {steps.map((step, i) => (
            <div key={i} className="reveal [animation-delay:calc(var(--delay)*100ms)]" style={{ "--delay": i }}>
              <div className="flex gap-6 pb-8 border-b border-testify-border border-dashed">
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg font-bold text-testify-accent bg-[rgba(79,110,247,0.1)] border border-[rgba(79,110,247,0.2)]">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-testify-text mb-2">{step.title}</h3>
                  <p className="text-testify-muted text-sm">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Result Card Preview */}
        <div className="reveal relative w-full max-w-md mx-auto aspect-square flex items-center justify-center lg:ml-auto">
          {/* Decorative glows */}
          <div className="absolute inset-0 bg-testify-accent opacity-5 blur-[100px] rounded-full"></div>
          
          <div className="relative w-full bg-testify-surface border border-testify-border rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="font-serif text-xl tracking-tight text-testify-text">Exam Result</h4>
                <p className="text-xs text-testify-muted mt-1 font-mono">Data Structures 101</p>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#27c93f] bg-[#27c93f]/10 px-2 py-1 rounded border border-[#27c93f]/20">Published</span>
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center mb-8 relative">
              <svg width="120" height="120" viewBox="0 0 100 100" className="rotate-[-90deg]">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="var(--testify-bg3)" strokeWidth="8" />
                {/* Progress Ring */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="46" 
                  fill="transparent" 
                  stroke="var(--testify-accent)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="289"
                  strokeDashoffset={isVisible ? "63.5" : "289"}  // (1 - 78/100) * 289 = ~63.5
                  className="transition-[stroke-dashoffset] duration-[1.5s] ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-serif text-testify-text">78<span className="text-sm font-sans text-testify-muted">/100</span></span>
              </div>
              
              <div className="mt-4 text-xs font-mono text-testify-muted flex gap-2">
                 <span>Avg: 71.4</span> <span className="text-testify-border2">•</span> <span>Rank: 12<span className="opacity-50">/210</span></span>
              </div>
            </div>

            {/* Subject Progress Bars */}
            <div className="flex flex-col gap-4">
              {[
                { name: "Arrays & Trees", score: 90 },
                { name: "Graphs", score: 74 },
                { name: "Sorting", score: 65 },
                { name: "Dynamic Prog.", score: 80 },
              ].map((sub, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs text-testify-text mb-1.5">
                    <span>{sub.name}</span>
                    <span className="font-mono text-testify-muted">{sub.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-testify-bg border border-testify-border rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-testify-text transition-all duration-[1.5s] ease-out rounded-full"
                       style={{ width: isVisible ? `${sub.score}%` : '0%' }}
                     ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
