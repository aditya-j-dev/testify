"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, BarChart3, Settings } from "lucide-react";

export function Hero() {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((r) => observer.observe(r));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--testify-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--testify-border)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_110%)] opacity-40"></div>
      
      {/* Glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-testify-accent opacity-20 blur-[120px] rounded-full poiner-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center text-center">
        {/* Animated Badge */}
        <div className="reveal animate-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-testify-surface border border-testify-border mb-8">
          <div className="w-2 h-2 rounded-full bg-testify-accent animate-pulse-dot"></div>
          <span className="text-xs font-medium text-testify-text">Now available for Indian colleges</span>
        </div>

        {/* H1 */}
        <h1 className="reveal animate-fade-up [animation-delay:100ms] text-5xl sm:text-6xl md:text-7xl font-serif text-testify-text mb-6 tracking-tight max-w-4xl">
          Exams, <em className="italic text-testify-accent not-italic font-serif">redefined</em> for the digital campus
        </h1>

        {/* Subtitle */}
        <p className="reveal animate-fade-up [animation-delay:200ms] text-lg sm:text-xl text-testify-muted max-w-[540px] mb-10">
          The premium exam engine that handles everything from question banking to automated proctoring and unified academic records.
        </p>

        {/* CTAs */}
        <div className="reveal animate-fade-up [animation-delay:300ms] flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-testify-accent hover:bg-testify-accent2 text-white h-12 px-8 rounded-full text-base">
              Start for free →
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full text-base border-testify-border text-testify-text hover:bg-testify-surface hover:text-testify-text">
            ▶ Watch demo
          </Button>
        </div>

        {/* Browser Mockup */}
        <div className="reveal animate-fade-up [animation-delay:450ms] w-full max-w-5xl bg-testify-surface2 rounded-xl border border-testify-border2 shadow-2xl overflow-hidden backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Fake Browser Chrome */}
          <div className="h-12 border-b border-testify-border flex items-center px-4 gap-2 bg-testify-surface">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="ml-4 flex-1 max-w-sm mx-auto h-6 rounded-md bg-testify-bg3 border border-testify-border flex items-center justify-center text-[10px] text-testify-muted2 font-mono">
              app.testify.com/dashboard
            </div>
          </div>
          
          {/* Mockup Dashboard Content */}
          <div className="flex bg-testify-bg h-[400px] text-left">
            {/* Sidebar */}
            <div className="w-48 sm:w-[220px] border-r border-testify-border p-4 hidden md:flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[rgba(79,110,247,0.1)] text-testify-accent text-sm font-medium">
                <LayoutDashboard size={16} /> Dashboard
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-testify-muted hover:text-testify-text text-sm font-medium">
                <FileText size={16} /> Exams
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-testify-muted hover:text-testify-text text-sm font-medium">
                <Users size={16} /> Students
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-testify-muted hover:text-testify-text text-sm font-medium">
                <BarChart3 size={16} /> Results
              </div>
              <div className="mt-auto flex items-center gap-3 px-3 py-2 rounded-md text-testify-muted hover:text-testify-text text-sm font-medium">
                <Settings size={16} /> Settings
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-testify-text">Active Exams</h3>
                <span className="text-xs font-medium text-testify-muted bg-testify-surface px-2 py-1 rounded-md border border-testify-border">This Semester</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { name: "Advanced Algorithms", dept: "Computer Science", status: "Live", color: "#27c93f", progress: "85%", count: 142 },
                  { name: "Data Structures", dept: "Computer Science", status: "Live", color: "#27c93f", progress: "60%", count: 301 },
                  { name: "Machine Learning Concepts", dept: "AI & ML", status: "Soon", color: "#ffbd2e", progress: "0%", count: 0 }
                ].map((exam, i) => (
                  <div key={i} className="bg-testify-surface p-4 rounded-lg border border-testify-border flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-testify-text mb-0.5">{exam.name}</div>
                        <div className="text-xs text-testify-muted">{exam.dept}</div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-testify-bg border border-testify-border text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: exam.color }}></span>
                        <span className="text-testify-text">{exam.status}</span>
                      </div>
                    </div>
                    <div>
                      <div className="h-1 w-full bg-testify-bg3 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-testify-accent rounded-full" style={{ width: exam.progress }}></div>
                      </div>
                      <div className="text-xs text-testify-muted text-right">{exam.count} submitted</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-testify-surface border border-testify-border">
                  <div className="flex flex-col">
                    <span className="text-xl font-serif text-testify-text mb-1">1,248</span>
                    <span className="text-[10px] uppercase tracking-wider text-testify-muted2">Active Students</span>
                  </div>
                  <div className="flex flex-col border-l border-testify-border pl-4">
                    <span className="text-xl font-serif text-testify-text mb-1">94.2%</span>
                    <span className="text-[10px] uppercase tracking-wider text-testify-muted2">Completion</span>
                  </div>
                  <div className="flex flex-col border-l border-testify-border pl-4 hidden sm:flex">
                    <span className="text-xl font-serif text-testify-text mb-1">38</span>
                    <span className="text-[10px] uppercase tracking-wider text-testify-muted2">Exams this Sem</span>
                  </div>
                  <div className="flex flex-col border-l border-testify-border pl-4 hidden md:flex">
                    <span className="text-xl font-serif text-testify-accent mb-1">0</span>
                    <span className="text-[10px] uppercase tracking-wider text-testify-muted2">Integrity Alerts</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
