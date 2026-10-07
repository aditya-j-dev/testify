import { updateSubject, deleteSubject } from "@/lib/services/org.service";
import { cookies } from "next/headers";

async function getAuthContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch (e) { return null; }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const subject = await updateSubject(id, body);
    return Response.json({ success: true, subject });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "SUPER_ADMIN")) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteSubject(id);
    return Response.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
