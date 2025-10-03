'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  useEffect(() => {
    // Log error for debugging
    console.log('Auth Error:', error)
    
    // Auto redirect after 5 seconds for mobile users
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (isMobile) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [error, router])

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There was a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access was denied. Please try again.'
      case 'Verification':
        return 'The verification link is invalid or has expired.'
      case 'OAuthSignin':
        return 'Error occurred during OAuth signin.'
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account.'
      case 'EmailCreateAccount':
        return 'Could not create email account.'
      case 'Callback':
        return 'Error occurred during callback.'
      case 'OAuthAccountNotLinked':
        return 'OAuth account is not linked to any user.'
      case 'EmailSignin':
        return 'Check your email address.'
      case 'CredentialsSignin':
        return 'Invalid credentials provided.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/authentication/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Home
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}