"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  CreditCard,
  Users,
  Calendar,
  ShieldAlert,
} from "lucide-react";

const STATUS_CONFIG = {
  TRIAL: { label: "Free Trial", icon: Clock, badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  TRIAL_EXPIRED: { label: "Trial Expired", icon: AlertTriangle, badge: "bg-red-500/15 text-red-400 border border-red-500/30" },
  ACTIVE: { label: "Active", icon: CheckCircle2, badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  SUSPENDED: { label: "Suspended", icon: AlertTriangle, badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30" },
  CANCELLED: { label: "Cancelled", icon: XCircle, badge: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

export default function CollegeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [college, setCollege] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (id) loadCollegeData();
  }, [id]);

  async function loadCollegeData() {
    setLoading(true);
    setError(null);
    try {
      const [collegeRes, paymentsRes] = await Promise.all([
        fetch(`/api/org/college/${id}`).then((r) => r.json()),
        fetch(`/api/payments/history?collegeId=${id}`).then((r) => r.json()),
      ]);
      if (collegeRes.success) setCollege(collegeRes.college);
      else throw new Error(collegeRes.message);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
    } catch (err) {
      setError(err.message || "Failed to load college data");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/account/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSuccessMsg("College restored successfully. Status set to TRIAL_EXPIRED — admin must re-subscribe.");
      await loadCollegeData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading college details…</p>
        </div>
      </div>
    );
  }

  if (error && !college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-red-300">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[college?.subscriptionStatus] || STATUS_CONFIG.TRIAL;
  const StatusIcon = statusConf.icon;
  const isCancelledOrDeleted = college?.subscriptionStatus === "CANCELLED" || college?.deletedAt;
  const canRestore = isCancelledOrDeleted || college?.subscriptionStatus === "TRIAL_EXPIRED";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="space-y-4">
        <Link href="/dashboard/super-admin/colleges">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Colleges
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <School className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100">{college?.name}</h1>
            </div>
            {college?.address && <p className="text-slate-400 text-sm pl-14">{college.address}</p>}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${statusConf.badge}`}>
            <StatusIcon className="w-3 h-3" />
            {statusConf.label}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Soft-delete warning */}
      {college?.deletedAt && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-red-300 font-semibold">College is soft-deleted</h3>
              <p className="text-red-400/70 text-sm mt-1">
                Deleted on{" "}
                {new Date(college.deletedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}.
                {college.deletionReason && ` Reason: ${college.deletionReason}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Plan",
            value: college?.planType || "—",
            icon: CreditCard,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Admins",
            value: college?.users?.length || 0,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Trial Ends",
            value: college?.trialEndsAt
              ? new Date(college.trialEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              : "—",
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Period End",
            value: college?.currentPeriodEnd
              ? new Date(college.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              : "—",
            icon: Calendar,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">{stat.label}</p>
              <p className="text-slate-200 font-semibold text-sm">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Admin users */}
      {college?.users?.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {college.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-slate-300 font-medium text-sm">{u.name}</p>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 text-slate-300 font-medium">{p.planType}</td>
                    <td className="py-3 text-slate-300">₹{(p.amountInPaise / 100).toFixed(0)}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "SUCCESS" ? "bg-emerald-500/15 text-emerald-400" :
                        p.status === "FAILED" ? "bg-red-500/15 text-red-400" :
                        "bg-slate-700 text-slate-400"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Restore action */}
      {canRestore && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-slate-200 font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Restore Account
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Clears the cancellation request and restores the college to TRIAL_EXPIRED status.
              The admin will need to subscribe to a paid plan to regain full access.
            </p>
          </div>
          <Button
            onClick={handleRestore}
            disabled={restoring}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
          >
            {restoring ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Restoring…</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Restore College</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
