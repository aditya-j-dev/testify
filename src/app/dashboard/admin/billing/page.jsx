"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  TRIAL: { label: "Free Trial", icon: Clock, className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  TRIAL_EXPIRED: { label: "Trial Expired", icon: AlertTriangle, className: "bg-red-500/15 text-red-400 border border-red-500/30" },
  ACTIVE: { label: "Active", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  SUSPENDED: { label: "Suspended", icon: AlertTriangle, className: "bg-orange-500/15 text-orange-400 border border-orange-500/30" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

const PLAN_COLORS = {
  TRIAL: "from-slate-600 to-slate-700",
  STARTER: "from-blue-600 to-indigo-700",
  PROFESSIONAL: "from-violet-600 to-purple-700",
  ENTERPRISE: "from-amber-600 to-orange-700",
};

const PLANS = [
  {
    type: "STARTER",
    name: "Starter",
    price: "₹999",
    period: "/month",
    features: ["5 Branches", "10 Batches", "10 Teachers", "200 Students", "50 Exams", "Analytics & Bulk Import"],
  },
  {
    type: "PROFESSIONAL",
    name: "Professional",
    price: "₹2,999",
    period: "/month",
    features: ["Unlimited Branches", "Unlimited Batches", "Unlimited Teachers", "Unlimited Students", "Unlimited Exams", "Proctoring + Analytics"],
    recommended: true,
  },
  {
    type: "ENTERPRISE",
    name: "Enterprise",
    price: "₹9,999",
    period: "/month",
    features: ["Everything in Professional", "API Access", "Priority Support", "Custom Integrations", "SLA Guarantee"],
  },
];

// ── Resource Usage Bar ────────────────────────────────────────────────────────
function UsageBar({ label, current, max, icon: Icon }) {
  const percent = max === null ? 0 : Math.min((current / max) * 100, 100);
  const isUnlimited = max === null;
  const isNearLimit = !isUnlimited && percent >= 80;
  const isAtLimit = !isUnlimited && percent >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <span className={`text-xs font-medium ${isAtLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-slate-400"}`}>
          {isUnlimited ? `${current} / ∞` : `${current} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-indigo-500"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-full rounded-full bg-emerald-500/30" />
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null); // planType being upgraded to
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  async function loadBillingData() {
    setLoading(true);
    setError(null);
    try {
      const [billingRes, paymentsRes] = await Promise.all([
        fetch("/api/account/billing").then((r) => r.json()),
        fetch("/api/payments/history").then((r) => r.json()),
      ]);
      if (billingRes.success) setBilling(billingRes.billing);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
    } catch (err) {
      setError("Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(planType) {
    setUpgrading(planType);
    setError(null);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, gateway: "razorpay" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Launch Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.gatewayOrderId,
        name: "Testify Exam Platform",
        description: `${planType} Plan Subscription`,
        handler: async function (response) {
          // Submit payment verification to our backend
          const verifyRes = await fetch("/api/payments/webhook/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await loadBillingData();
          }
        },
        theme: { color: "#4f6ef7" },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback: load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      setError(err.message || "Payment initiation failed.");
    } finally {
      setUpgrading(null);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch("/api/account/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setShowCancelModal(false);
      await loadBillingData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading billing information…</p>
        </div>
      </div>
    );
  }

  const status = billing?.subscriptionStatus || "TRIAL";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.TRIAL;
  const StatusIcon = statusConfig.icon;
  const usage = billing?.usage;
  const isLocked = status === "TRIAL_EXPIRED" || status === "SUSPENDED" || status === "CANCELLED";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Billing & Subscription</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your plan, payments, and account lifecycle.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Access locked banner */}
      {isLocked && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-amber-300 font-semibold">Platform access restricted</h3>
              <p className="text-amber-400/70 text-sm mt-1">
                {status === "TRIAL_EXPIRED"
                  ? "Your free trial has ended. Choose a plan below to restore access."
                  : status === "SUSPENDED"
                  ? "Your subscription has lapsed. Renew to restore full access."
                  : "Your account has been cancelled. Contact support to restore."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className={`rounded-2xl bg-gradient-to-br ${PLAN_COLORS[billing?.planType || "TRIAL"]} p-0.5`}>
        <div className="rounded-[14px] bg-slate-900 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Current Plan</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-100">
                {billing?.plan || "Trial"}
              </h2>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </div>
            </div>
            <div className="text-right">
              {status === "TRIAL" && billing?.trialEndsAt && (
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs">Trial ends</p>
                  <p className="text-slate-200 font-semibold">
                    {new Date(billing.trialEndsAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              )}
              {status === "ACTIVE" && billing?.currentPeriodEnd && (
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs">Next renewal</p>
                  <p className="text-slate-200 font-semibold">
                    {new Date(billing.currentPeriodEnd).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource usage */}
      {usage && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-200 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-400" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            <UsageBar label="Branches" current={usage.branches.current} max={usage.branches.max} icon={Building2} />
            <UsageBar label="Batches" current={usage.batches.current} max={usage.batches.max} icon={GraduationCap} />
            <UsageBar label="Teachers" current={usage.teachers.current} max={usage.teachers.max} icon={Users} />
            <UsageBar label="Students" current={usage.students.current} max={usage.students.max} icon={BookOpen} />
            <UsageBar label="Exams" current={usage.exams.current} max={usage.exams.max} icon={ClipboardList} />
          </CardContent>
        </Card>
      )}

      {/* Plan upgrade cards */}
      {status !== "CANCELLED" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">
            {status === "ACTIVE" ? "Change Plan" : "Choose a Plan"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.type}
                className={`relative rounded-2xl border p-5 space-y-4 transition-all ${
                  plan.recommended
                    ? "border-indigo-500/50 bg-indigo-500/5"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-600 text-white">
                    Recommended
                  </span>
                )}
                <div>
                  <h3 className="text-slate-200 font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-slate-100">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.type)}
                  disabled={!!upgrading || billing?.planType === plan.type}
                  className={`w-full ${plan.recommended ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
                >
                  {upgrading === plan.type ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                  ) : billing?.planType === plan.type ? (
                    "Current Plan"
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" /> Upgrade</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Payment History
          </h2>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
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
                    <tr key={p.id} className="group">
                      <td className="py-3 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 text-slate-300 font-medium">{p.planType}</td>
                      <td className="py-3 text-slate-300">₹{(p.amountInPaise / 100).toFixed(0)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "SUCCESS" ? "bg-emerald-500/15 text-emerald-400" :
                          p.status === "FAILED" ? "bg-red-500/15 text-red-400" :
                          p.status === "REFUNDED" ? "bg-blue-500/15 text-blue-400" :
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
        </section>
      )}

      {/* Danger zone */}
      {status !== "CANCELLED" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-slate-200 font-medium">Cancel Account</h3>
              <p className="text-slate-400 text-sm mt-1">
                Your data will be retained for a grace period before permanent deletion.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 shrink-0"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Account
            </Button>
          </div>
        </section>
      )}

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/15">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-slate-100 font-bold text-lg">Confirm Cancellation</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Are you sure you want to cancel your account? You'll have a 7-day grace period to change your mind.
              After that, <strong className="text-slate-300">all data will be permanently deleted</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-medium">Reason (optional)</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a reason…</option>
                <option value="TOO_EXPENSIVE">Too expensive</option>
                <option value="NOT_USING">Not using it enough</option>
                <option value="SWITCHING">Switching to another platform</option>
                <option value="MISSING_FEATURES">Missing features I need</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Account
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling…</> : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
