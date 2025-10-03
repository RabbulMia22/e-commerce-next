// app/api/sslcommerz/notify/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/order";
import User from "@/models/user";

// Define IPN/Success data type
interface SSLData {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_issuer?: string;
  card_brand?: string;
  card_issuer_country?: string;
  card_issuer_country_code?: string;
  verify_sign?: string;
  verify_key?: string;
  verify_sign_sha2?: string;
  currency_type?: string;
  currency_amount?: string;
  currency_rate?: string;
  base_fair?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  risk_level?: string;
  risk_title?: string;
}

// Type for SSL validation response
interface SSLValidationResponse {
  status: string;
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  currency?: string;
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const sslData: SSLData = {
      status: formData.get("status") as string,
      tran_id: formData.get("tran_id") as string,
      val_id: formData.get("val_id") as string,
      amount: formData.get("amount") as string,
      store_amount: formData.get("store_amount") as string,
      currency: formData.get("currency") as string,
      bank_tran_id: formData.get("bank_tran_id") as string,
      card_type: formData.get("card_type") as string,
      card_no: formData.get("card_no") as string,
      card_issuer: formData.get("card_issuer") as string,
      card_brand: formData.get("card_brand") as string,
      card_issuer_country: formData.get("card_issuer_country") as string,
      card_issuer_country_code: formData.get(
        "card_issuer_country_code"
      ) as string,
      verify_sign: formData.get("verify_sign") as string,
      verify_key: formData.get("verify_key") as string,
      verify_sign_sha2: formData.get("verify_sign_sha2") as string,
      currency_type: formData.get("currency_type") as string,
      currency_amount: formData.get("currency_amount") as string,
      currency_rate: formData.get("currency_rate") as string,
      base_fair: formData.get("base_fair") as string,
      value_a: formData.get("value_a") as string,
      value_b: formData.get("value_b") as string,
      value_c: formData.get("value_c") as string,
      value_d: formData.get("value_d") as string,
      risk_level: formData.get("risk_level") as string,
      risk_title: formData.get("risk_title") as string,
    };

    console.log("SSL IPN Data:", {
      ...sslData,
      card_no: sslData.card_no
        ? "****" + sslData.card_no.slice(-4)
        : null,
    });

    // Validate transaction with SSLCommerz
    const store_id = process.env.SSLCOMMERZ_STORE_ID!;
    const store_passwd = process.env.SSLCOMMERZ_STORE_PASS!;
    const validationUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${sslData.val_id}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;

    const validateResponse = await fetch(validationUrl);
    const validateData: SSLValidationResponse =
      await validateResponse.json();

    if (
      validateData.status !== "VALID" &&
      validateData.status !== "VALIDATED"
    ) {
      console.error(
        "SSL Validation failed for tran_id:",
        sslData.tran_id
      );
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Transaction validation failed",
        },
        { status: 400 }
      );
    }

    // Connect to DB
    await dbConnect();

    // Find user by email stored in value_a
    const userEmail = sslData.value_a;
    const user = userEmail ? await (User as any).findOne({ email: userEmail }) : null;

    if (!user) {
      console.error("User not found for SSL payment:", userEmail);
      return NextResponse.json(
        { status: "ERROR", message: "User not found" },
        { status: 404 }
      );
    }

    // Create order
    const orderData = {
      user: user._id,
      items: [], // Add actual cart items if you have them
      shippingAddress: {
        fullName: user.name || "Customer",
        phone: user.phone || "",
        address: "Address will be updated",
        area: "Dhaka",
        district: "Dhaka",
        division: "Dhaka",
        postalCode: "1000",
        country: "Bangladesh",
        addressType: "home" as const,
        landmark: "",
        deliveryZone: "inside_dhaka" as const,
        deliveryType: "standard" as const,
      },
      paymentInfo: {
        method: "sslcommerz" as const,
        sslTransactionId: sslData.tran_id,
        sslSessionId: sslData.val_id,
        bankTransactionId: sslData.bank_tran_id,
        cardType: sslData.card_type,
        paymentGateway: "SSLCommerz",
        paymentStatus: "completed" as const,
        paidAt: new Date(),
        amount: parseFloat(sslData.amount || "0"),
        currency: "BDT",
      },
      subtotal: parseFloat(sslData.store_amount || sslData.amount || "0"),
      shippingCost: 0,
      tax: 0,
      totalAmount: parseFloat(sslData.amount || "0"),
      orderStatus: "confirmed" as const,
      deliveryType: "standard" as const,
      deliveryZone: "inside_dhaka" as const,
      notes: `SSL Payment - Transaction ID: ${sslData.tran_id}`,
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log("Order created successfully:", newOrder.orderNumber);

    return NextResponse.json({
      status: "OK",
      message: "Payment successful and order created",
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error("SSL IPN Error:", error);
    return NextResponse.json(
      { status: "ERROR", message: "IPN processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "SSL IPN endpoint is active",
  });
}
