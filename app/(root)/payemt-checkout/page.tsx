'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import useBasketStore from '@/store/store'
import useAxios from '@/hooks/useAxios'
import { 
  CreditCard, 
  Shield, 
  MapPin, 
  Phone, 
  User, 
  ChevronRight,
  CheckCircle,
  Clock,
  Truck,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react'

// Validation Schema
const checkoutSchema = z.object({
  // Shipping Address
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladesh phone number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  area: z.string().min(2, 'Area is required'),
  district: z.string().min(1, 'District is required'),
  division: z.string().min(1, 'Division is required'),
  postalCode: z.string(),
  country: z.string(),
  addressType: z.enum(['home', 'office']),
  landmark: z.string(),
  
  // Payment
  paymentMethod: z.enum(['sslcommerz', 'cash_on_delivery']),
  
  // Delivery
  deliveryType: z.enum(['standard', 'express']),
  
  // Optional
  notes: z.string()
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

function PaymentCheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { basket: items, getTotalPrice, clearBasket } = useBasketStore()
  const axiosSecure = useAxios()
  
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name || '',
      phone: '',
      address: '',
      area: '',
      district: 'Dhaka',
      division: 'Dhaka',
      postalCode: '',
      country: 'Bangladesh',
      addressType: 'home',
      landmark: '',
      paymentMethod: 'sslcommerz',
      deliveryType: 'standard',
      notes: ''
    },
    mode: 'onChange'
  })

  // Watch form values for calculations
  const watchedValues = watch()
  
  // Calculate totals
  const subtotal = getTotalPrice()
  const deliveryZone = watchedValues.district === 'Dhaka' ? 'inside_dhaka' : 'outside_dhaka'
  const baseShipping = deliveryZone === 'inside_dhaka' ? 60 : 120
  const expressShipping = watchedValues.deliveryType === 'express' ? 50 : 0
  const shippingCost = (subtotal >= 2000 && deliveryZone === 'inside_dhaka') ? expressShipping : baseShipping + expressShipping
  const tax = 0
  const totalAmount = subtotal + shippingCost

  // Bangladesh divisions and districts
  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh']
  const districtsByDivision: Record<string, string[]> = {
    'Dhaka': ['Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Manikganj', 'Munshiganj', 'Faridpur', 'Rajbari'],
    'Chittagong': ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Brahmanbaria', 'Noakhali', 'Feni', 'Lakshmipur', 'Chandpur'],
    'Rajshahi': ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapainawabganj', 'Joypurhat'],
    'Khulna': ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Chuadanga', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Jhenaidah'],
    'Barisal': ['Barisal', 'Patuakhali', 'Pirojpur', 'Barguna', 'Bhola', 'Jhalokati'],
    'Sylhet': ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    'Rangpur': ['Rangpur', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Nilphamari', 'Lalmonirhat', 'Kurigram', 'Gaibandha'],
    'Mymensingh': ['Mymensingh', 'Netrokona', 'Jamalpur', 'Sherpur']
  }

  // Handle session loading and authentication
  useEffect(() => {
    if (status === 'loading') {
      setIsSessionLoading(true)
      return
    }

    if (status === 'unauthenticated') {
      setIsSessionLoading(false)
      router.push('/authentication/login?callbackUrl=/cart')
      return
    }

    if (status === 'authenticated') {
      setIsSessionLoading(false)
      
      // Check if cart is empty
      if (items.length === 0) {
        router.push('/cart')
        return
      }

      // Set user data when session loads
      if (session?.user?.name && !watchedValues.fullName) {
        setValue('fullName', session.user.name)
      }
    }
  }, [status, session, items, router, setValue, watchedValues.fullName])

  // Update districts when division changes
  useEffect(() => {
    if (watchedValues.division) {
      const availableDistricts = districtsByDivision[watchedValues.division] || []
      if (availableDistricts.length > 0 && !availableDistricts.includes(watchedValues.district)) {
        setValue('district', availableDistricts[0])
      }
    }
  }, [watchedValues.division, watchedValues.district, setValue])

  const handleNextStep = async () => {
    setSubmitError('')
    
    if (step === 1) {
      // Validate shipping fields
      const shippingFields = ['fullName', 'phone', 'address', 'area', 'district', 'division'] as const
      const isShippingValid = await trigger(shippingFields)
      
      if (isShippingValid) {
        setStep(2)
      }
    } else if (step === 2) {
      // Validate payment method
      const isPaymentValid = await trigger(['paymentMethod'])
      
      if (isPaymentValid) {
        setStep(3)
      }
    }
  }

 
