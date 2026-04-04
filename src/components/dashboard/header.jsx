"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function Header() {

  const { user, logout } = useAuth();
  const { setTheme } = useTheme();

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

      {/* <div className="flex gap-2">

        <Button
          variant="outline"
          onClick={() => setTheme("light")}
        >
          Light
        </Button>

        <Button
          variant="outline"
          onClick={() => setTheme("dark")}
        >
          Dark
        </Button>

        <Button
          variant="destructive"
          onClick={logout}
        >
          Logout
        </Button>

      </div> */}

    </header>

  );

}