import { cookies } from "next/headers";
import type { ApplicantSession } from "@/types/admissions";
import { signToken, verifySignedToken } from "./crypto";

export const APPLICANT_COOKIE = "nwc_applicant_session";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload extends ApplicantSession {
  exp: number;
}

export async function createApplicantSession(session: ApplicantSession): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS,
  };

  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signed = signToken(serialized);

  cookieStore.set(APPLICANT_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_SECONDS,
  });
}

export async function getApplicantSession(): Promise<ApplicantSession | null> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(APPLICANT_COOKIE)?.value;
    if (!cookieVal) return null;

    const payloadRaw = verifySignedToken(cookieVal);
    if (!payloadRaw) return null;

    const jsonStr = Buffer.from(payloadRaw, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr) as SessionPayload;

    if (!parsed.applicantId || !parsed.email || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return {
      applicantId: parsed.applicantId,
      email: parsed.email,
      fullName: parsed.fullName,
    };
  } catch {
    return null;
  }
}

export async function clearApplicantSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(APPLICANT_COOKIE);
}

export async function requireApplicant() {
  const session = await getApplicantSession();
  if (!session) {
    return { ok: false as const, error: "Authentication required" };
  }
  return { ok: true as const, session };
}
