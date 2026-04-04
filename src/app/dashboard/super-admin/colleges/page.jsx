"use client";

import { useEffect, useState } from "react";
import { orgClient } from "@/lib/api-client/org.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Plus, MapPin } from "lucide-react";
import Link from "next/link";

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [creating, setCreating] = useState(false);

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

  return (
    <div className="space-y-6 container mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">College Management</h1>
          <p className="text-muted-foreground mt-1">Register and manage institutions on the Testimony platform.</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
           <School className="w-8 h-8 text-primary" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Register New College</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Stanford University" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input 
                  id="address" 
                  placeholder="e.g. California, USA" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Registering..." : <><Plus className="w-4 h-4 mr-2" /> Register College</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle className="text-lg">Institutions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Admins</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : colleges.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No colleges registered yet.</TableCell></TableRow>
                ) : colleges.map((college) => (
                  <TableRow key={college.id} className="group">
                    <TableCell className="font-semibold underline decoration-primary/20 underline-offset-4 group-hover:decoration-primary/50 transition-all">{college.name}</TableCell>
                    <TableCell>
                       <div className="flex items-center text-xs text-muted-foreground">
                         <MapPin className="w-3 h-3 mr-1" /> {college.address || "No address provided"}
                       </div>
                    </TableCell>
                    <TableCell>
                       <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                         {college._count?.users || 0} Admin(s)
                       </span>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/dashboard/super-admin/colleges/${college.id}`}>
                         <Button variant="outline" size="sm" className="hover:bg-primary/5 hover:text-primary border-primary/20">
                            Manage
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
