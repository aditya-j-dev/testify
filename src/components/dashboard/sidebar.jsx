"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, GitBranch, LayoutDashboard, BookOpen, ClipboardList, School, CreditCard, BarChart3 } from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  function navLink(href, icon, label) {
    const Icon = icon;
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all gap-2 ${
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r bg-background p-4 flex flex-col gap-1">
      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg hover:bg-accent transition-all">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-serif italic font-bold text-base">T</div>
        <span className="font-bold text-foreground tracking-tight">Testify</span>
      </Link>

      <nav className="space-y-0.5">

        {user?.role === "SUPER_ADMIN" && (
          <>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 mt-3">Platform Admin</p>
            {navLink("/dashboard/super-admin", BarChart3, "Overview")}
            {navLink("/dashboard/super-admin/colleges", School, "Colleges")}
            {navLink("/dashboard/super-admin/plans", CreditCard, "Plans")}
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 mt-3">College Settings</p>
            {navLink("/dashboard/admin", BarChart3, "Overview")}
            {navLink("/dashboard/admin/teachers", Users, "Manage Teachers")}
            {navLink("/dashboard/admin/students", GraduationCap, "Manage Students")}
            {navLink("/dashboard/admin/subjects", BookOpen, "Manage Subjects")}
            {navLink("/dashboard/admin/branches", GitBranch, "Academic Branches")}
            {navLink("/dashboard/admin/batches", LayoutDashboard, "Class Batches")}
            {navLink("/dashboard/admin/billing", CreditCard, "Billing & Plan")}
          </>
        )}

        {user?.role === "TEACHER" && (
          <>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 mt-3">Faculty Control</p>
            {navLink("/dashboard/teacher/exams", ClipboardList, "Manage Exams")}
            {navLink("/dashboard/teacher/questions", BookOpen, "Question Bank")}
          </>
        )}

        {user?.role === "STUDENT" && (
          <>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 mt-3">Student Portal</p>
            {navLink("/dashboard/student/exams", ClipboardList, "My Assessments")}
            {navLink("/dashboard/student/results", BarChart3, "My Results")}
          </>
        )}
      </nav>
    </aside>
  );
}