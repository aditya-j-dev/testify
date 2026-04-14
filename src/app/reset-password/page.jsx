"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token in URL parameters");
      return;
    }
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
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  // If token is missing, show a fatal error right away
  if (!token) {
    return (
      <div className="bg-testify-surface border border-testify-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-testify-text">Invalid Link</h2>
          <p className="text-testify-muted text-sm leading-relaxed">
            This password reset link is invalid or is missing its security token. Please request a new link.
          </p>
        </div>
        <Link href="/forgot-password" className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white font-semibold transition-colors mt-4">
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-testify-surface border border-testify-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-testify-text">Password Updated</h2>
          <p className="text-testify-muted text-sm leading-relaxed">
            Your password has been successfully reset. You can now use your new password to sign into your account.
          </p>
        </div>
        <Link href="/login" className="inline-flex w-full h-11 items-center justify-center rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white font-semibold transition-colors mt-4 shadow-lg shadow-testify-accent/20">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-testify-surface border border-testify-border rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="space-y-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-testify-accent/10 border border-testify-accent/20 flex items-center justify-center mx-auto transition-transform">
          <Lock className="w-7 h-7 text-testify-accent" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-testify-text">Create New Password</h1>
        <p className="text-testify-muted text-sm">
          Pick a strong password that you haven't used before to secure your account.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm leading-relaxed">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-testify-muted2 uppercase tracking-widest pl-1">
            New Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-testify-muted2 group-focus-within:text-testify-accent transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
              className="w-full h-12 pl-10 pr-12 rounded-xl border border-testify-border bg-testify-base text-sm text-testify-text placeholder:text-testify-muted2 focus:outline-none focus:ring-2 focus:ring-testify-accent/20 focus:border-testify-accent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-testify-muted2 hover:text-testify-text transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Strength Indicator */}
          <div className="flex gap-1.5 px-1 mt-3">
            {[1, 2, 3, 4].map((level) => (
              <div 
                key={level} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${password.length >= level * 2 ? (password.length > 10 ? 'bg-emerald-500' : 'bg-testify-accent') : 'bg-testify-border'}`} 
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-testify-muted2 uppercase tracking-widest pl-1">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-testify-muted2 group-focus-within:text-testify-accent transition-colors" />
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              required
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-testify-border bg-testify-base text-sm text-testify-text placeholder:text-testify-muted2 focus:outline-none focus:ring-2 focus:ring-testify-accent/20 focus:border-testify-accent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 8 || password !== confirm}
          className="w-full h-12 rounded-xl bg-testify-accent text-white font-bold text-sm hover:bg-testify-accent2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-testify-accent/20 mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-testify-base flex items-center justify-center p-6">
      {/* Suspense boundary is required by Next.js when using useSearchParams() */}
      <Suspense fallback={<div className="text-testify-muted text-sm"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-4" />Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
