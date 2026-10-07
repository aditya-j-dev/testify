import { createSubjectsBatch } from "@/lib/services/org.service.js";
import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";

/**
 * POST /api/org/subjects/batch
 * Handles both JSON (for comma-separated lists) and FormData (for file uploads).
 */
export async function POST(req) {
  try {
    // 1. Auth Check
    const token = req.headers.get("Authorization")?.split(" ")[1] || req.cookies.get("testify-token")?.value;
    if (!token) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
        return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let subjectsList = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle File Upload
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file) return Response.json({ success: false, message: "No file uploaded" }, { status: 400 });

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet);

      subjectsList = rawData.map(row => {
        const keys = Object.keys(row);
        const nameKey = keys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("subject"));
        const codeKey = keys.find(k => k.toLowerCase().includes("code"));
        const creditsKey = keys.find(k => k.toLowerCase().includes("credit"));

        return {
          name: row[nameKey]?.toString()?.trim(),
          code: row[codeKey]?.toString()?.trim(),
          credits: row[creditsKey]
        };
      }).filter(s => s.name);

    } else {
      // Expecting JSON array of {name, code, credits}
      const body = await req.json();
      if (!Array.isArray(body)) {
        return Response.json({ success: false, message: "Expected an array of subjects" }, { status: 400 });
      }
      subjectsList = body;
    }

    if (subjectsList.length === 0) {
      return Response.json({ success: false, message: "No subjects found to process" }, { status: 400 });
    }

    const result = await createSubjectsBatch(decoded.collegeId, subjectsList);

    return Response.json({
      success: true,
      message: `Successfully processed subjects.`,
      result
    });

  } catch (error) {
    console.error("[SUBJECTS_BATCH_API_ERROR]", error);
    return Response.json({
      success: false,
      message: error.message || "An error occurred"
    }, { status: 500 });
  }
}
