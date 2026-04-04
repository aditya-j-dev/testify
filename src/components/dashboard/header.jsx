"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { School } from "lucide-react";

export default function Header() {

  const { user, logout } = useAuth();

  return (

    <header className="
      border-b
      px-6
      py-4
      flex
      justify-between
      items-center
      bg-background
    ">

      <div>

        <p className="text-sm text-muted-foreground">
          Logged in as
        </p>

        <p className="font-medium">
          {user?.role}
        </p>

      </div>

      <div className="flex gap-6 items-center">
        {user?.college?.name && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 transition-all hover:bg-primary/10">
            <School className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight uppercase">{user.college.name}</span>
          </div>
        )}
        <div className="h-6 w-px bg-border mx-1" />
        <ThemeToggle />
        <Button
          variant="destructive"
          size="sm"
          onClick={logout}
          className="shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          Logout
        </Button>
      </div>

    </header>

  );

}