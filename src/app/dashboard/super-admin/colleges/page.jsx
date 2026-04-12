"use client";

import { useEffect, useState, useMemo } from "react";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  School, Plus, MapPin, CheckCircle2, AlertTriangle, XCircle, Clock, Filter,
} from "lucide-react";
import Link from "next/link";

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  TRIAL: { label: "Trial", icon: Clock, className: "bg-amber-500/15 text-amber-400" },
  TRIAL_EXPIRED: { label: "Expired", icon: AlertTriangle, className: "bg-red-500/15 text-red-400" },
  ACTIVE: { label: "Active", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-400" },
  SUSPENDED: { label: "Suspended", icon: AlertTriangle, className: "bg-orange-500/15 text-orange-400" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-red-500/15 text-red-400" },
};

function StatusBadge({ status }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.TRIAL;
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${conf.className}`}>
      <Icon className="w-3 h-3" />
      {conf.label}
    </span>
  );
}

const FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "TRIAL", label: "Trial" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL_EXPIRED", label: "Expired" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadColleges();
  }, []);

  async function loadColleges() {
    const data = await orgClient.colleges.list();
    if (data.success) setColleges(data.colleges);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name) return;
    setCreating(true);
    const data = await orgClient.colleges.create(formData);
    if (data.success) {
      setFormData({ name: "", address: "" });
      loadColleges();
    }
    setCreating(false);
  }

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.subscriptionStatus === statusFilter;
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [colleges, statusFilter, search]);

  // Count by status for filter badges
  const counts = useMemo(() => {
    return colleges.reduce((acc, c) => {
      acc[c.subscriptionStatus] = (acc[c.subscriptionStatus] || 0) + 1;
      return acc;
    }, {});
  }, [colleges]);

  return (
    <div className="space-y-6 container mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">College Management</h1>
          <p className="text-slate-400 mt-1 text-sm">Register and manage institutions on the Testify platform.</p>
        </div>
        <div className="bg-indigo-500/10 p-3 rounded-full">
          <School className="w-8 h-8 text-indigo-400" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Register form */}
        <Card className="md:col-span-1 h-fit bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Register New College</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">College Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Stanford University"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-300">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="e.g. California, USA"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={creating}>
                {creating ? "Registering…" : <><Plus className="w-4 h-4 mr-2" /> Register College</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Colleges list */}
        <Card className="md:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="space-y-3">
              <CardTitle className="text-lg text-slate-200">Institutions ({colleges.length})</CardTitle>
              {/* Search */}
              <Input
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 text-sm"
              />
              {/* Status filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                      statusFilter === opt.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {opt.label}
                    {opt.value !== "ALL" && counts[opt.value] ? (
                      <span className="ml-1 opacity-70">({counts[opt.value]})</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-500">College Name</TableHead>
                  <TableHead className="text-slate-500">Location</TableHead>
                  <TableHead className="text-slate-500">Status</TableHead>
                  <TableHead className="text-slate-500 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading…</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                      {statusFilter !== "ALL" ? `No colleges with status "${statusFilter}".` : "No colleges registered yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((college) => (
                    <TableRow key={college.id} className={`border-slate-800 group ${college.deletedAt ? "opacity-50" : ""}`}>
                      <TableCell className="font-semibold text-slate-200">
                        {college.name}
                        {college.deletedAt && (
                          <span className="ml-2 text-xs text-red-400">(deleted)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-slate-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {college.address || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={college.subscriptionStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/super-admin/colleges/${college.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-indigo-500/10 hover:text-indigo-300 border-slate-700 text-slate-400"
                          >
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
