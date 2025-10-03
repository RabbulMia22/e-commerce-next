'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw,
  CreditCard,
  ShoppingCart,
  Home
} from 'lucide-react'

interface ErrorInfo {
  type: 'failed' | 'cancelled' | 'processing_failed' | 'unknown'
  title: string
  message: string
  icon: React.ComponentType<any>
  color: string
}

const errorTypes: Record<string, ErrorInfo> = {
  payment_failed: {
    type: 'failed',
    title: 'Payment Failed',
    message: 'Your payment could not be processed. This might be due to insufficient funds, network issues, or bank restrictions.',
    icon: XCircle,
    color: 'text-red-500'
  },
  payment_cancelled: {
    type: 'cancelled',
    title: 'Payment Cancelled',
    message: 'You cancelled the payment process. Your order has not been placed.',
    icon: AlertTriangle,
    color: 'text-orange-500'
  },
  processing_failed: {
    type: 'processing_failed',
    title: 'Processing Error',
    message: 'There was an error processing your payment. Please try again or contact support if the problem persists.',
    icon: AlertTriangle,
    color: 'text-red-500'
  }
}

function PaymentErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRetrying, setIsRetrying] = useState(false)
  
  const error = searchParams.get('error') || 'unknown'
  const tranId = searchParams.get('tran_id')
  const status = searchParams.get('status')
  
  const errorInfo = errorTypes[error] || {
    type: 'unknown',
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    icon: XCircle,
    color: 'text-red-500'
  }

  const IconComponent = errorInfo.icon

  useEffect(() => {
    // Clear any stored transaction ID
    if (tranId) {
      localStorage.removeItem('currentTransactionId')
    }
  }, [tranId])

  const handleRetryPayment = async () => {
    setIsRetrying(true)
    
    // Add a small delay for UX
    setTimeout(() => {
      router.push('/payemt-checkout')
    }, 1000)
  }

  const handleBackToCart = () => {
    router.push('/cart')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 ${errorInfo.color} mb-4`}>
            <IconComponent className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {errorInfo.message}
          </p>
        </div>

        {/* Transaction Details */}
        {tranId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Details</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-medium">Transaction ID:</span> {tranId}</p>
              {status && <p><span className="font-medium">Status:</span> {status}</p>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action */}
          {errorInfo.type === 'cancelled' || errorInfo.type === 'failed' ? (
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5 mr-2" />
              )}
              {isRetrying ? 'Redirecting...' : 'Try Payment Again'}
            </button>
          ) : (
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              {isRetrying ? 'Redirecting...' : 'Retry'}
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleBackToCart}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Back to Cart
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Need help with your payment?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link 
              href="/contact" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Contact Support
            </Link>
            <Link 
              href="/help/payment-issues" 
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Payment Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentErrorContent />
    </Suspense>
  )
}