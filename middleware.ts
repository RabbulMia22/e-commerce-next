import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
  
  // Handle Google OAuth callback specifically for mobile devices
  if (url.pathname.includes('/api/auth/callback/google')) {
    console.log('Google OAuth callback detected:', {
      pathname: url.pathname,
      search: url.search,
      isMobile,
      userAgent: userAgent.substring(0, 100)
    })
    
    // Check for OAuth errors
    const error = url.searchParams.get('error')
    if (error) {
      console.log('OAuth error in callback:', error)
      const redirectUrl = url.clone()
      redirectUrl.pathname = '/authentication/error'
      redirectUrl.search = `?error=${error}`
      return NextResponse.redirect(redirectUrl)
    }
    
    // For mobile devices, add special headers and ensure proper handling
    const response = NextResponse.next()
    if (isMobile) {
      response.headers.set('X-Mobile-Device', 'true')
      response.headers.set('X-Mobile-OAuth', 'google')
    }
    
    // Add cache control headers to prevent caching issues
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
  
  // Handle mobile-specific redirects
  if (url.pathname === '/payment-checkout' && !url.searchParams.has('redirect')) {
    // Redirect to the actual checkout page (with typo) to maintain consistency
    url.pathname = '/payemt-checkout'
    url.searchParams.set('redirect', 'true')
    return NextResponse.redirect(url)
  }
  
  // Handle 404 redirects for mobile authentication
  if (isMobile && (url.pathname === '/404' || url.pathname.includes('not-found'))) {
    // If mobile user hits 404 after auth, redirect to home
    const referrer = request.headers.get('referer')
    if (referrer && referrer.includes('/api/auth/')) {
      console.log('Mobile 404 after auth detected, redirecting to home')
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }
  
  // Handle mobile authentication issues
  if (isMobile) {
    // Add mobile-specific headers for better mobile experience
    const response = NextResponse.next()
    response.headers.set('X-Mobile-Device', 'true')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/payment-checkout/:path*',
    '/payemt-checkout/:path*',
    '/cart/:path*',
    '/authentication/:path*',
    '/api/auth/:path*',
    '/404',
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}