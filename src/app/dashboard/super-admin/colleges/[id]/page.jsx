"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, UserPlus, ArrowLeft, Save, Mail, User, ShieldCheck, Trash2 } from "lucide-react";

export default function CollegeDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // College Edit State
  const [editData, setEditData] = useState({ name: "", address: "" });
  const [updating, setUpdating] = useState(false);

  // Admin Creation State
  const [adminData, setAdminData] = useState({ name: "", email: "", password: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const data = await orgClient.colleges.getById(id);
    if (data.success) {
      setCollege(data.college);
      setEditData({ name: data.college.name, address: data.college.address || "" });
    }
    setLoading(false);
  }

  async function handleUpdateCollege(e) {
    e.preventDefault();
    setUpdating(true);
    const res = await orgClient.colleges.update(id, editData);
    if (res.success) {
      setCollege({ ...college, ...editData });
    }
    setUpdating(false);
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setCreatingAdmin(true);
    const res = await orgClient.colleges.createAdmin(id, adminData);
    if (res.success) {
      setAdminData({ name: "", email: "", password: "" });
      loadData(); // Refresh list
    } else {
      alert(res.message || "Failed to create admin");
    }
    setCreatingAdmin(false);
  }

  if (loading) return <div className="p-8 text-center">Loading institutional data...</div>;
  if (!college) return <div className="p-8 text-center">College not found.</div>;

  return (
    <div className="space-y-8 container mx-auto pb-12">
      <header className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{college.name}</h1>
          <p className="text-muted-foreground">Institution ID: {college.id}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Edit Details */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                Institutional Identity
              </CardTitle>
              <CardDescription>Update general information for this college.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCollege} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">College Name</Label>
                  <Input 
                    id="name" 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Location / Address</Label>
                  <Input 
                    id="address" 
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updating}>
                  {updating ? "Saving Changes..." : <><Save className="w-4 h-4 mr-2" /> Save Metadata</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Assign New Admin
              </CardTitle>
              <CardDescription>Create a dedicated administrator for this institution.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="adminName">Full Name</Label>
                   <Input 
                      id="adminName" 
                      placeholder="e.g. Dr. Jane Smith"
                      value={adminData.name}
                      onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                      required
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="adminEmail">Corporate Email</Label>
                   <Input 
                      id="adminEmail" 
                      type="email"
                      placeholder="admin@college.edu"
                      value={adminData.email}
                      onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                      required
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="adminPass">Initialization Password</Label>
                   <Input 
                      id="adminPass" 
                      type="password"
                      placeholder="••••••••"
                      value={adminData.password}
                      onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                      required
                   />
                </div>
                <Button type="submit" variant="secondary" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={creatingAdmin}>
                   {creatingAdmin ? "Assigning..." : "Provision Admin Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admin List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Administrative Personnel</CardTitle>
                <CardDescription>Verified users with management privileges for this college.</CardDescription>
              </div>
              <ShieldCheck className="w-8 h-8 text-muted-foreground/30" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrator</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Provisioned On</TableHead>
                    <TableHead className="text-right">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {college.users?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                         No administrators assigned to this institution yet.
                      </TableCell>
                    </TableRow>
                  ) : college.users?.map((adm) => (
                    <TableRow key={adm.id}>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                               {adm.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{adm.name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{adm.email}</TableCell>
                      <TableCell className="text-xs">{new Date(adm.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                         <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                           Full Admin
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
    </div>
  );
}
