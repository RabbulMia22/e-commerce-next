import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import connectDB from "@/lib/db";
import PendingOrder from "@/models/pendingOrder";

const store_id = process.env.SSLCOMMERZ_STORE_ID as string;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS as string;
const is_live = false;

const SSL_BASE_URL = is_live
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const SSL_PAYMENT_URL = `${SSL_BASE_URL}/gwprocess/v4/api.php`;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!store_id || !store_passwd) {
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    try {
      new URL(baseUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or missing NEXT_PUBLIC_BASE_URL/VERCEL_URL" },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    type SessionUser = { id?: string; _id?: string; email?: string | null; name?: string | null };
    const sessionUser = session?.user as SessionUser | undefined;
    const userId = sessionUser?.id ?? sessionUser?._id ?? null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Active user session not found" },
        { status: 401 }
      );
    }

    if (!data.amount || !data.customerName || !data.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required payment information" },
        { status: 400 }
      );
    }

    const guaranteedEmail =
      (data.customerEmail && String(data.customerEmail)) ||
      (sessionUser?.email && String(sessionUser.email)) ||
      "guest@example.com";

    const tran_id = `TXN${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

    const normalizedItems = (data.items || []).map((item: any) => ({
      product: item.product?._id || item.product,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
    }));

    // Connect to database and create pending order
    await connectDB();
    
    const pendingOrderId = `PO${Date.now()}${Math.random().toString(36).slice(2, 5)}`;
    
    const pendingOrder = new PendingOrder({
      orderId: pendingOrderId,
      userId,
      userEmail: guaranteedEmail,
      items: normalizedItems,
      shippingAddress: {
        fullName: data.customerName,
        phone: data.customerPhone,
        address: data.customerAddress,
        area: data.area,
        district: data.district,
        division: data.division,
        postalCode: data.postalCode,
        addressType: data.addressType,
        landmark: data.landmark,
        deliveryZone: data.deliveryZone,
        deliveryType: data.deliveryType,
      },
      pricing: {
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        tax: data.tax,
        totalAmount: data.amount,
      },
      deliveryType: data.deliveryType,
      notes: data.notes,
      transactionId: tran_id,
      status: 'pending'
    });

    await pendingOrder.save();
    console.log("🔄 Created pending order:", pendingOrderId);

    // Only pass the pending order ID in value_a (very small payload)
    const valueAMeta = {
      orderId: pendingOrderId,
      tran_id: tran_id
    };

    const sslData: Record<string, string> = {
      store_id,
      store_passwd,
      total_amount: parseFloat(data.amount).toFixed(2),
      currency: "BDT",
      tran_id,
      success_url: `${baseUrl}/api/ssl-success`,
      fail_url: `${baseUrl}/api/ssl-fail`,
      cancel_url: `${baseUrl}/api/ssl-cancel`,
      ipn_url: `${baseUrl}/api/ssl-ipn`,
      product_name: data.productName || `Order with ${normalizedItems.length || 1} items`,
      product_category: "E-commerce",
      product_profile: "general",
      cus_name: String(data.customerName || "").trim(),
      cus_email: guaranteedEmail,
      cus_add1: data.customerAddress || `${data.area || "Dhaka"}, ${data.district || "Dhaka"}`,
      cus_add2: data.landmark || "",
      cus_city: data.district || "Dhaka",
      cus_state: data.division || "Dhaka",
      cus_postcode: data.postalCode || "1000",
      cus_country: "Bangladesh",
      cus_phone: String(data.customerPhone || "").replace(/[^\d+]/g, ""),
      cus_fax: "",
      ship_name: String(data.customerName || "").trim(),
      ship_add1: data.customerAddress || `${data.area || "Dhaka"}, ${data.district || "Dhaka"}`,
      ship_add2: data.landmark || "",
      ship_city: data.district || "Dhaka",
      ship_state: data.division || "Dhaka",
      ship_postcode: data.postalCode || "1000",
      ship_country: "Bangladesh",
      shipping_method: "YES",
      num_of_item: String(normalizedItems.length || 1),
      value_a: JSON.stringify(valueAMeta), // no manual encoding
      value_b: "ecommerce_order",
      value_c: data.paymentMethod || "sslcommerz",
      value_d: guaranteedEmail,
      emi_option: "0",
    };

    const response = await axios.post(
      SSL_PAYMENT_URL,
      new URLSearchParams(sslData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: () => true,
      }
    );

    const responseData = response.data;

    if (response.status === 200 && responseData?.status === "SUCCESS" && responseData.GatewayPageURL) {
      return NextResponse.json({
        success: true,
        url: responseData.GatewayPageURL,
        tran_id,
        sessionkey: responseData.sessionkey,
      });
    }

    // Log and return a clearer reason on init failure
    console.error("SSL init failed", { httpStatus: response.status, responseData });
    return NextResponse.json(
      {
        success: false,
        error:
          responseData?.failedreason ||
          responseData?.message ||
          `Payment initialization failed (HTTP ${response.status})`,
        details: responseData,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("SSLCommerz payment error:", error?.response?.data || error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Payment initialization failed",
        details: error?.response?.data,
      },
      { status: 500 }
    );
  }
}