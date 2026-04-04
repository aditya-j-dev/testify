"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-background relative">
      <h1 className="text-4xl font-bold mb-4">
        Testify
      </h1>

      <p className="text-muted-foreground mb-6">
        Create exams. Attempt tests. Track performance.
      </p>

      <div className="flex gap-4">
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
      </div>
    </div>
  );
}