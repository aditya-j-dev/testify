"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-background relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl font-bold mb-4">
        Testify
      </h1>

      <p className="text-muted-foreground mb-6">
        Create exams. Attempt tests. Track performance.
      </p>

      <div className="flex gap-4">
        {user ? (
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/register">
              <Button>
                Get Started
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="outline">
                Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}