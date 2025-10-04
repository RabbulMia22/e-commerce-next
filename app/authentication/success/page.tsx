'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Handle successful authentication redirect
    if (status === 'authenticated' && session) {
      console.log('Authentication successful, redirecting...')
      
      // Check if user came from a specific page
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl') || '/'
      
      // Decode callback URL if needed
      const decodedCallbackUrl = decodeURIComponent(callbackUrl)
      
      // Validate and redirect
      if (decodedCallbackUrl.startsWith('/')) {
        router.push(decodedCallbackUrl)
      } else {
        router.push('/')
      }
    } else if (status === 'unauthenticated') {
      // Authentication failed, redirect to login
      console.log('Authentication failed, redirecting to login')
      router.push('/authentication/login')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
          <p className="text-gray-600">Please wait while we redirect you.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-indigo-600 rounded-full mx-auto mb-4"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your destination.</p>
      </div>
    </div>
  )
}