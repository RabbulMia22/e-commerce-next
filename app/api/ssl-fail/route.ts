import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PendingOrder from "@/models/pendingOrder";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const text = await req.text();
    const form = new URLSearchParams(text);
    const tran_id = form.get("tran_id") || "";
    const reason = form.get("error") || form.get("status") || "FAILED";
    const amount = form.get("amount") || "";
    
    console.log("❌ Payment failed:", { tran_id, reason, amount });
    
    // Send failure email notification
    try {
      if (tran_id) {
        const pendingOrder = await (PendingOrder as any).findOne({
          $or: [
            { transactionId: tran_id },
            { orderId: tran_id }
          ],
          status: 'pending'
        });
        
        if (pendingOrder) {
          const { sendEmail, generatePaymentFailureEmail } = await import('@/lib/email');
          
          const orderDetails = {
            orderId: pendingOrder.orderId,
            customerName: pendingOrder.shippingAddress?.fullName || 'Customer',
            customerEmail: pendingOrder.userEmail || 'customer@example.com',
            amount: pendingOrder.pricing?.totalAmount || parseFloat(amount) || 0,
            currency: 'BDT',
            failureReason: reason === 'FAILED' ? 'Payment processing failed' : reason
          };

          const emailTemplate = generatePaymentFailureEmail(orderDetails);
          
          await sendEmail({
            to: orderDetails.customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
          
          console.log("✅ Failure email sent to:", orderDetails.customerEmail);
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send failure email:", emailError);
      // Continue processing even if email fails
    }
    
    const url = new URL("/payment-error", req.url);
    if (tran_id) url.searchParams.set("tran_id", tran_id);
    if (reason) url.searchParams.set("reason", reason);
    return NextResponse.redirect(url, 302);
  } catch (e) {
    console.error("❌ SSL Fail handler error:", e);
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