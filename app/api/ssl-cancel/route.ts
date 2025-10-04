import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PendingOrder from "@/models/pendingOrder";
import UserModel from "@/models/user";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    
    // SSLCommerz cancel response data
    const sslData = {
      status: formData.get('status'),
      tran_id: formData.get('tran_id'),
      amount: formData.get('amount'),
      currency: formData.get('currency'),
      store_id: formData.get('store_id'),
      verify_sign: formData.get('verify_sign'),
      verify_key: formData.get('verify_key'),
      verify_sign_sha2: formData.get('verify_sign_sha2'),
    };

    console.log('🚫 Payment cancelled:', sslData);
    
    // Send cancellation email notification
    try {
      const tran_id = sslData.tran_id as string;
      if (tran_id) {
        const pendingOrder = await (PendingOrder as any).findOne({
          $or: [
            { transactionId: tran_id },
            { orderId: tran_id }
          ],
          status: 'pending'
        });
        
        if (pendingOrder) {
          let resolvedEmail =
            (typeof pendingOrder.userEmail === "string" && pendingOrder.userEmail.trim().length > 0
              ? pendingOrder.userEmail.trim()
              : undefined) || undefined;

          if (!resolvedEmail) {
            const dbUser = await UserModel.findById(pendingOrder.userId).select("email");
            if (dbUser?.email) {
              resolvedEmail = dbUser.email;
            }
          }

          if (!resolvedEmail) {
            console.warn(
              `[ssl-cancel] Unable to resolve customer email for pending order ${pendingOrder.orderId}; using fallback placeholder`,
            );
            resolvedEmail = "customer@example.com";
          }
          
          const { sendEmail, generatePaymentFailureEmail } = await import('@/lib/email');
          
          const orderDetails = {
            orderId: pendingOrder.orderId,
            customerName: pendingOrder.shippingAddress?.fullName || 'Customer',
            customerEmail: resolvedEmail,
            amount: pendingOrder.pricing?.totalAmount || parseFloat(sslData.amount as string) || 0,
            currency: 'BDT',
            failureReason: 'Payment was cancelled by user'
          };

          const emailTemplate = generatePaymentFailureEmail(orderDetails);
          
          await sendEmail({
            to: orderDetails.customerEmail,
            subject: emailTemplate.subject.replace('❌ Payment Failed', '🚫 Payment Cancelled'),
            html: emailTemplate.html.replace('Payment Failed', 'Payment Cancelled').replace('Unfortunately, we were unable to process your payment', 'Your payment was cancelled'),
            text: emailTemplate.text?.replace('Payment Failed', 'Payment Cancelled').replace('Unfortunately, we were unable to process your payment', 'Your payment was cancelled')
          });
          
          console.log("✅ Cancellation email sent to:", orderDetails.customerEmail);
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
      // Continue processing even if email fails
    }

    // Get base URL with fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Redirect to cart page since payment was cancelled
    return NextResponse.redirect(new URL('/cart?payment=cancelled', baseUrl));

  } catch (error) {
    console.error('SSL Cancel Error:', error);
    
    // Get base URL with fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    return NextResponse.redirect(new URL('/cart', baseUrl));
  }
}

export async function GET(req: Request) {
  // Handle GET requests (in case user navigates directly)
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  return NextResponse.redirect(new URL('/cart', baseUrl));
}
