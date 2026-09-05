import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_COOKIE } from "@/lib/admin/session";
import { APPLICANT_COOKIE } from "@/lib/admissions/cookie-names";

// Double-submit cookie CSRF pattern: the cookie is deliberately NOT httpOnly
// so client JS can read it and echo it back as a header — the security
// guarantee comes from same-origin JS being the only thing that can read it,
// not from hiding it. See src/lib/csrf-client.ts for the client-side half.
export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function portalRedirect(request: NextRequest, from: string, to: string) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.replace(from, to);
  return NextResponse.redirect(url);
}

function withCsrfCookie(request: NextRequest, response: NextResponse): NextResponse {
  if (!request.cookies.get(CSRF_COOKIE_NAME)) {
    response.cookies.set(CSRF_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

function csrfRejection() {
  return NextResponse.json(
    { ok: false, error: "Invalid or missing security token. Please refresh the page and try again." },
    { status: 403 },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF check, site-wide, before anything else — every mutating API route
  // is covered without needing to remember to add it per-route.
  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(request.method)) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return csrfRejection();
    }
  }

  if (pathname.startsWith("/admin")) {
    return withCsrfCookie(request, portalRedirect(request, "/admin", "/portal"));
  }

  // Protect Staff / Management Portal
  const isPortalRoute = pathname.startsWith("/portal");
  const isPortalLogin = pathname.startsWith("/portal/login");

  if (isPortalRoute && !isPortalLogin) {
    const hasLocalSession = request.cookies.get(ADMIN_COOKIE)?.value === "authenticated";
    if (hasLocalSession) {
      return withCsrfCookie(request, NextResponse.next());
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/portal/login";
    return withCsrfCookie(request, NextResponse.redirect(loginUrl));
  }

  // Protect Applicant Portal
  const isApplicantPortal = pathname.startsWith("/apply/portal");
  if (isApplicantPortal) {
    const applicantCookie = request.cookies.get(APPLICANT_COOKIE)?.value;
    if (!applicantCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/apply/login";
      return withCsrfCookie(request, NextResponse.redirect(loginUrl));
    }
  }

  if (pathname.startsWith("/api/admin")) {
    return withCsrfCookie(request, portalRedirect(request, "/api/admin", "/api/portal"));
  }

  // Supabase session refresh only where it previously ran (portal login and
  // an authenticated applicant portal) — broadening the matcher below for
  // CSRF must not make this run on every public page too.
  if (isPortalLogin || isApplicantPortal) {
    return withCsrfCookie(request, await updateSession(request));
  }

  return withCsrfCookie(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|map)$).*)"],
};
