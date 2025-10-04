import { NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { getSessionSafely } from "@/lib/session";
import dbConnect from "@/lib/db";
import PendingOrder from "@/models/pendingOrder";

const storeId = process.env.SSLCOMMERZ_STORE_ID ?? "";
const storePassword = process.env.SSLCOMMERZ_STORE_PASS ?? "";
const isLive = process.env.SSLCOMMERZ_MODE === "live";

const SSL_BASE_URL = isLive
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

const SSL_PAYMENT_URL = `${SSL_BASE_URL}/gwprocess/v4/api.php`;

const paymentInitSchema = z.object({
  amount: z.coerce.number().positive(),
  subtotal: z.coerce.number().nonnegative().optional(),
  shippingCost: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
  customerName: z.string().trim().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().trim().email().optional(),
  customerPhone: z.string().trim().min(1, { message: "Customer phone is required" }),
  customerAddress: z.string().trim().optional(),
  area: z.string().trim().optional(),
  district: z.string().trim().optional(),
  division: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  addressType: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  deliveryZone: z.string().trim().optional(),
  deliveryType: z.string().trim().optional(),
  productName: z.string().trim().optional(),
  paymentMethod: z.string().trim().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        product: z.union([
          z.string().min(1),
          z
            .object({ _id: z.string().min(1).optional(), id: z.string().optional() })
            .catchall(z.any()),
        ]),
        quantity: z.coerce.number().int().positive(),
        selectedSize: z.string().trim().optional().nullable(),
      }),
    )
    .default([]),
});

type PaymentInitPayload = z.infer<typeof paymentInitSchema>;

type SessionUser = {
  id?: string;
  _id?: string;
  email?: string | null;
  name?: string | null;
};

type NormalizedItem = {
  product: string;
  quantity: number;
  selectedSize?: string;
};

const sanitizePhone = (phone?: string) =>
  phone ? phone.replace(/[^\d+]/g, "") : "";

const normalizeItems = (items: PaymentInitPayload["items"]): NormalizedItem[] =>
  items.map((item) => {
    const productId =
      typeof item.product === "string"
        ? item.product
        : item.product?._id ?? item.product?.id ?? String(item.product);

    return {
      product: productId,
      quantity: item.quantity,
      selectedSize: item.selectedSize?.trim() || "default",
    };
  });

export async function POST(req: Request) {
  try {
    if (!storeId || !storePassword) {
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!baseUrl) {
      return NextResponse.json(
        { success: false, error: "Base URL is not configured" },
        { status: 500 },
      );
    }

    try {
      new URL(baseUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid NEXT_PUBLIC_BASE_URL/VERCEL_URL" },
        { status: 500 },
      );
    }

  const session = await getSessionSafely();
    const sessionUser = session?.user as SessionUser | undefined;
    const userId = sessionUser?.id ?? sessionUser?._id ?? null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Active user session not found" },
        { status: 401 },
      );
    }

    const rawBody = await req.json();
    const parsed = paymentInitSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const guaranteedEmail = data.customerEmail ?? sessionUser?.email ?? "guest@example.com";

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    const pendingOrderId = `PO${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

    await dbConnect();

    const normalizedItems = normalizeItems(data.items);

    await PendingOrder.create({
      orderId: pendingOrderId,
      userId,
      userEmail: guaranteedEmail,
      items: normalizedItems,
      shippingAddress: {
        fullName: data.customerName,
        phone: data.customerPhone,
        address:
          data.customerAddress || `${data.area || "Dhaka"}, ${data.district || "Dhaka"}`,
        area: data.area || "Dhaka",
        district: data.district || "Dhaka",
        division: data.division || "Dhaka",
        postalCode: data.postalCode,
        addressType: data.addressType || "home",
        landmark: data.landmark,
        deliveryZone: data.deliveryZone || "standard",
        deliveryType: data.deliveryType || "standard",
      },
      pricing: {
        subtotal: data.subtotal ?? data.amount,
        shippingCost: data.shippingCost ?? 0,
        tax: data.tax ?? 0,
        totalAmount: data.amount,
      },
      deliveryType: data.deliveryType || "standard",
      notes: data.notes?.trim(),
      transactionId,
      status: "pending",
    });

    const valueAMeta = {
      orderId: pendingOrderId,
      tran_id: transactionId,
    } satisfies Record<string, string>;

    const paymentRequestData: Record<string, string> = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: data.amount.toFixed(2),
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${baseUrl}/api/ssl-success`,
      fail_url: `${baseUrl}/api/ssl-fail`,
      cancel_url: `${baseUrl}/api/ssl-cancel`,
      ipn_url: `${baseUrl}/api/ssl-ipn`,
      product_name: data.productName || `Order with ${normalizedItems.length || 1} items`,
      product_category: "E-commerce",
      product_profile: "general",
      cus_name: data.customerName.trim(),
      cus_email: guaranteedEmail,
      cus_add1:
        data.customerAddress || `${data.area || "Dhaka"}, ${data.district || "Dhaka"}`,
      cus_add2: data.landmark || "",
      cus_city: data.district || "Dhaka",
      cus_state: data.division || "Dhaka",
      cus_postcode: data.postalCode || "1000",
      cus_country: "Bangladesh",
      cus_phone: sanitizePhone(data.customerPhone),
      cus_fax: "",
      ship_name: data.customerName.trim(),
      ship_add1:
        data.customerAddress || `${data.area || "Dhaka"}, ${data.district || "Dhaka"}`,
      ship_add2: data.landmark || "",
      ship_city: data.district || "Dhaka",
      ship_state: data.division || "Dhaka",
      ship_postcode: data.postalCode || "1000",
      ship_country: "Bangladesh",
      shipping_method: "YES",
      num_of_item: String(normalizedItems.length || 1),
      value_a: JSON.stringify(valueAMeta),
      value_b: "ecommerce_order",
      value_c: data.paymentMethod || "sslcommerz",
      value_d: guaranteedEmail,
      emi_option: "0",
    };

    const response = await axios.post(
      SSL_PAYMENT_URL,
      new URLSearchParams(paymentRequestData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        timeout: 30000,
        validateStatus: () => true,
      },
    );

    const responseData = response.data as {
      status?: string;
      GatewayPageURL?: string;
      sessionkey?: string;
      failedreason?: string;
      message?: string;
    };

    if (response.status === 200 && responseData?.status === "SUCCESS" && responseData.GatewayPageURL) {
      return NextResponse.json({
        success: true,
        url: responseData.GatewayPageURL,
        tran_id: transactionId,
        sessionkey: responseData.sessionkey,
      });
    }

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
      { status: 400 },
    );
  } catch (error) {
    const isAxiosError = axios.isAxiosError(error);
    const message = isAxiosError
      ? error.response?.data?.message ?? error.message
      : error instanceof Error
      ? error.message
      : "Payment initialization failed";

    console.error(
      "SSLCommerz payment error:",
      isAxiosError ? error.response?.data ?? error.message : error,
    );

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: isAxiosError ? error.response?.data : undefined,
      },
      { status: 500 },
    );
  }
}