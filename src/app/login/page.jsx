"use client";

import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const highlights = [
  { icon: "🛡️", label: "Bank-grade security & AI proctoring" },
  { icon: "⚡", label: "Results in under 4 seconds" },
  { icon: "🎓", label: "Trusted by 200+ institutions" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-testify-bg text-testify-text font-sans overflow-hidden">

      {/* ── Left Branding Panel (hidden on mobile) ──────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 bg-testify-bg2 border-r border-testify-border overflow-hidden">

        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--testify-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--testify-border)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_30%,transparent_100%)] opacity-50 pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[500px] h-[400px] bg-testify-accent opacity-15 blur-[120px] rounded-full pointer-events-none" />

        {/* Top: Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-10">
          <div className="w-8 h-8 rounded-lg bg-testify-accent flex items-center justify-center text-white font-serif italic text-lg font-bold group-hover:bg-testify-accent2 transition-colors">
            T
          </div>
          <span className="font-serif text-2xl font-bold text-testify-text tracking-tight">Testify</span>
        </Link>

        {/* Middle: Hero copy */}
        <div className="relative z-10 flex flex-col gap-8 my-auto">
          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-testify-accent mb-4">For institutions</p>
            <h2 className="font-serif text-5xl text-testify-text leading-tight tracking-tight mb-4">
              The smarter way to<br /><em className="italic text-testify-accent">run examinations</em>
            </h2>
            {/* <p className="text-testify-muted text-lg max-w-sm leading-relaxed">
              Conduct secure, proctored exams at scale — and publish results the moment the last student submits.
            </p> */}
          </div>

          {/* Feature highlights */}
          {/* <div className="flex flex-col gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-testify-surface border border-testify-border">
                <span className="text-lg">{h.icon}</span>
                <span className="text-sm text-testify-text font-medium">{h.label}</span>
              </div>
            ))}
          </div> */}
        </div>

        {/* Bottom: Testimonial */}
        {/* <div className="relative z-10 p-6 rounded-xl bg-testify-surface border border-testify-border">
          <p className="text-testify-muted text-sm leading-relaxed italic mb-4">
            &ldquo;Testify cut our exam operations workload by 70%. Results that used to take three days now publish instantly.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-testify-accent/20 flex items-center justify-center text-testify-accent font-bold text-xs border border-testify-border2">
              R
            </div>
            <div>
              <p className="text-xs font-semibold text-testify-text">Dr. Rajan Mehta</p>
              <p className="text-[10px] text-testify-muted2">Controller of Examinations, SRM Institute</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* ── Right Form Panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen relative">

        {/* Theme Toggle top-right */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Bottom legal links */}
        <div className="flex justify-center gap-6 py-6 text-xs text-testify-muted2 border-t border-testify-border">
          <Link href="/privacy" className="hover:text-testify-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-testify-text transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-testify-text transition-colors">Support</Link>
        </div>
      </div>
    </div>
  );
}
