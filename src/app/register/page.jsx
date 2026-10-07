"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const stats = [
  { value: "200+", label: "Institutions" },
  { value: "2M+", label: "Exams taken" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up as a student or faculty in under a minute." },
  { num: "02", title: "Join your institution", desc: "Connect to your college's Testify workspace instantly." },
  { num: "03", title: "Start examining", desc: "Attempt or create your first exam right away." },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-testify-bg text-testify-text font-sans overflow-hidden">

      {/* ── Left Branding Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 bg-testify-bg2 border-r border-testify-border overflow-hidden">

        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--testify-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--testify-border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_30%,transparent_100%)] opacity-50 pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-testify-accent opacity-15 blur-[120px] rounded-full pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-10">
          <div className="w-8 h-8 rounded-lg bg-testify-accent flex items-center justify-center text-white font-serif italic text-lg font-bold group-hover:bg-testify-accent2 transition-colors">
            T
          </div>
          <span className="font-serif text-2xl font-bold text-testify-text tracking-tight">Testify</span>
        </Link>

        {/* Center copy */}
        <div className="relative z-10 flex flex-col gap-10 my-auto">
          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-testify-accent mb-4">Free to get started</p>
            <h2 className="font-serif text-5xl text-testify-text leading-tight tracking-tight mb-4">
              Your campus exams,<br /><em className="italic text-testify-accent">fully digital</em>
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b border-testify-border last:border-0">
                <span className="text-xs font-mono text-testify-muted2 mt-0.5 w-6 shrink-0">{s.num}</span>
                <div>
                  <p className="text-sm font-semibold text-testify-text mb-0.5">{s.title}</p>
                  <p className="text-xs text-testify-muted leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 bg-testify-surface border border-testify-border rounded-xl">
              <span className="font-serif text-3xl text-testify-accent mb-1">{s.value}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-testify-muted2">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen relative">

        {/* Theme toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-6 py-6 text-xs text-testify-muted2 border-t border-testify-border">
          <Link href="/privacy" className="hover:text-testify-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-testify-text transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-testify-text transition-colors">Support</Link>
        </div>
      </div>

    </div>
  );
}
