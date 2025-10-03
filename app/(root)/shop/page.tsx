'use client'
import React from 'react'
import AllProducts from '@/components/AllProducts'

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Shop All Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of premium products
          </p>
        </div>
        <AllProducts />
      </div>
    </div>
  )
}
