import React, { Suspense } from 'react'
import ProductsPagination from '@/components/ProductsPagination'

function ProductsPaginationWrapper() {
  return <ProductsPagination />
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Suspense 
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 font-medium text-lg">Loading products...</p>
              </div>
            </div>
          </div>
        }
      >
        <ProductsPaginationWrapper />
      </Suspense>
    </div>
  )
}