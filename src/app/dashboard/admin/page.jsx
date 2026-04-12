"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  GitBranch, Users, GraduationCap, BookOpen, ClipboardList,
  AlertTriangle, CheckCircle2, Clock, CreditCard, ArrowRight,
  Zap, Loader2, Building2,
} from "lucide-react";

const STATUS_CONFIG = {
  TRIAL: {
    label: "Free Trial",
    desc: (d) => `${d} days remaining`,
    icon: Clock,
    banner: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    ring: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  TRIAL_EXPIRED: {
    label: "Trial Expired",
    desc: () => "Upgrade to restore access",
    icon: AlertTriangle,
    banner: "bg-red-500/10 border-red-500/20 text-red-300",
    ring: "border-red-500/30",
    dot: "bg-red-400",
  },
  ACTIVE: {
    label: "Active",
    desc: (d) => `Renews in ${d} days`,
    icon: CheckCircle2,
    banner: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    ring: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  SUSPENDED: {
    label: "Suspended",
    desc: () => "Renew to restore access",
    icon: AlertTriangle,
    banner: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    ring: "border-orange-500/30",
    dot: "bg-orange-400",
  },
};

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const inner = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color || "bg-indigo-500/10"}`}>
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <div className="flex items-center gap-1 text-indigo-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
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
  const StatusIcon = conf.icon;
  const expiryDays =
    status === "TRIAL"
      ? daysUntil(billing?.trialEndsAt)
      : status === "ACTIVE"
      ? daysUntil(billing?.currentPeriodEnd)
      : null;

  const isLocked = status === "TRIAL_EXPIRED" || status === "SUSPENDED";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here's an overview of your institution.</p>
      </div>

      {/* Subscription banner */}
      {billing && (
        <div className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${conf.banner}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${conf.dot} animate-pulse`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">{conf.label}</span>
                <span className="text-xs opacity-70">— {billing.plan}</span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">{conf.desc(expiryDays)}</p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="shrink-0 text-xs font-semibold flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {isLocked ? "Upgrade Now" : "Manage Billing"}
          </Link>
        </div>
      )}

      {/* Access locked */}
      {isLocked && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <div>
            <h3 className="text-red-300 font-semibold">Platform access restricted</h3>
            <p className="text-red-400/70 text-sm mt-1">
              {status === "TRIAL_EXPIRED"
                ? "Your free trial has ended. Upgrade to add data and take exams."
                : "Your subscription has lapsed. Renew to restore full access."}
            </p>
          </div>
          <Link
            href="/dashboard/admin/billing"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Zap className="w-4 h-4" /> Choose a Plan
          </Link>
        </div>
      )}

      {/* Resource usage */}
      {billing?.usage && (
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4">Resource Usage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Branches", icon: GitBranch, key: "branches", href: "/dashboard/admin/branches" },
              { label: "Batches", icon: GraduationCap, key: "batches", href: "/dashboard/admin/batches" },
              { label: "Teachers", icon: Users, key: "teachers", href: "/dashboard/admin/teachers" },
              { label: "Students", icon: BookOpen, key: "students", href: "/dashboard/admin/students" },
              { label: "Exams", icon: ClipboardList, key: "exams", href: "/dashboard/exams" },
            ].map(({ label, icon: Icon, key, href }) => {
              const u = billing.usage[key];
              const isUnlimited = u?.max === null;
              const pct = isUnlimited ? 0 : u?.max ? Math.min((u.current / u.max) * 100, 100) : 0;
              const isAtLimit = !isUnlimited && pct >= 100;
              const isNear = !isUnlimited && pct >= 80;

              return (
                <Link key={key} href={href}>
                  <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-2 transition-all">
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className={`text-xs font-medium ${isAtLimit ? "text-red-400" : isNear ? "text-amber-400" : "text-slate-500"}`}>
                        {isUnlimited ? `${u?.current} / ∞` : `${u?.current ?? 0} / ${u?.max ?? "?"}`}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs font-medium">{label}</p>
                    {!isUnlimited && u?.max && (
                      <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : isNear ? "bg-amber-500" : "bg-indigo-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div>
          <h2 className="text-base font-semibold text-slate-300 mb-4">Activity Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={ClipboardList}
              label="Total Exams"
              value={stats?.college?.examTotal ?? 0}
              href="/dashboard/exams"
            />
            <StatCard
              icon={Building2}
              label="Branches"
              value={stats?.college?.branchCount ?? 0}
              href="/dashboard/admin/branches"
            />
            <StatCard
              icon={Users}
              label="Teachers"
              value={stats?.college?.teacherCount ?? 0}
              href="/dashboard/admin/teachers"
            />
            <StatCard
              icon={BookOpen}
              label="Students"
              value={stats?.college?.studentCount ?? 0}
              href="/dashboard/admin/students"
            />
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-slate-300 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Manage Branches", desc: "Add or view departments", icon: GitBranch, href: "/dashboard/admin/branches" },
            { label: "Manage Batches", desc: "Organize student groups", icon: GraduationCap, href: "/dashboard/admin/batches" },
            { label: "Add Teachers", desc: "Invite faculty members", icon: Users, href: "/dashboard/admin/teachers" },
            { label: "Add Students", desc: "Enroll new students", icon: BookOpen, href: "/dashboard/admin/students" },
            { label: "View Exams", desc: "See all college exams", icon: ClipboardList, href: "/dashboard/exams" },
            { label: "Billing & Plans", desc: "Manage your subscription", icon: CreditCard, href: "/dashboard/admin/billing" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl p-4 flex items-center gap-3 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs truncate">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 ml-auto shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
