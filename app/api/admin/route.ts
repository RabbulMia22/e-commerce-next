import requireAdmin from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  
  if (admin instanceof NextResponse) {
    // not admin
    return admin;
  }

  // ✅ Admin access granted
  return NextResponse.json({ message: "Welcome, admin!", user: admin });
}