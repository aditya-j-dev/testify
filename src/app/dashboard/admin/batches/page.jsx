"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Plus, ArrowLeft, Calendar, Layers } from "lucide-react";

function BatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const branchId = searchParams.get("branchId");

  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", graduationYear: new Date().getFullYear() + 4 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.collegeId) {
      loadBranches();
    }
  }, [user]);

  useEffect(() => {
    if (branchId) {
      loadBatches();
    } else {
      setBatches([]);
      setLoading(false);
    }
  }, [branchId]);

  async function loadBranches() {
    const data = await orgClient.branches.list(user.collegeId);
    if (data.success) setBranches(data.branches);
  }

  async function loadBatches() {
    setLoading(true);
    const data = await orgClient.batches.list(branchId);
    if (data.success) setBatches(data.batches);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !branchId) return;
    setCreating(true);
    const data = await orgClient.batches.create({ ...formData, branchId });
    if (data.success) {
      setFormData({ name: "", graduationYear: new Date().getFullYear() + 4 });
      loadBatches();
    }
    setCreating(false);
  }

  const selectedBranch = branches.find(b => b.id === branchId);

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/admin/branches")} size="icon" className="rounded-full">
             <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Batches</h1>
            <p className="text-muted-foreground mt-1 underline underline-offset-4 decoration-primary/20">
              {selectedBranch ? `Managing cohorts for ${selectedBranch.name}` : "Institutional cohort management."}
            </p>
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-full">
           <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
      </header>

      {/* Context Selection Bar */}
      <Card className="border-primary/20 bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
               <Layers className="w-5 h-5 text-muted-foreground" />
               <Label className="font-bold">Academic Branch Context:</Label>
            </div>
            <select 
              className="flex h-10 w-full md:flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={branchId || ""}
              onChange={(e) => router.push(`/dashboard/admin/batches?branchId=${e.target.value}`)}
            >
              <option value="" disabled>-- Select Branch context --</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {!branchId ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center flex flex-col items-center">
             <GraduationCap className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
             <h3 className="text-xl font-semibold text-muted-foreground">Identify Cohort Context</h3>
             <p className="text-muted-foreground mt-2 max-w-sm italic tracking-tight">Please select an academic branch from the dropdown above to manage its student batches.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="h-fit border-l-4 border-l-blue-600/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Plus className="w-5 h-5 text-blue-600" />
                 Launch New Batch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="batchName">Cohort Name</Label>
                   <Input 
                      id="batchName" 
                      placeholder="e.g. Class of 2026" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="year">Graduation Year</Label>
                   <Input 
                      id="year" 
                      type="number"
                      placeholder="2026" 
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                      required
                   />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={creating}>
                   {creating ? "Launching..." : "Register Batch"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-4 border-b">
               <CardTitle className="text-lg">Active Cohorts Registry</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
               <Table>
                  <TableHeader>
                     <TableRow className="hover:bg-transparent">
                        <TableHead>Batch Identity</TableHead>
                        <TableHead>Graduation Year</TableHead>
                        <TableHead className="text-right">Enrollment Status</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic tracking-widest">Accessing repository records...</TableCell></TableRow>
                     ) : batches.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center text-muted-foreground py-12 italic font-medium">
                              No batches found for this branch registry.
                           </TableCell>
                        </TableRow>
                     ) : batches.map((batch) => (
                        <TableRow key={batch.id} className="group transition-colors hover:bg-muted/30 h-16">
                           <TableCell className="font-bold text-blue-900 dark:text-blue-100">{batch.name}</TableCell>
                           <TableCell>
                              <div className="flex items-center text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded w-fit border shadow-sm">
                                 <Calendar className="w-3.5 h-3.5 mr-2 text-blue-600" /> {batch.graduationYear}
                              </div>
                           </TableCell>
                           <TableCell className="text-right">
                              <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900 tracking-tighter shadow-sm">
                                Active enrollment
                              </span>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse text-muted-foreground italic">Initializing Academic Context...</div>}>
      <BatchesContent />
    </Suspense>
  );
}
