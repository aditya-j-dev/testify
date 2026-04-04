"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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

      <div className="flex gap-4 items-center">
        <ThemeToggle />
        <Button
          variant="destructive"
          onClick={logout}
        >
          Logout
        </Button>
      </div>

    </header>

  );

}