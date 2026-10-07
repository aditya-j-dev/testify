"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ProtectedRoute({
  children,
  requiredRole = null,
}) {

  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {

    // Wait until auth finishes loading
    if (loading) return;

    // Not logged in
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Role check
    if (requiredRole && user.role !== requiredRole) {
      router.replace("/unauthorized");
      return;
    }

    // Authorized
    setAuthorized(true);

  }, [loading, isAuthenticated, user, requiredRole, router]);

  // Show loading while auth loads
  if (loading || !authorized) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  }

  return children;

}