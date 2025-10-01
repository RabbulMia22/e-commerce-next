// lib/adminAuth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "supersecret";

export default function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return decoded; // user is admin
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
