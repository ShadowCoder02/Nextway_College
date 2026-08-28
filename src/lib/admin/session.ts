import { cookies } from "next/headers";

export const ADMIN_COOKIE = "nwc_admin_session";

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "authenticated";
}

export function verifyAdminCredentials(username: string, password: string) {
  const adminUser = process.env.ADMIN_USERNAME || "nextway college";
  const adminPassword = process.env.ADMIN_PASSWORD || "123456789";
  return (
    username.trim().toLowerCase() === adminUser.trim().toLowerCase() &&
    password === adminPassword
  );
}
