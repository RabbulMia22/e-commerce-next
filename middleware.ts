import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Handle mobile-specific redirects
  if (url.pathname === '/payment-checkout' && !url.searchParams.has('redirect')) {
    // Redirect to the actual checkout page (with typo) to maintain consistency
    url.pathname = '/payemt-checkout'
    url.searchParams.set('redirect', 'true')
    return NextResponse.redirect(url)
  }
  
  // Handle mobile authentication issues
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
  
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
    '/authentication/:path*'
  ]
}