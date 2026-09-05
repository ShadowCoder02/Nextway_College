import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_COOKIE } from "@/lib/admin/session";
import { APPLICANT_COOKIE } from "@/lib/admissions/session";

function portalRedirect(request: NextRequest, from: string, to: string) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.replace(from, to);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return portalRedirect(request, "/admin", "/portal");
  }

  // Protect Staff / Management Portal
  const isPortalRoute = pathname.startsWith("/portal");
  const isPortalLogin = pathname.startsWith("/portal/login");

  if (isPortalRoute && !isPortalLogin) {
    const hasLocalSession = request.cookies.get(ADMIN_COOKIE)?.value === "authenticated";
    if (hasLocalSession) {
      return NextResponse.next();
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/portal/login";
    return NextResponse.redirect(loginUrl);
  }

  // Protect Applicant Portal
  const isApplicantPortal = pathname.startsWith("/apply/portal");
  if (isApplicantPortal) {
    const applicantCookie = request.cookies.get(APPLICANT_COOKIE)?.value;
    if (!applicantCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/apply/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/api/admin")) {
    return portalRedirect(request, "/api/admin", "/api/portal");
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/api/admin/:path*",
    "/apply/portal/:path*",
  ],
};
