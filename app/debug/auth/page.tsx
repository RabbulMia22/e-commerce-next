'use client'

import { useEffect, useState } from 'react'

export default function AuthDebug() {
  const [info, setInfo] = useState<any>({})

  useEffect(() => {
    const debugInfo = {
      userAgent: navigator.userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
      currentUrl: window.location.href,
      origin: window.location.origin,
      cookies: document.cookie,
      timestamp: new Date().toISOString()
    }
    setInfo(debugInfo)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Auth Debug Information</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Device Information</h2>
            <p><strong>User Agent:</strong> {info.userAgent}</p>
            <p><strong>Is Mobile:</strong> {info.isMobile ? 'Yes' : 'No'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">URL Information</h2>
            <p><strong>Current URL:</strong> {info.currentUrl}</p>
            <p><strong>Origin:</strong> {info.origin}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Browser State</h2>
            <p><strong>Cookies:</strong> {info.cookies || 'None'}</p>
            <p><strong>Timestamp:</strong> {info.timestamp}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Troubleshooting Steps</h2>
            <ol className="list-decimal ml-6 space-y-2">
              <li>Clear browser cache and cookies</li>
              <li>Try in incognito/private mode</li>
              <li>Check Google OAuth console redirect URIs</li>
              <li>Verify NEXTAUTH_URL environment variable</li>
              <li>Test on desktop browser first</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}