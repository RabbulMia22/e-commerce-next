import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generatePaymentSuccessEmail, generatePaymentFailureEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, orderDetails } = body;

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    let emailTemplate;
    
    if (type === "success") {
      const defaultOrderDetails = {
        orderId: "ORD-241003-1234",
        customerName: "John Doe",
        customerEmail: email,
        amount: 2500,
        currency: "BDT",
        products: [
          {
            title: "Premium T-Shirt",
            quantity: 2,
            price: 800
          },
          {
            title: "Designer Jeans",
            quantity: 1,
            price: 900
          }
        ],
        shippingAddress: "123 Main Street, Dhaka, Bangladesh"
      };
      
      emailTemplate = generatePaymentSuccessEmail(orderDetails || defaultOrderDetails);
    } else if (type === "failure") {
      const defaultOrderDetails = {
        orderId: "ORD-241003-1234",
        customerName: "John Doe",
        customerEmail: email,
        amount: 2500,
        currency: "BDT",
        failureReason: "Insufficient funds"
      };
      
      emailTemplate = generatePaymentFailureEmail(orderDetails || defaultOrderDetails);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'success' or 'failure'" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (result.success) {
      return NextResponse.json({
        message: "Email sent successfully",
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Email test endpoint",
    usage: "POST with { type: 'success'|'failure', email: 'test@example.com', orderDetails?: {...} }"
  });
}