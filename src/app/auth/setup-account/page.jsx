"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { setToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

// ── Shared style constant ─────────────────────────────────────────────────
const inputClass =
  "w-full h-12 bg-testify-surface border border-testify-border rounded-xl px-4 text-sm text-testify-text placeholder:text-testify-muted2 outline-none focus:border-testify-accent focus:ring-2 focus:ring-testify-accent/20 transition-all";

// ── Inner component that uses useSearchParams ─────────────────────────────

function SetupAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Resend flow
  const [expired, setExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  // If no token in URL, show informative message
  useEffect(() => {
    if (!token) setError("No setup token found. Check your email or request a new link.");
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await apiRequest("/auth/setup-account", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setToken(res.token);
      await login(res.user);
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      if (err.message === "Setup link has expired. Please request a new one.") {
        setExpired(true);
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setResending(true);
    setError("");

    try {
      await apiRequest("/auth/resend-setup", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setResendDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  // ── Done state ────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-testify-text mb-2">You're all set!</h2>
          <p className="text-testify-muted text-base">
            Your account is ready. Redirecting to your dashboard…
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

  // ── Resend done state ─────────────────────────────────────────────────

  if (resendDone) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8">
        <div className="w-16 h-16 rounded-full bg-testify-accent/10 border border-testify-accent/30 flex items-center justify-center">
          <Mail size={32} className="text-testify-accent" />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-testify-text mb-2">Check your inbox</h2>
          <p className="text-testify-muted text-base">
            A new setup link has been sent to <strong className="text-testify-text">{email}</strong>.
            It expires in 24 hours.
          </p>
        </div>
        <Link href="/login" className="text-sm text-testify-accent hover:text-testify-accent2 transition-colors">
          Back to login →
        </Link>
      </div>
    );
  }

  // ── Expired token state ───────────────────────────────────────────────

  if (expired) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertCircle size={28} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-testify-text mb-1">Setup link expired</h2>
            <p className="text-testify-muted text-sm">
              Your setup link is more than 24 hours old. Enter your email to receive a new one.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400 leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleResend} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
              Your registered email
            </label>
            <input
              id="resend-email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            disabled={resending}
            className="h-12 rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {resending ? (
              <><Loader2 size={16} className="animate-spin" /> Sending…</>
            ) : (
              <>Send new link <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    );
  }

  // ── Main set-password form ────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-testify-accent flex items-center justify-center text-white font-serif italic text-lg font-bold group-hover:bg-testify-accent2 transition-colors">
            T
          </div>
          <span className="font-serif text-2xl font-bold text-testify-text tracking-tight">Testify</span>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-testify-accent/10 border border-testify-accent/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-testify-accent" />
          </div>
          <h1 className="font-serif text-3xl text-testify-text tracking-tight">Set your password</h1>
        </div>
        <p className="text-testify-muted text-sm">
          Create a strong password to secure your admin account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400 leading-snug">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className={`${inputClass} pr-12`}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-testify-muted2 hover:text-testify-text transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    password.length >= lvl * 2
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

        {/* Confirm */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            className={inputClass}
            autoComplete="new-password"
            required
          />
          {confirm && confirm !== password && (
            <p className="text-xs text-red-400 mt-0.5">Passwords don't match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="h-12 rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Setting up account…</>
          ) : (
            <>Activate my account <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-testify-muted">
        Already have access?{" "}
        <Link href="/login" className="text-testify-accent hover:text-testify-accent2 font-semibold transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

// ── Page wrapper with Suspense (required for useSearchParams in Next.js) ──

export default function SetupAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-testify-bg px-6 py-16">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-testify-accent" />
            </div>
          }
        >
          <SetupAccountForm />
        </Suspense>
      </div>
    </div>
  );
}
