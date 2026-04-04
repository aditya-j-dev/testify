"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Plus, ArrowLeft, Calendar } from "lucide-react";

function BatchesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const branchId = searchParams.get("branchId");

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", graduationYear: new Date().getFullYear() + 4 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (branchId) {
      loadBatches();
    }
  }, [branchId]);

  async function loadBatches() {
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

  if (!branchId) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Please select a branch first.</p>
        <Button onClick={() => router.push("/dashboard/admin/branches")} className="mt-4">Go to Branches</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon">
             <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Batches</h1>
            <p className="text-muted-foreground mt-1 text-sm">Organize students into groups based on their graduation year.</p>
          </div>
        </div>
        <div className="bg-emerald-100 p-3 rounded-full">
           <GraduationCap className="w-6 h-6 text-emerald-600" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
         <Card className="h-fit">
            <CardHeader>
               <CardTitle className="text-lg">Register New Batch</CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="batchName">Batch Name</Label>
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
                  <Button type="submit" className="w-full" disabled={creating}>
                     {creating ? "Adding..." : <><Plus className="w-4 h-4 mr-2" /> Create Batch</>}
                  </Button>
               </form>
            </CardContent>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle className="text-lg">Active Batches</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Batch Name</TableHead>
                        <TableHead>Graduation Year</TableHead>
                        <TableHead>Status</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                     ) : batches.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-12 italic">No batches found for this branch.</TableCell></TableRow>
                     ) : batches.map((batch) => (
                        <TableRow key={batch.id}>
                           <TableCell className="font-semibold text-primary/80 underline decoration-primary/20">{batch.name}</TableCell>
                           <TableCell>
                              <div className="flex items-center text-xs text-muted-foreground">
                                 <Calendar className="w-3 h-3 mr-1" /> {batch.graduationYear}
                              </div>
                           </TableCell>
                           <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 italic">Active Enrollment</span>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

export default function BatchesPage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <BatchesContent />
    </Suspense>
  );
}
