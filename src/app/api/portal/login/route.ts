import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/admin/session";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ ok: false, error: "Invalid username or password" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
