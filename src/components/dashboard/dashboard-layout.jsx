"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import Sidebar from "./sidebar";
import Header from "./header";
import { usePathname } from "next/navigation";

import ForcePasswordChange from "./force-password-change";
import { useAuth } from "@/context/auth-context";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActiveExam = pathname?.endsWith("/active");

  if (user?.requirePasswordChange) {
    return <ForcePasswordChange />;
  }

  if (isActiveExam) {
     return (
       <ProtectedRoute>
          <div className="min-h-screen bg-slate-50">
             {children}
          </div>
       </ProtectedRoute>
     );
  }

  return (
    <ProtectedRoute>

      <div className="min-h-screen bg-background text-foreground">

        <div className="flex">

          <Sidebar />

          <div className="flex-1 flex flex-col">

            <Header />

            <main className="flex-1 p-6">
              {children}
            </main>

          </div>

        </div>

      </div>

    </ProtectedRoute>

  );

}