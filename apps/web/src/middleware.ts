import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register", "/forgot-password"];

// A valid refresh token is a 96-char hex string (randomBytes(48)).
// A JWT starts with 'eyJ' — that's a stale/wrong cookie from old code.
function isValidRefreshToken(value: string | undefined): boolean {
  if (!value) return false;
  if (value.startsWith("eyJ")) return false; // JWT accidentally stored as refresh token
  return value.length >= 32;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get("refresh_token")?.value;
  const hasValidToken = isValidRefreshToken(rawCookie);

  console.log(`[middleware] ${pathname} | cookie: ${rawCookie ? rawCookie.slice(0, 12) + '...' : 'NONE'} | valid: ${hasValidToken}`);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !hasValidToken) {
    console.log(`[middleware] BLOCKING ${pathname} — redirecting to /login`);
    const res = NextResponse.redirect(new URL("/login", request.url));
    if (rawCookie) res.cookies.delete("refresh_token"); // clear the bad cookie
    return res;
  }

  if (isAuthPage && hasValidToken) {
    console.log(`[middleware] AUTH PAGE with valid cookie — redirecting to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
