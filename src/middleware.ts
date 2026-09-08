// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const hasCookie = request.cookies.has("better-auth.session_token");
//   const pathname = request.nextUrl.pathname;
//   const isAdminRoute = pathname.startsWith("/admin");
//   const isProtectedUserRoute = pathname.startsWith("/profile") || pathname.startsWith("/bookings");
//   const isAuthRoute = pathname.startsWith("/auth");

//   if ((isAdminRoute || isProtectedUserRoute) && !hasCookie) {
//     const loginUrl = new URL("/auth/login", request.url);
//     loginUrl.searchParams.set("returnTo", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   const authExceptions = [
//     "/auth/error",
//     "/auth/login",
//     "/auth/forgot-password",
//     "/auth/reset-password",
//   ];
//   if (isAuthRoute && hasCookie && !authExceptions.includes(pathname)) {
//     return NextResponse.redirect(new URL("/admin", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/auth/:path*", "/profile/:path*", "/bookings/:path*"],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const hasCookie = !!sessionCookie;
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedUserRoute = pathname.startsWith("/profile") || pathname.startsWith("/bookings");
  const isAuthRoute = pathname.startsWith("/auth");

  if ((isAdminRoute || isProtectedUserRoute) && !hasCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const authExceptions = [
    "/auth/error",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];
  if (isAuthRoute && hasCookie && !authExceptions.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*", "/profile/:path*", "/bookings/:path*"],
};
