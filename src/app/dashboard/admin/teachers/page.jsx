"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, UserPlus, Mail, Shield, Search, Trash2 } from "lucide-react";

export default function ManageTeachersPage() {
  const { user: currentUser } = useAuth();
  
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New Teacher Form
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    const data = await orgClient.users.list("TEACHER");
    if (data.success) {
      setTeachers(data.users);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCreating(true);
    const res = await orgClient.users.create({ ...formData, role: "TEACHER" });
    if (res.success) {
      setFormData({ name: "", email: "", password: "" });
      loadTeachers();
    } else {
      alert(res.message || "Failed to add teacher");
    }
    setCreating(false);
  }

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Manage institutional access for your teaching staff.</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
           <Users className="w-8 h-8 text-primary" />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Onboarding Form */}
        <Card className="lg:col-span-1 h-fit border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Onboard Teacher
            </CardTitle>
            <CardDescription>Manually provision a new faculty account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tName">Full Name</Label>
                <Input 
                  id="tName" 
                  placeholder="e.g. Prof. Robert Oppenheimer"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tEmail">Email Address</Label>
                <Input 
                  id="tEmail" 
                  type="email"
                  placeholder="faculty@college.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tPass">Initial Password</Label>
                <Input 
                  id="tPass" 
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Provisioning..." : "Add to Faculty"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Faculty List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
             <CardTitle className="text-lg">Faculty Directory</CardTitle>
             <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search faculty..." 
                  className="pl-8" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Privileges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12">Loading personnel...</TableCell></TableRow>
                ) : filteredTeachers.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                        {searchQuery ? "No matches found." : "No faculty registered yet."}
                     </TableCell>
                  </TableRow>
                ) : filteredTeachers.map((t) => (
                  <TableRow key={t.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground">
                             {t.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm">{t.name}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center text-xs text-muted-foreground font-mono">
                          <Mail className="w-3 h-3 mr-1" /> {t.email}
                       </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                       {new Date(t.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <Shield className="w-2 h-2" /> EXAM CREATOR
                       </span>
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
