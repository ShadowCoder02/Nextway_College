import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/admin/session";
import { checkRateLimit } from "@/lib/admissions/rate-limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limit = checkRateLimit(`admin_login_${ip}`, 8, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: `Too many login attempts. Please try again in ${limit.retryAfterSeconds} seconds.` },
      { status: 429 },
    );
  }

  const body = await request.json();
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
