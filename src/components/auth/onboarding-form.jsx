"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building2,
  UserCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { onboardCollegeClient } from "@/lib/api-client/onboarding.client";
import { useAuth } from "@/context/auth-context";

const STEPS = [
  { id: 1, label: "Institution", icon: Building2 },
  { id: 2, label: "Admin Details", icon: UserCircle },
  { id: 3, label: "Set password", icon: ShieldCheck },
];

const DESIGNATIONS = [
  "Principal",
  "Vice Principal",
  "Controller of Examinations",
  "Dean",
  "HOD / Department Head",
  "Exam Cell Officer",
  "IT Administrator",
  "Other",
];

export function OnboardingForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    collegeName: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminContact: "",
    adminDesignation: "",
    adminPassword: "",
    confirm: "",
  });

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function validateStep() {
    if (step === 1) {
      if (!form.collegeName.trim()) { setError("College / University name is required"); return false; }
    }
    if (step === 2) {
      if (!form.adminName.trim()) { setError("Your full name is required"); return false; }
      if (!form.adminEmail.trim() || !form.adminEmail.includes("@")) { setError("A valid email address is required"); return false; }
      if (!form.adminContact.trim()) { setError("Contact number is required"); return false; }
      if (!form.adminDesignation) { setError("Please select your designation"); return false; }
    }
    if (step === 3) {
      if (form.adminPassword.length < 8) { setError("Password must be at least 8 characters"); return false; }
      if (form.adminPassword !== form.confirm) { setError("Passwords do not match"); return false; }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setError("");
    setStep((s) => s + 1);
  }

  function back() {
    setError("");
    setStep((s) => s - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      const user = await onboardCollegeClient({
        collegeName: form.collegeName,
        address: form.address,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminContact: form.adminContact,
        adminDesignation: form.adminDesignation,
        adminPassword: form.adminPassword,
      });

      await login(user);
      setDone(true);

      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Success state ────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-testify-text mb-2">You're all set!</h2>
          <p className="text-testify-muted text-base">
            Your 3-day trial has started. Redirecting to your dashboard…
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-testify-accent animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-testify-accent flex items-center justify-center text-white font-serif italic text-lg font-bold group-hover:bg-testify-accent2 transition-colors">
            T
          </div>
          <span className="font-serif text-2xl font-bold text-testify-text tracking-tight">Testify</span>
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300
                    ${isDone ? "bg-testify-accent border-testify-accent" : isActive ? "bg-[rgba(79,110,247,0.12)] border-testify-accent" : "bg-testify-surface border-testify-border"}
                  `}
                >
                  {isDone
                    ? <CheckCircle2 size={16} className="text-white" />
                    : <Icon size={15} className={isActive ? "text-testify-accent" : "text-testify-muted2"} />
                  }
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${isActive ? "text-testify-accent" : isDone ? "text-testify-muted" : "text-testify-muted2"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 transition-colors duration-300 ${isDone ? "bg-testify-accent" : "bg-testify-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Heading */}
      <div className="mb-8">
        {step === 1 && <>
          <h1 className="font-serif text-4xl text-testify-text mb-2 tracking-tight">Register your institution</h1>
          <p className="text-testify-muted text-base">Tell us about your college or university.</p>
        </>}
        {step === 2 && <>
          <h1 className="font-serif text-4xl text-testify-text mb-2 tracking-tight">About you</h1>
          <p className="text-testify-muted text-base">You'll be the admin of your institution's workspace.</p>
        </>}
        {step === 3 && <>
          <h1 className="font-serif text-4xl text-testify-text mb-2 tracking-tight">Secure your account</h1>
          <p className="text-testify-muted text-base">Set a strong password to protect your admin account.</p>
        </>}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400 leading-snug">{error}</p>
        </div>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); next(); }} className="flex flex-col gap-5">

        {/* ── Step 1: Institution ──────────────────────────────── */}
        {step === 1 && (
          <>
            <Field label="College / University name *">
              <input
                id="college-name"
                type="text"
                placeholder="e.g. SRM Institute of Science & Technology"
                required
                value={form.collegeName}
                onChange={(e) => set("collegeName", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Address / City (optional)">
              <textarea
                id="college-address"
                placeholder="123 Main Street, Chennai, Tamil Nadu"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                rows={3}
                className={`${inputClass} h-auto resize-none py-3`}
              />
            </Field>

            {/* Trust note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-testify-surface border border-testify-border text-xs text-testify-muted leading-relaxed">
              <ShieldCheck size={14} className="text-testify-accent mt-0.5 shrink-0" />
              <p>Your data is encrypted and never shared. You get a <strong className="text-testify-text">3-day free trial</strong> — no credit card required.</p>
            </div>
          </>
        )}

        {/* ── Step 2: Admin Details ────────────────────────────── */}
        {step === 2 && (
          <>
            <Field label="Full name *">
              <input id="admin-name" type="text" placeholder="Dr. Rajan Mehta" required value={form.adminName}
                onChange={(e) => set("adminName", e.target.value)} className={inputClass} />
            </Field>

            <Field label="Official email address *">
              <input id="admin-email" type="email" autoComplete="email" placeholder="r.mehta@srmist.edu.in" required
                value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Contact number *">
                <input id="admin-contact" type="tel" placeholder="+91 98765 43210" required value={form.adminContact}
                  onChange={(e) => set("adminContact", e.target.value)} className={inputClass} />
              </Field>

              <Field label="Designation *">
                <select id="admin-designation" required value={form.adminDesignation}
                  onChange={(e) => set("adminDesignation", e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="" disabled>Select…</option>
                  {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          </>
        )}

        {/* ── Step 3: Password ─────────────────────────────────── */}
        {step === 3 && (
          <>
            <Field label="Create password *">
              <div className="relative">
                <input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Min. 8 characters" required value={form.adminPassword}
                  onChange={(e) => set("adminPassword", e.target.value)}
                  className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-testify-muted2 hover:text-testify-text transition-colors"
                  aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.adminPassword.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${form.adminPassword.length >= lvl * 2 ? form.adminPassword.length >= 10 ? "bg-emerald-500" : "bg-testify-accent" : "bg-testify-surface2"}`} />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Confirm password *">
              <input id="confirm-password" type="password" autoComplete="new-password" placeholder="Re-enter password"
                required value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className={inputClass} />
              {form.confirm && form.confirm !== form.adminPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>
              )}
            </Field>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-testify-surface border border-testify-border text-sm flex flex-col gap-2">
              <p className="text-xs uppercase font-bold tracking-wider text-testify-muted2 mb-1">Account summary</p>
              <Row label="Institution" value={form.collegeName} />
              <Row label="Admin" value={form.adminName} />
              <Row label="Email" value={form.adminEmail} />
              <Row label="Role" value={form.adminDesignation} />
              <div className="pt-2 mt-1 border-t border-testify-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-xs text-amber-400 font-medium">3-day free trial starts on submission</span>
              </div>
            </div>
          </>
        )}

        {/* ── Navigation Buttons ────────────────────────────────── */}
        <div className={`flex gap-3 mt-2 ${step > 1 ? "flex-row" : "flex-col"}`}>
          {step > 1 && (
            <button type="button" onClick={back}
              className="flex-1 h-12 rounded-xl border border-testify-border text-testify-text text-sm font-semibold flex items-center justify-center gap-2 hover:bg-testify-surface transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex-1 h-12 rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Registering…</>
            ) : step < 3 ? (
              <>Continue <ArrowRight size={16} /></>
            ) : (
              <>Start 3-day trial <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-testify-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-testify-accent hover:text-testify-accent2 font-semibold transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

/* ── Tiny helpers ─────────────────────────────────────────────────── */

const inputClass =
  "w-full h-12 bg-testify-surface border border-testify-border rounded-xl px-4 text-sm text-testify-text placeholder:text-testify-muted2 outline-none focus:border-testify-accent focus:ring-2 focus:ring-testify-accent/20 transition-all";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-testify-muted text-xs">{label}</span>
      <span className="text-testify-text text-xs font-medium truncate max-w-[60%] text-right">{value || "—"}</span>
    </div>
  );
}
