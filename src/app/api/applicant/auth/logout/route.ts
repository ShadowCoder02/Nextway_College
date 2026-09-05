import { NextResponse } from "next/server";
import { clearApplicantSession } from "@/lib/admissions/session";

export async function POST() {
  await clearApplicantSession();
  return NextResponse.json({ ok: true });
}
