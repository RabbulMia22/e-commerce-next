import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Get all query parameters that might contain error info
  const errorDetails = {
    error: searchParams.get('error'),
    error_description: searchParams.get('error_description'),
    error_uri: searchParams.get('error_uri'),
    state: searchParams.get('state'),
    code: searchParams.get('code'),
    timestamp: new Date().toISOString(),
    
    // Environment check
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    
    // Request details
    request: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      url: request.url,
    }
  };

  // If there's an OAuth error, show detailed diagnosis
  if (searchParams.get('error')) {
    return NextResponse.json({
      status: 'OAuth Error Detected',
      ...errorDetails,
      solutions: {
        access_denied: [
          "1. Check if your Google OAuth app is published to production",
          "2. Verify you're not in testing mode with restricted users", 
          "3. Add your email to test users if app is still under review",
          "4. Check if sensitive scopes require verification"
        ],
        invalid_client: [
          "1. Verify GOOGLE_CLIENT_ID matches your OAuth app",
          "2. Check GOOGLE_CLIENT_SECRET is correct",
          "3. Ensure OAuth client is configured for 'Web application'"
        ],
        redirect_uri_mismatch: [
          "1. Add this exact URL to authorized redirect URIs:",
          `   ${errorDetails.request.host}/api/auth/callback/google`,
          "2. Check both HTTP and HTTPS versions if needed"
        ]
      }
    }, { status: 200 });
  }

  // No error - show configuration status
  return NextResponse.json({
    status: 'OAuth Configuration Check',
    message: 'No OAuth errors detected in URL parameters',
    ...errorDetails,
    nextSteps: [
      "1. Test Google OAuth login from your app",
      "2. If you get redirected here with errors, check the solutions above", 
      "3. Visit Google Cloud Console to verify app settings",
      "4. Check that authorized redirect URI includes:",
      `   https://${errorDetails.request.host}/api/auth/callback/google`
    ]
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Method not allowed',
    message: 'This endpoint is for OAuth debugging only' 
  }, { status: 405 });
}