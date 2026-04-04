"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import Sidebar from "./sidebar";
import Header from "./header";

export default function DashboardLayout({ children }) {

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