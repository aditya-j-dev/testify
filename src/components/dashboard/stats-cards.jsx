"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCards({ stats }) {

  return (

    <div className="grid gap-4 md:grid-cols-3">

      <Card>
        <CardHeader>
          <CardTitle>Total Exams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {stats.totalExams}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {stats.totalAttempts}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Avg</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {stats.avgScore || 0}
          </p>
        </CardContent>
      </Card>

    </div>

  );

}