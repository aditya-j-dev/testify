"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Users } from "lucide-react";

export default function Sidebar() {

  const { user } = useAuth();

  return (

    <aside className="
      w-64
      min-h-screen
      border-r
      bg-background
      p-4
    ">



      <nav className="space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent text-foreground transition-all"
        >
          Testify
        </Link>

        {user?.role === "SUPER_ADMIN" && (
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Platform Admin</h3>
            <Link
              href="/dashboard/super-admin/colleges"
              className="flex items-center px-3 py-2 text-sm font-semibold rounded-md hover:bg-primary/10 text-primary transition-all"
            >
              School Management
            </Link>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">College Settings</h3>
            <Link
              href="/dashboard/admin/teachers"
              className="flex items-center px-3 py-2 text-sm font-semibold rounded-md hover:bg-primary/10 text-primary transition-all mb-1"
            >
              <Users className="w-4 h-4 mr-2" /> Manage Teachers
            </Link>
            <Link
              href="/dashboard/admin/branches"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              Academic Branches
            </Link>
            <Link
              href="/dashboard/admin/batches"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              Class Batches
            </Link>
          </div>
        )}

        {(user?.role === "TEACHER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Academic Control</h3>
            <Link
              href="/dashboard/exams"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              My Exams
            </Link>
            <Link
              href="/dashboard/teacher/questions"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              Question Bank
            </Link>
          </div>
        )}

        {user?.role === "STUDENT" && (
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Student Portal</h3>
            <Link
              href="/dashboard/student/take-exam"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              Active Exams
            </Link>
            <Link
              href="/dashboard/student/results"
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent text-foreground"
            >
              My Results
            </Link>
          </div>
        )}
      </nav>

    </aside>

  );

}