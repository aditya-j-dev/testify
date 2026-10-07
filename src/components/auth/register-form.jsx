"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, GraduationCap, BookOpen } from "lucide-react";

import { registerService } from "@/lib/api-client/auth.client";
import { useAuth } from "@/context/auth-context";

const ROLES = [
  {
    value: "STUDENT",
    label: "Student",
    icon: GraduationCap,
    desc: "Take exams & track results",
  },
  {
    value: "TEACHER",
    label: "Teacher / Faculty",
    icon: BookOpen,
    desc: "Create exams & manage students",
  },
];

export function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await registerService({ email, password, role });
      await login(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-testify-text mb-2 tracking-tight">
          Create your account
        </h1>
        <p className="text-testify-muted text-base">
          Join 200+ institutions on Testify
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400 leading-snug">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Role Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
            I am joining as
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`
                    relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all
                    ${active
                      ? "bg-[rgba(79,110,247,0.08)] border-testify-accent ring-1 ring-testify-accent/40"
                      : "bg-testify-surface border-testify-border hover:border-testify-border2 hover:bg-testify-surface2"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    className={active ? "text-testify-accent" : "text-testify-muted"}
                  />
                  <div>
                    <p className={`text-sm font-semibold leading-none mb-1 ${active ? "text-testify-accent" : "text-testify-text"}`}>
                      {r.label}
                    </p>
                    <p className="text-[11px] text-testify-muted leading-snug">{r.desc}</p>
                  </div>
                  {active && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-testify-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@college.edu"
            className="w-full h-12 bg-testify-surface border border-testify-border rounded-xl px-4 text-sm text-testify-text placeholder:text-testify-muted2 outline-none focus:border-testify-accent focus:ring-2 focus:ring-testify-accent/20 transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full h-12 bg-testify-surface border border-testify-border rounded-xl px-4 pr-12 text-sm text-testify-text placeholder:text-testify-muted2 outline-none focus:border-testify-accent focus:ring-2 focus:ring-testify-accent/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-testify-muted2 hover:text-testify-text transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password strength hint */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    password.length >= level * 2
                      ? password.length >= 10
                        ? "bg-emerald-500"
                        : "bg-testify-accent"
                      : "bg-testify-surface2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Terms note */}
        <p className="text-xs text-testify-muted2 leading-relaxed -mt-1">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-testify-muted hover:text-testify-text underline underline-offset-2 transition-colors">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-testify-muted hover:text-testify-text underline underline-offset-2 transition-colors">Privacy Policy</Link>.
        </p>

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
        </button>
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
