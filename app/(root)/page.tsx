import { Banner } from '@/components'
import AllProducts from '@/components/AllProducts'
import Link from 'next/link'
import React from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Welcome to ShopMate
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your ultimate shopping destination powered by <strong>Next.js</strong>. 
              Discover amazing products, secure payments, and seamless shopping experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/products"
                className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Shop Now →
              </Link>
              <Link
                href="/dashboard"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Admin Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl mb-2">🛍️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Easy Shopping</h3>
                <p className="text-gray-600 text-sm">Browse and purchase products with just a few clicks</p>
              </div>
              <div className="p-6 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-800 mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">SSL encrypted payments with multiple gateway options</p>
              </div>
              <div className="p-6 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-800 mb-2">Mobile Ready</h3>
                <p className="text-gray-600 text-sm">Fully responsive design for all devices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Component */}
      <Banner />
      
      {/* Products Section */}
      <AllProducts />
    </div>
  )
}