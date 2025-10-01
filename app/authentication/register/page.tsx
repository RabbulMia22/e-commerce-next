'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone,
  UserPlus,
  Loader2,
  Chrome,
  Facebook,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import useAxios from '@/hooks/useAxios'

function RegistrationPage() {
  const router = useRouter()
  const axiosInstance = useAxios()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState('')
  const [socialLoading, setSocialLoading] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    if (success) setSuccess('')
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    
    try {
      // Register the user via axios
       await axiosInstance.post(
        '/register',
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        { withCredentials: true }
      )

      // Registration successful
      setSuccess('Account created successfully! Signing you in...')

      // Automatically sign in the user
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        setTimeout(() => {
          router.push('/') // Redirect to home page or dashboard
        }, 1500)
      } else {
        setSuccess('Account created! Please sign in manually.')
        setTimeout(() => {
          router.push('/authentication/login')
        }, 2000)
      }

    } catch (error) {
      console.error('Registration error:', error)
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status
        const respData: any = error.response.data
        if (status === 409) {
          setErrors({ email: 'An account with this email already exists' })
        } else if (respData?.details) {
          const validationErrors: { [key: string]: string } = {}
          respData.details.forEach((errMsg: string) => {
            if (errMsg.includes('email')) validationErrors.email = errMsg
            if (errMsg.includes('password')) validationErrors.password = errMsg
            if (errMsg.includes('firstName')) validationErrors.firstName = errMsg
            if (errMsg.includes('lastName')) validationErrors.lastName = errMsg
          })
          setErrors(validationErrors)
        } else if (respData?.error) {
          setErrors({ general: respData.error })
        } else {
          setErrors({ general: 'Registration failed. Please try again.' })
        }
      } else {
        setErrors({ general: 'Network error. Please check your connection and try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider)
    try {
      await signIn(provider, { 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error(`${provider} sign-in error:`, error)
      setErrors({ general: `${provider} sign-in failed. Please try again.` })
    } finally {
      setSocialLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Us Today!</h1>
          <p className="text-gray-600">Create your account and start shopping</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 text-black"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-gray-50 focus:bg-white disabled:opacity-50 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isLoading}
                    className={`h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50  ${
                      errors.terms ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="accept-terms" className="text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="font-medium text-orange-600 hover:text-orange-500">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-medium text-orange-600 hover:text-orange-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!success}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading || success
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : success ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Account Created!
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
              </div>
            </div>

            {/* Social Registration Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading || socialLoading === 'google'}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5 text-blue-500" />
                )}
                <span className="ml-2">Google</span>
              </button>

              <button 
                onClick={() => handleSocialSignIn('facebook')}
                disabled={isLoading || socialLoading === 'facebook'}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {socialLoading === 'facebook' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Facebook className="w-5 h-5 text-blue-600" />
                )}
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/authentication/login" 
              className="font-semibold text-orange-600 hover:text-orange-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-gray-700 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage