import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const form = new URLSearchParams(text);
    const tran_id = form.get("tran_id") || "";
    const reason = form.get("error") || form.get("status") || "FAILED";
    const url = new URL("/payment-error", req.url);
    if (tran_id) url.searchParams.set("tran_id", tran_id);
    if (reason) url.searchParams.set("reason", reason);
    return NextResponse.redirect(url, 302);
  } catch (e) {
    return NextResponse.redirect(new URL("/payment-error?reason=handler_error", req.url), 302);
  }
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const tran_id = p.get("tran_id") || "";
  const reason = p.get("error") || p.get("status") || "FAILED";
  return NextResponse.redirect(
    new URL(`/payment-error?reason=${encodeURIComponent(reason)}&tran_id=${encodeURIComponent(tran_id)}`, req.url),
    302
  );
}