// Update your onSubmit function with enhanced debugging:
const onSubmit = async (data: CheckoutFormData) => {
  // Prevent double submission
  if (isSubmitting) return
  
  // Check if cart is empty
  if (items.length === 0) {
    setSubmitError('Your cart is empty. Please add items before checkout.')
    router.push('/cart')
    return
  }
  
  setIsSubmitting(true)
  setIsLoading(true)
  setSubmitError('')

  try {
    // If SSLCommerz payment method is selected, redirect to SSL payment
    if (data.paymentMethod === 'sslcommerz') {
      const sslPaymentData = {
        // Basic amount and customer info
        amount: totalAmount,
        customerName: data.fullName,
        customerEmail: session?.user?.email || 'guest@example.com',
        customerPhone: data.phone,
        customerAddress: `${data.address}, ${data.area}, ${data.district}, ${data.division}`,
        
        // Address details
        area: data.area,
        district: data.district,
        division: data.division,
        postalCode: data.postalCode,
        landmark: data.landmark,
        addressType: data.addressType,
        
        // Cart items - CRUCIAL for order creation
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })),
        
        // Pricing breakdown
        subtotal,
        shippingCost,
        tax,
        
        // Delivery info
        deliveryType: data.deliveryType,
        deliveryZone,
        
        // Additional info
        notes: data.notes,
        paymentMethod: 'sslcommerz',
        productName: `Order with ${items.length} items`
      }

      console.log('🔄 Starting SSL payment process...')
      console.log('🔄 Payment data being sent:', sslPaymentData)
      console.log('🔄 Making request to:', '/ssl-payment')

      // Add explicit headers and timeout
      const sslResponse = await axiosSecure.post('/ssl-payment', sslPaymentData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      })
      
      console.log('✅ SSL Response received:', sslResponse.data)
      console.log('✅ Response status:', sslResponse.status)
      
      if (sslResponse.data.success && sslResponse.data.url) {
        console.log('🔄 Payment URL received:', sslResponse.data.url)
        
        // Store transaction ID for reference
        if (sslResponse.data.tran_id) {
          localStorage.setItem('currentTransactionId', sslResponse.data.tran_id)
          console.log('💾 Stored transaction ID:', sslResponse.data.tran_id)
        }
        
        // Add a small delay before redirect to ensure logging
        setTimeout(() => {
          console.log('🚀 Redirecting to SSL gateway...')
          window.location.href = sslResponse.data.url
        }, 500)
        
        return
      } else {
        console.error('❌ SSL Response indicates failure:', sslResponse.data)
        throw new Error(sslResponse.data.error || 'Failed to initialize SSL payment')
      }
    }

    // Rest of your cash on delivery logic...
    // ... existing code ...

  } catch (error: any) {
    console.error('❌ Complete SSL Payment Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url,
      stack: error.stack
    })
    
    // Enhanced error handling
    if (error.response?.status === 500) {
      setSubmitError('Payment gateway is temporarily unavailable. Please try again in a few minutes.')
    } else if (error.message?.includes('timeout')) {
      setSubmitError('Request timed out. Please check your connection and try again.')
    } else if (error.message?.includes('get_emi')) {
      setSubmitError('Payment configuration error detected. Please contact support.')
    } else {
      setSubmitError(error.response?.data?.error || error.message || 'Failed to place order. Please try again.')
    }
  } finally {
    setIsLoading(false)
    setIsSubmitting(false)
  }
}

  // Show loading state while session is loading
  if (isSessionLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Show loading state if not authenticated or cart is empty
  if (!session || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-2 sm:mr-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-8 overflow-x-auto pb-2 -mx-2 sm:-mx-4">
            {[
              { number: 1, title: 'Shipping', icon: Truck },
              { number: 2, title: 'Payment', icon: CreditCard },
              { number: 3, title: 'Review', icon: CheckCircle }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                  step >= stepItem.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <stepItem.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`ml-1 sm:ml-2 font-medium text-xs sm:text-sm ${
                  step >= stepItem.number ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </span>
                {index < 2 && (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mx-1 sm:mx-2 md:mx-4 text-gray-400 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {submitError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center text-black ">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600 " />
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <Controller
                          name="fullName"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                                errors.fullName ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter your full name"
                            />
                          )}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                                errors.phone ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="01XXXXXXXXX"
                            />
                          )}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            rows={3}
                            className={`w-full text-black px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.address ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="House/Flat no, Road, Block, Area"
                          />
                        )}
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area/Thana *
                      </label>
                      <Controller
                        name="area"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className={`w-full text-black px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.area ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Dhanmondi, Gulshan"
                          />
                        )}
                      />
                      {errors.area && (
                        <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                      )}
                    </div>

                    {/* Division */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Division *
                      </label>
                      <Controller
                        name="division"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`w-full text-black px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.division ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            {divisions.map(division => (
                              <option key={division} value={division}>{division}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.division && (
                        <p className="mt-1 text-sm text-red-600">{errors.division.message}</p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <Controller
                        name="district"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`w-full px-3 sm:px-4 text-black py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.district ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            {(districtsByDivision[watchedValues.division] || []).map(district => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <Controller
                        name="postalCode"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1000"
                          />
                        )}
                      />
                    </div>

                    {/* Address Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Type
                      </label>
                      <Controller
                        name="addressType"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-4 sm:space-x-4">
                            {['home', 'office'].map((type) => (
                              <label key={type} className="flex items-center text-black ">
                                <input
                                  type="radio"
                                  value={type}
                                  checked={field.value === type}
                                  onChange={() => field.onChange(type)}
                                  className="mr-2"
                                />
                                <span className="capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Landmark */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark (Optional)
                      </label>
                      <Controller
                        name="landmark"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full text-black  px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Near mosque, school, etc."
                          />
                        )}
                      />
                    </div>

                    {/* Delivery Type */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">
                        Delivery Type
                      </label>
                      <Controller
                        name="deliveryType"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="standard"
                                checked={field.value === 'standard'}
                                onChange={() => field.onChange('standard')}
                                className="mr-2 text-black "
                              />
                              <span className='text-black '>Standard (৳{baseShipping})</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="express"
                                checked={field.value === 'express'}
                                onChange={() => field.onChange('express')}
                                className="mr-2 text-black "
                              />
                              <span className='text-black '>Express (+৳50)</span>
                            </label>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Continue to Payment
                      <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center text-black">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600" />
                    Payment Method
                  </h2>

                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-3 sm:space-y-4">
                        {/* SSLCommerz */}
                        <div className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                          field.value === 'sslcommerz' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`} onClick={() => field.onChange('sslcommerz')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                value="sslcommerz"
                                checked={field.value === 'sslcommerz'}
                                onChange={() => field.onChange('sslcommerz')}
                                className="mr-2 sm:mr-3 text-black "
                              />
                              <div>
                                <h3 className="font-medium text-black text-sm sm:text-base">Online Payment (SSLCommerz)</h3>
                                <p className="text-xs sm:text-sm text-gray-600">Pay with bKash, Nagad, Rocket, Credit/Debit Cards</p>
                              </div>
                            </div>
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          </div>
                          {field.value === 'sslcommerz' && (
                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
                              <div className="bg-pink-500 text-white text-xs p-1 sm:p-2 rounded text-center font-bold">bKash</div>
                              <div className="bg-orange-500 text-white text-xs p-1 sm:p-2 rounded text-center font-bold">Nagad</div>
                              <div className="bg-purple-500 text-white text-xs p-1 sm:p-2 rounded text-center font-bold">Rocket</div>
                              <div className="bg-blue-600 text-white text-xs p-1 sm:p-2 rounded text-center font-bold">VISA</div>
                            </div>
                          )}
                        </div>

                        {/* Cash on Delivery */}
                        <div className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                          field.value === 'cash_on_delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`} onClick={() => field.onChange('cash_on_delivery')}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                value="cash_on_delivery"
                                checked={field.value === 'cash_on_delivery'}
                                onChange={() => field.onChange('cash_on_delivery')}
                                className="mr-2 sm:mr-3 text-black "
                              />
                              <div>
                                <h3 className="font-medium text-black text-sm sm:text-base">Cash on Delivery</h3>
                                <p className="text-xs sm:text-sm text-gray-600">Pay when you receive your order</p>
                              </div>
                            </div>
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  />

                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-4 sm:px-6 text-black  py-2 sm:py-3 bg-blue-600  rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      Review Order
                      <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center text-black">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600" />
                    Review Your Order
                  </h2>

                  {/* Order Items */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-medium mb-3 sm:mb-4 text-black text-sm sm:text-base">Order Items</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {items.map((item) => (
                        <div key={`${item.product._id}-${item.selectedSize}`} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 sm:p-3 p-2 border rounded-lg text-sm">
                          <div className="w-full sm:w-16 h-20 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.images?.[0] || '/placeholder-image.jpg'}
                              alt={item.product.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.product.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">Size: {item.selectedSize}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right sm:text-base">
                            <p className="font-medium">৳{item.product.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-medium mb-2 text-black text-sm sm:text-base">Shipping Address</h3>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-black">{watchedValues.fullName}</p>
                      <p className='text-black'>phone number: {watchedValues.phone}</p>
                      <p className='text-black'>address: {watchedValues.address}</p>
                      <p className='text-black'>location: {watchedValues.area}, {watchedValues.district}, {watchedValues.division}</p>
                      {watchedValues.postalCode && <p className='text-black'>Postal Code: {watchedValues.postalCode}</p>}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-medium mb-2 text-black text-sm sm:text-base">Payment Method</h3>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="capitalize text-black text-sm">
                        {watchedValues.paymentMethod === 'sslcommerz' ? 'Online Payment (SSLCommerz)' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          className="w-full text-black px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Special instructions for delivery..."
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Payment
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !isValid || isSubmitting}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {watchedValues.paymentMethod === 'sslcommerz' ? 'Redirecting to Payment...' : 'Placing Order...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20 sm:top-24">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-black">Order Summary</h3>
                
                <div className="space-y-2 sm:space-y-5 mb-3 sm:mb-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className='text-black'>Subtotal ({items.length} items)</span>
                    <span className='text-black'>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className='text-black'>Shipping ({watchedValues.deliveryType})</span>
                    <span className='text-black'>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        `৳${shippingCost}`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && subtotal < 2000 && deliveryZone === 'inside_dhaka' && (
                    <div className="text-xs sm:text-sm text-blue-600 bg-blue-50 p-2 sm:p-3 rounded-lg">
                      💡 Add ৳{2000 - subtotal} more for free shipping in Dhaka!
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span className='text-black'>Total</span>
                    <span className='text-black'>৳{totalAmount}</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Secure checkout guaranteed</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-2 flex items-center text-black text-sm sm:text-base">
                    <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Delivery Info
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>📍 {deliveryZone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
                    <p>⏱️ {watchedValues.deliveryType === 'express' ? 'Express: ' : 'Standard: '}
                      {deliveryZone === 'inside_dhaka' ? '1-2 days' : '3-5 days'}
                    </p>
                    <p>🚚 {watchedValues.deliveryType} delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
};

export default PaymentCheckoutPage;