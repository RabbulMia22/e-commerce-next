'use client'

import React, { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock, 
  Download,
  Home,
  ShoppingBag,
  Phone,
  Mail
} from 'lucide-react'
import { useHydratedStore } from '@/hooks/useHydratedStore'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const clearedRef = useRef(false)

  const orderNumber = searchParams.get('orderNumber')
  const tranId = searchParams.get('tran_id')
  const amount = searchParams.get('amount')

  // Debug: Log all URL parameters
  console.log("🔄 Payment success page loaded with params:", {
    orderNumber,
    tranId,
    amount,
    allParams: Object.fromEntries(searchParams.entries())
  })

  const { clearBasket, getItems, hydrated } = useHydratedStore()

  // Debug: Log hydration status
  useEffect(() => {
    console.log("🔄 Store hydration status:", hydrated)
    if (hydrated) {
      const currentItems = getItems()
      console.log("🔄 Current basket items after hydration:", currentItems.length)
    }
  }, [hydrated, getItems])

  // Fetch order details if your API supports it (adjust endpoints to your backend)
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        let res: Response | undefined
        if (orderNumber) {
          // Example endpoint: /api/orders/[orderNumber]
          res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, { credentials: 'include' })
        } else if (tranId) {
          // Example endpoint: /api/orders/by-tran?tran_id=...
          res = await fetch(`/api/orders/by-tran?tran_id=${encodeURIComponent(tranId)}`, { credentials: 'include' })
        }

        if (res && res.ok) {
          const json = await res.json().catch(() => null)
          if (!cancelled) {
            setOrderDetails(json?.order || json || null)
          }
        }
      } catch {
        // ignore, show generic success UI
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [orderNumber, tranId])

  // Clear basket IMMEDIATELY when payment success page loads (only after hydration)
  useEffect(() => {
    if (clearedRef.current || !hydrated) return
    
    console.log("🔄 Checking for payment success indicators...")
    
    // Clear basket if we have any payment success indicators OR if this is the payment-success page
    const hasPaymentIndicators = orderNumber || tranId || amount
    const isPaymentSuccessPage = window.location.pathname === '/payment-success'
    
    if (hasPaymentIndicators || isPaymentSuccessPage) {
      console.log("🔄 Payment success detected, clearing basket...", {
        orderNumber,
        tranId,
        amount,
        hydrated,
        hasPaymentIndicators,
        isPaymentSuccessPage,
        currentPath: window.location.pathname
      })
      
      // Check basket items before clearing
      const itemsBeforeClearing = getItems()
      console.log("🔄 Basket items before clearing:", itemsBeforeClearing.length, itemsBeforeClearing)
      
      try {
        clearBasket()
        localStorage.removeItem('currentTransactionId')
        
        // Small delay to ensure the store updates
        setTimeout(() => {
          const itemsAfterClearing = getItems()
          console.log("🔄 Basket items after clearing:", itemsAfterClearing.length, itemsAfterClearing)
          
          if (itemsAfterClearing.length === 0) {
            console.log("✅ Basket cleared successfully")
          } else {
            console.error("❌ Basket clearing failed - items still present")
            // Force clear again
            console.log("🔄 Attempting force clear...")
            clearBasket()
            
            // Check again after force clear
            setTimeout(() => {
              const finalCheck = getItems()
              console.log("🔄 Final basket check:", finalCheck.length)
            }, 50)
          }
        }, 100)
        
      } catch (error) {
        console.error("❌ Error clearing basket:", error)
      }
      clearedRef.current = true
    } else {
      console.log("🔄 No payment success indicators found")
    }
  }, [orderNumber, tranId, amount, clearBasket, getItems, hydrated])

  // Also clear basket when loading completes (backup mechanism)
  useEffect(() => {
    if (clearedRef.current || loading) return
    
    if (orderNumber || tranId || amount) {
      try {
        clearBasket()
        localStorage.removeItem('currentTransactionId')
        console.log("✅ Backup basket clear executed")
      } catch {
        // ignore
      }
      clearedRef.current = true
    }
  }, [loading, orderNumber, tranId, amount, clearBasket])

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT'
    }).format(isNaN(numPrice) ? 0 : numPrice)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your order. Your payment has been processed successfully.
          </p>
          {(orderNumber || orderDetails?.orderNumber) && (
            <p className="text-lg text-gray-700 font-medium">
              Order Number: <span className="text-green-600">{orderNumber || orderDetails?.orderNumber}</span>
            </p>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Package className="w-6 h-6 mr-3 text-blue-600" />
            Order Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">{tranId || orderDetails?.paymentInfo?.tran_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(amount || orderDetails?.totalAmount || '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">SSLCommerz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-green-600">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Truck className="w-5 h-5 mr-2" />
                  <span>{orderDetails?.shippingAddress?.deliveryType === 'express' ? 'Express Delivery' : 'Standard Delivery'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>
                    Estimated Delivery: {orderDetails?.shippingAddress?.deliveryType === 'express' ? '1-2' : '3-5'} business days
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  You will receive a confirmation email with tracking details shortly.
                </div>
              </div>
            </div>
          </div>

          {/* Optional: Show brief items list if available */}
          {Array.isArray(orderDetails?.items) && orderDetails.items.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
              <div className="space-y-2">
                {orderDetails.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {it.product?.title || it.productTitle || it.product} x {it.quantity}
                      {it.selectedSize ? ` (${it.selectedSize})` : ''}
                    </span>
                    <span>
                      {it.price ? formatPrice(it.price * it.quantity) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</div>
              <span>You will receive an order confirmation email</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</div>
              <span>We'll prepare your order for shipment</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">3</div>
              <span>You'll receive tracking information via SMS/Email</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">4</div>
              <span>Your order will be delivered to your address</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Call Us</p>
                <p className="text-gray-600">+880 1234 567890</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Email Us</p>
                <p className="text-gray-600">support@yourstore.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          
          {/* Manual Clear Cart Button for Testing */}
          <button
            onClick={() => {
              console.log("🔄 Manual clear button clicked")
              const itemsBefore = getItems()
              console.log("🔄 Items before manual clear:", itemsBefore.length)
              clearBasket()
              const itemsAfter = getItems()
              console.log("🔄 Items after manual clear:", itemsAfter.length)
            }}
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Cart (Test)
          </button>
          
          <Link
            href="/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            View My Orders
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Print Receipt
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            If you have any questions about your order, please don't hesitate to contact our customer service team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}