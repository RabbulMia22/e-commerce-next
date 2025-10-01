import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

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

interface ProductShowcaseProps {
  product: IProduct;
}

function ProductShowcase({ product }: ProductShowcaseProps) {
  
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 h-full flex flex-col transform hover:-translate-y-2">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Product Image Container */}
      <div className="relative h-64 sm:h-72 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
        {product.images?.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title || 'Product image'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No Image Available</p>
            </div>
          </div>
        )}

        {/* Stock Status Badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm animate-pulse">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Out of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/20">
          {product.category}
        </div>

        {/* Enhanced Mobile Quick View Button */}
        <Link href={`/product/${product._id}`} className="sm:hidden">
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white p-3 rounded-full shadow-2xl border-2 border-white transition-all duration-300 active:scale-95 z-20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </Link>

        {/* Alternative Mobile Quick View - Always Visible */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:hidden">
          <Link href={`/product/${product._id}`}>
            <button className="w-full bg-white text-gray-900 py-2.5 px-4 rounded-lg font-semibold shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
          </Link>
        </div>

        {/* Desktop Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 items-end justify-center pb-6 hidden sm:flex">
          <Link href={`/product/${product._id}`}>
            <button className="bg-white/95 backdrop-blur-sm text-gray-900 px-8 py-3 rounded-xl font-semibold shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Quick View
            </button>
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="relative p-5 bg-white/90 backdrop-blur-sm flex-1 flex flex-col">
        
        {/* Brand & Rating Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
              {product.brand}
            </span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-500 font-medium">
              #{product.category.toLowerCase()}
            </span>
          </div>
          
          {/* Star Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    index < Math.floor(product.rating)
                      ? 'text-amber-400'
                      : 'text-gray-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium ml-1">
              ({product.rating})
            </span>
          </div>
        </div>
        
        {/* Product Title */}
        <div className="h-12 flex items-start mb-2">
          <h3 className="font-bold text-gray-900 text-sm lg:text-base line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-purple-600 transition-all duration-300 leading-tight">
            {product.title}
          </h3>
        </div>
        
        {/* Description - Always 2 Lines */}
        <div className="h-10 flex items-start mb-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-5 overflow-hidden">
            {product.description}
          </p>
        </div>
        
        {/* Price & Stock Section */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
                ${product.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 font-medium">
                Stock: {product.stock}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                product.stock > 10 ? 'bg-green-400' : 
                product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>
          
          {/* Wishlist Button */}
          <button className="w-12 h-12 bg-gradient-to-r from-orange-100 to-purple-100 hover:from-orange-200 hover:to-purple-200 text-gray-600 hover:text-red-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group/btn">
            <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/5 via-purple-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  )
}

export default ProductShowcase;