"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, UserPlus, Search, Mail, BookOpen, Layers } from "lucide-react";

export default function ManageStudentsPage() {
  const { user: currentUser } = useAuth();
  
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New Student Form
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentUser?.collegeId) {
      loadInitialData();
    }
  }, [currentUser]);

  async function loadInitialData() {
    const data = await orgClient.branches.list(currentUser.collegeId);
    if (data.success) {
      setBranches(data.branches);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (selectedBranchId) {
      loadBatches();
    } else {
      setBatches([]);
      setSelectedBatchId("");
    }
  }, [selectedBranchId]);

  async function loadBatches() {
    const data = await orgClient.batches.list(selectedBranchId);
    if (data.success) setBatches(data.batches);
  }

  useEffect(() => {
    if (selectedBatchId) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedBatchId]);

  async function loadStudents() {
    setLoading(true);
    const data = await orgClient.users.list("STUDENT", selectedBatchId);
    if (data.success) setStudents(data.users);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedBatchId) return;
    setCreating(true);
    const res = await orgClient.users.create({ 
      ...formData, 
      role: "STUDENT", 
      batchId: selectedBatchId,
      branchId: selectedBranchId 
    });
    
    if (res.success) {
      setFormData({ name: "", email: "", password: "" });
      loadStudents();
    } else {
      alert(res.message || "Failed to enroll student");
    }
    setCreating(false);
  }

  const filteredStudents = (students || []).filter(s => {
    if (!s) return false;
    const query = (searchQuery || "").toLowerCase();
    const nameMatch = (s.name || "").toLowerCase().includes(query);
    const emailMatch = (s.email || "").toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Admissions</h1>
          <p className="text-muted-foreground mt-1">Provision accounts and manage department enrollments.</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
           <GraduationCap className="w-8 h-8 text-primary" />
        </div>
      </header>

      {/* Cohort Selection Selectors */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={selectedBranchId ? 'border-primary/20' : 'border-dashed'}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold mb-1">
                <Layers className="w-4 h-4 text-muted-foreground" /> 1. Select Department
              </Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="">-- Choose Branch --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className={!selectedBranchId ? "opacity-50 grayscale pointer-events-none" : (selectedBatchId ? 'border-primary/20' : 'border-dashed')}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold mb-1">
                <BookOpen className="w-4 h-4 text-muted-foreground" /> 2. Select Batch
              </Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                disabled={!selectedBranchId}
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.graduationYear})</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedBatchId ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center flex flex-col items-center">
             <Layers className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
             <h3 className="text-xl font-semibold text-muted-foreground">Identify Enrollment Context</h3>
             <p className="text-muted-foreground mt-2 max-w-sm italic">Please select a department and a corresponding batch above to manage students.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Enrollment Form */}
          <Card className="lg:col-span-1 h-fit border-l-4 border-l-primary/60 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Register Student
              </CardTitle>
              <CardDescription>Provision institutional account details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sName">Full Name</Label>
                  <Input 
                    id="sName" 
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sEmail">Institutional Email</Label>
                  <Input 
                    id="sEmail" 
                    type="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sPass">Account Password</Label>
                  <Input 
                    id="sPass" 
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Enrolling..." : "Enroll to Batch"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Student Directory */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
               <div>
                  <CardTitle className="text-lg">Class Directory</CardTitle>
               </div>
               <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search student..." 
                    className="pl-8 rounded-full h-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Identity Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">Fetching cohort records...</TableCell></TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                          {searchQuery ? "No matching records." : "No students enrolled in this batch yet."}
                       </TableCell>
                    </TableRow>
                  ) : filteredStudents.map((s) => (
                    <TableRow key={s.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground border shadow-sm">
                               {s.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm">{s.name}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center text-xs text-muted-foreground font-mono">
                            <Mail className="w-3 h-3 mr-1" /> {s.email}
                         </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                         {new Date(s.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                         <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                           VERIFIED STUDENT
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
