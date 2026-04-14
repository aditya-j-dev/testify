import { deleteUser } from "@/lib/services/org.service";
import { cookies } from "next/headers";

async function getAuthContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get("testify-token")?.value;
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

// DELETE /api/org/users/[id]
export async function DELETE(req, { params }) {
  try {
    const auth = await getAuthContext();
    if (!auth || auth.role !== "ADMIN") {
      return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await deleteUser(id, auth.collegeId);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}
