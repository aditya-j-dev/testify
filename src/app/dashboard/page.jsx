"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

import StatsCards from "@/components/dashboard/stats-cards";
import { getDashboardStats } from "@/lib/services/dashboard.service";

export default function DashboardHome() {

  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalExams: 0,
    totalAttempts: 0,
    avgScore: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

  }, []);

  return (

    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back
        </h1>
        <p className="text-muted-foreground">
          {user?.email}
        </p>
      </div>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <StatsCards stats={stats} />
      )}

    </div>

  );

}