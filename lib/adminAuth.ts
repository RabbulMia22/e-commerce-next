// lib/adminAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "supersecret";

export default async function requireAdmin(req: NextRequest) {
  try {
    const token: any = await getToken({ req, secret: JWT_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (token.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return token; // user is admin
  } catch (err) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
