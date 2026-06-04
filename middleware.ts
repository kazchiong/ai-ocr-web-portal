// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
const PUBLIC_PAGES = ["/login", "/about", "/","/forgot-password","/reset-password"]; // public pages

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (token && PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }
  // Allow public pages and API routes to pass through
  if (PUBLIC_PAGES.includes(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname.startsWith("/admin")) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload }: any = await jwtVerify(token, secret);
    if (!(payload.role_id == 3 || payload.role_id ==2)) {
      return NextResponse.redirect(new URL("/what-are-you-trying-to-do", req.url));
    }
  }
  // Otherwise allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};
