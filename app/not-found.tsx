'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()
  const [isOAuthError, setIsOAuthError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if this 404 is related to OAuth
    const referrer = document.referrer
    const userAgent = navigator.userAgent
    
    setIsMobile(/Mobile|Android|iPhone|iPad/i.test(userAgent))
    setIsOAuthError(
      referrer.includes('accounts.google.com') || 
      referrer.includes('/api/auth/') ||
      window.location.search.includes('oauth') ||
      window.location.search.includes('callback')
    )

    // Auto-redirect OAuth errors on mobile after 3 seconds
    if (referrer.includes('accounts.google.com') || referrer.includes('/api/auth/callback')) {
      console.log('OAuth-related 404 detected, auto-redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleTryAgain = () => {
    router.push('/authentication/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOAuthError ? 'Sign In Issue' : 'Page Not Found'}
          </h1>
          
          {isOAuthError ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                There was an issue completing your sign in process. This sometimes happens on mobile devices.
              </p>
              
              {isMobile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Mobile Tip:</strong> Try signing in again or clear your browser cache if the issue persists.
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={handleTryAgain}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Sign In Again
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Home
                </button>
              </div>

              {isMobile && (
                <p className="text-xs text-gray-500 mt-4">
                  Automatically redirecting to home in 3 seconds...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Sorry, we couldn't find the page you're looking for.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
                
                <button
                  onClick={() => router.back()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? {' '}
              <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}