"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-testify-base flex items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
        
        {/* Logo mark */}
        <div className="flex justify-center gap-2 mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-testify-accent flex items-center justify-center text-white font-serif italic text-lg font-bold group-hover:bg-testify-accent2 transition-colors">
              T
            </div>
            <span className="font-serif text-2xl font-bold text-testify-text tracking-tight">Testify</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-testify-text mb-2 tracking-tight">
            Reset Password
          </h1>
          <p className="text-testify-muted text-sm px-4">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="bg-testify-surface border border-testify-border rounded-3xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-testify-text mb-2">Check your email</h2>
              <p className="text-testify-muted text-sm leading-relaxed">
                We've sent a magic link to <strong className="text-testify-text">{email}</strong>. 
                Please click the link in that email to reset your password.
              </p>
            </div>
            <Link 
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-testify-surface border border-testify-border px-6 text-sm font-semibold text-testify-text hover:bg-testify-surface-hover transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400 leading-snug">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-testify-muted2">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full h-12 bg-testify-surface border border-testify-border rounded-xl px-4 text-sm text-testify-text placeholder:text-testify-muted2 outline-none focus:border-testify-accent focus:ring-2 focus:ring-testify-accent/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 rounded-xl bg-testify-accent hover:bg-testify-accent2 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-testify-accent/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <Link href="/login" className="text-testify-muted hover:text-testify-text flex items-center justify-center gap-1.5 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
