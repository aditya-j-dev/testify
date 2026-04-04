"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Plus, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function BranchesPage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.collegeId) {
      loadBranches();
    }
  }, [user]);

  async function loadBranches() {
    const data = await orgClient.branches.list(user.collegeId);
    if (data.success) setBranches(data.branches);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !user?.collegeId) return;
    setCreating(true);
    const data = await orgClient.branches.create({ name, collegeId: user.collegeId });
    if (data.success) {
      setName("");
      loadBranches();
    }
    setCreating(false);
  }

  if (!user?.collegeId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">No College Linked</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Your account is not currently linked to any college. Please contact the Super Admin to resolve this.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Branches</h1>
          <p className="text-muted-foreground mt-1">Manage departments and programs for your institution.</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
           <GitBranch className="w-6 h-6 text-blue-600" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="h-fit">
            <CardHeader>
               <CardTitle className="text-lg">Add New Branch</CardTitle>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="branchName">Branch / Department Name</Label>
                     <Input 
                        id="branchName" 
                        placeholder="e.g. Computer Science" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                     />
                  </div>
                  <Button type="submit" className="w-full" disabled={creating}>
                     {creating ? "Adding..." : <><Plus className="w-4 h-4 mr-2" /> Add Branch</>}
                  </Button>
               </form>
            </CardContent>
         </Card>

         <Card className="md:col-span-1 lg:col-span-2">
            <CardHeader>
               <CardTitle className="text-lg">Existing Branches</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Branch Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                     ) : branches.length === 0 ? (
                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No branches found.</TableCell></TableRow>
                     ) : branches.map((branch) => (
                        <TableRow key={branch.id}>
                           <TableCell className="font-medium">{branch.name}</TableCell>
                           <TableCell className="text-right">
                              <Link href={`/dashboard/admin/batches?branchId=${branch.id}`}>
                                 <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <GraduationCap className="w-4 h-4 mr-2" /> Manage Batches
                                 </Button>
                              </Link>
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
