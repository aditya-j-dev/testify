"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  GitBranch, Users, GraduationCap, BookOpen, CreditCard,
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Zap, Loader2, LayoutDashboard, TrendingUp,
} from "lucide-react";

const STATUS_CONFIG = {
  TRIAL:        { label: "Free Trial",    dot: "bg-amber-400",   banner: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300" },
  TRIAL_EXPIRED:{ label: "Trial Expired", dot: "bg-red-400",     banner: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300" },
  ACTIVE:       { label: "Active",        dot: "bg-emerald-400", banner: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300" },
  SUSPENDED:    { label: "Suspended",     dot: "bg-orange-400",  banner: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-300" },
  CANCELLED:    { label: "Cancelled",     dot: "bg-red-400",     banner: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300" },
};

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function StatCard({ icon: Icon, label, value, sub, href, accent }) {
  const inner = (
    <div className={`bg-card border rounded-2xl p-5 space-y-3 transition-all group ${href ? "hover:border-primary/30 cursor-pointer" : ""}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || "bg-primary/10"}`}>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {href && (
        <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/account/billing").then((r) => r.json()),
    ]).then(([statsRes, billingRes]) => {
      if (statsRes.success) setStats(statsRes.stats);
      if (billingRes.success) setBilling(billingRes.billing);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const status = billing?.subscriptionStatus || "TRIAL";
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.TRIAL;
  const expiryDays = status === "TRIAL" ? daysUntil(billing?.trialEndsAt)
    : status === "ACTIVE" ? daysUntil(billing?.currentPeriodEnd) : null;
  const isLocked = status === "TRIAL_EXPIRED" || status === "SUSPENDED" || status === "CANCELLED";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's an overview of your institution.</p>
      </div>

      {/* Subscription banner */}
      {billing && (
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${conf.banner}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${conf.dot} animate-pulse shrink-0`} />
            <div>
              <p className="font-semibold text-sm">
                {conf.label} — {billing.plan}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {status === "TRIAL" && expiryDays !== null ? `${expiryDays} day${expiryDays !== 1 ? "s" : ""} remaining` :
                 status === "ACTIVE" && expiryDays !== null ? `Renews in ${expiryDays} day${expiryDays !== 1 ? "s" : ""}` :
                 "Upgrade to restore access"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="shrink-0 text-xs font-semibold flex items-center gap-1.5 bg-foreground/10 hover:bg-foreground/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {isLocked ? "Upgrade Now" : "Manage Billing"}
          </Link>
        </div>
      )}

      {/* Access locked */}
      {isLocked && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 text-center space-y-3">
          <AlertTriangle className="w-7 h-7 text-destructive mx-auto" />
          <div>
            <h3 className="text-destructive font-semibold">Platform access restricted</h3>
            <p className="text-destructive/70 text-sm mt-1">
              {status === "TRIAL_EXPIRED" ? "Your free trial has ended. Upgrade to add data and take exams."
               : status === "SUSPENDED" ? "Your account has been suspended by the platform admin."
               : "Your account is cancelled. Contact support to restore."}
            </p>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Zap className="w-4 h-4" /> Choose a Plan
          </Link>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={GitBranch} label="Branches" value={stats?.college?.branchCount ?? 0}
            sub="Academic departments" href="/dashboard/admin/branches" />
          <StatCard icon={Users} label="Teachers" value={stats?.college?.teacherCount ?? 0}
            sub="Faculty members" href="/dashboard/admin/teachers" />
          <StatCard icon={BookOpen} label="Students" value={stats?.college?.studentCount ?? 0}
            sub="Enrolled students" href="/dashboard/admin/students" />
          <StatCard icon={CreditCard} label="Plan" value={billing?.plan || "Trial"}
            sub={conf.label} href="/dashboard/admin/billing" />
        </div>
      )}

      {/* Resource usage bars */}
      {billing?.usage && !isLocked && (
        <div className="bg-card border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" /> Resource Usage
          </h2>
          <div className="space-y-3">
            {[
              { label: "Teachers", ...billing.usage.teachers },
              { label: "Students", ...billing.usage.students },
              { label: "Exams",    ...billing.usage.exams },
            ].map(({ label, current, max }) => {
              const isUnlimited = max === null;
              const pct = isUnlimited ? 0 : max > 0 ? Math.min((current / max) * 100, 100) : 0;
              const isNear = !isUnlimited && pct >= 80;
              const isAt   = !isUnlimited && pct >= 100;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`text-xs font-medium ${isAt ? "text-destructive" : isNear ? "text-amber-500" : "text-muted-foreground"}`}>
                      {isUnlimited ? `${current} / ∞` : `${current} / ${max}`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isAt ? "bg-destructive" : isNear ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: isUnlimited ? "100%" : `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Manage Branches",  desc: "Add or rename departments",      icon: GitBranch,    href: "/dashboard/admin/branches" },
            { label: "Manage Batches",   desc: "Organize student groups",        icon: GraduationCap,href: "/dashboard/admin/batches" },
            { label: "Add Teachers",     desc: "Invite faculty members",         icon: Users,        href: "/dashboard/admin/teachers" },
            { label: "Add Students",     desc: "Enroll new students",            icon: BookOpen,     href: "/dashboard/admin/students" },
            { label: "Manage Subjects",  desc: "Define curriculum disciplines",  icon: LayoutDashboard, href: "/dashboard/admin/subjects" },
            { label: "Billing & Plans",  desc: "Upgrade or cancel subscription", icon: CreditCard,   href: "/dashboard/admin/billing" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-card border hover:border-primary/30 hover:bg-primary/5 rounded-xl p-4 flex items-center gap-3 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-xs truncate">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary ml-auto shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
