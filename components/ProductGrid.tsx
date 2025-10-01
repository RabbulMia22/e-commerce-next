import React from 'react'
import ProductShowcase from './ProductShowcase'

interface IProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductGridProps {
  products: IProduct[];
}

function ProductGrid({ products }: ProductGridProps) {
  console.log(products)
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-600 max-w-md">
          We're working on adding new products. Please check back soon for exciting deals and offers!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile-Friendly Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product._id} className="flex">
            <ProductShowcase product={product} />
          </div>
        ))}
      </div>
      
      
    </div>
  )
}

export default ProductGrid;