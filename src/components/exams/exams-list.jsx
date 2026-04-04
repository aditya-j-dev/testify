"use client";

import { useEffect, useState } from "react";
import { getExamsService } from "@/lib/services/exam.service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ExamsList() {

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchExams() {
      try {
        const data = await getExamsService();
        setExams(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchExams();

  }, []);

  if (loading) {
    return <p>Loading exams...</p>;
  }

  return (

    <div className="space-y-4">

      <h1 className="text-2xl font-semibold">
        Exams
      </h1>

      {exams.length === 0 ? (
        <p className="text-muted-foreground">
          No exams found
        </p>
      ) : (

        <div className="grid gap-4 md:grid-cols-2">

          {exams.map((exam) => (

            <Card key={exam.id}>

              <CardHeader>
                <CardTitle>
                  {exam.title}
                </CardTitle>
              </CardHeader>

              <CardContent>

                <p className="text-sm text-muted-foreground">
                  {exam.description || "No description"}
                </p>

                <div className="mt-2 text-sm">
                  Duration: {exam.duration} mins
                </div>

                <div className="text-sm">
                  Marks: {exam.totalMarks}
                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

    </div>

  );

}