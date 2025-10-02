import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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

    console.log('SSL Cancel Data:', sslData);

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';

    // Redirect to cart page since payment was cancelled
    return NextResponse.redirect(new URL('/cart?payment=cancelled', baseUrl));

  } catch (error) {
    console.error('SSL Cancel Error:', error);
    
    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';
    
    return NextResponse.redirect(new URL('/cart', baseUrl));
  }
}

export async function GET(req: Request) {
  // Handle GET requests (in case user navigates directly)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                 process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                 'http://localhost:3000';
  
  return NextResponse.redirect(new URL('/cart', baseUrl));
}
