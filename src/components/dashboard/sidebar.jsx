"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

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



      <nav className="space-y-2">

        <Link
          href="/dashboard"
          className="block px-3 py-2 rounded hover:bg-accent"
        >
          Dashboard
        </Link>

        {user?.role === "TEACHER" && (
          <>
            <Link
              href="/dashboard/exams"
              className="block px-3 py-2 rounded hover:bg-accent"
            >
              My Exams
            </Link>

            <Link
              href="/dashboard/exams/create"
              className="block px-3 py-2 rounded hover:bg-accent"
            >
              Create Exam
            </Link>
          </>
        )}

        {user?.role === "STUDENT" && (
          <Link
            href="/dashboard/attempts"
            className="block px-3 py-2 rounded hover:bg-accent"
          >
            My Attempts
          </Link>
        )}

      </nav>

    </aside>

  );

}