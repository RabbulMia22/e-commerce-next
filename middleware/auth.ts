import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("MIDDLEWARE TOKEN:", token);
  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

// Protect dashboard & admin routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
