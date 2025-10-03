'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import useBasketStore from '@/store/store'
import { toast } from 'react-hot-toast'
import { FiEye, FiStar } from 'react-icons/fi'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { Reviews } from '@/components'

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

async function fetchProduct(id: string) {
  const res = await fetch(`/api/products/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch product')
  }
  return res.json()
}

interface ProductDetailsProps {
  id: string
}

export default function ProductDetails({ id }: ProductDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Get cart functions from Zustand store
  const { addToBasket, getItemCount } = useBasketStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  })

  // Fetch review statistics for dynamic rating
  const { data: reviewStats } = useQuery({
    queryKey: ['reviewStats', id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?productId=${id}&limit=1`)
      if (!res.ok) return { averageRating: 0, totalReviews: 0 }
      return res.json()
    },
    enabled: !!id,
  })

  const handleQuantityIncrease = () => {
    if (data?.data && quantity < data.data.stock) {
      setQuantity(prev => prev + 1)
    }
  }

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && data?.data && value <= data.data.stock) {
      setQuantity(value)
    }
  }

  // Add to cart handler with size validation
  const handleAddToCart = async () => {
    if (!data?.data) return

    // Check if size is selected
    if (!selectedSize) {
      toast.error('Please select a size before adding to cart', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
        },
        icon: '⚠️',
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const product = data.data

      // Add items to cart one by one (since your store adds 1 at a time)
      for (let i = 0; i < quantity; i++) {
        addToBasket(product, selectedSize)
      }

      // Show success message
      toast.success(`Added ${quantity} ${product.title} (Size: ${selectedSize}) to cart!`, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: 'white',
        },
        icon: '🛒',
      })

      // Reset quantity to 1 after adding
      setQuantity(1)

    } catch (error) {
      toast.error('Failed to add item to cart', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
        },
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Get current item count in cart for this product and size
  const currentItemCount = data?.data ? getItemCount(data.data._id, selectedSize) : 0

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl"></div>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 sm:h-12 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data || !data.success) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const product: IProduct = data.data
  const totalPrice = product.price * quantity

  // Available sizes (you can customize this based on your product data)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8 px-1">
        <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-orange-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Image Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden">
            {product.images?.length > 0 ? (
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover hover:scale-110 transition-transform"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Category & Brand */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs sm:text-sm font-medium rounded-full">
              {product.category}
            </span>
            <span className="text-orange-600 font-semibold text-sm sm:text-base">{product.brand}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>

          {/* Dynamic Rating from User Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const dynamicRating = reviewStats?.averageRating || 0
                const isFilled = i < Math.round(dynamicRating)

                return (
                  <div key={i} className="relative">
                    {isFilled ? (
                      <AiFillStar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#FFD700' }} />
                    ) : (
                      <AiOutlineStar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#FFD700' }} />
                    )}
                  </div>
                )
              })}
            </div>
            <span className="text-gray-600 text-sm sm:text-base">
              ({reviewStats?.averageRating?.toFixed(1) || '0.0'} out of 5)
            </span>

            <Link href={`/review?productId=${product._id}`}>
              <button className="text-gray-500 hover:text-gray-700 flex justify-center items-center gap-1 text-xl sm:text-base cursor-pointer">
                <FiEye className="w-4 h-4" />
                Review
              </button>
            </Link>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-green-400' :
                product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            <span className={`font-medium text-sm sm:text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-500'
              }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Size Selector */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Size</h3>
              <span className="text-red-500 text-sm">*</span>
              {!selectedSize && (
                <span className="text-red-500 text-xs sm:text-sm">(Please select a size)</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${selectedSize === size
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSize && currentItemCount > 0 && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-200">
                💡 {currentItemCount} item(s) of size {selectedSize} already in cart
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quantity</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white w-fit">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    className={`p-2 sm:p-3 transition-colors ${quantity <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-12 sm:w-16 px-2 sm:px-3 py-2 sm:py-3 text-center border-0 focus:outline-none focus:ring-0 bg-white text-sm sm:text-base"
                  />

                  <button
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock}
                    className={`p-2 sm:p-3 transition-colors ${quantity >= product.stock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <span className="text-xs sm:text-sm text-gray-500">
                  {quantity >= product.stock ? 'Maximum quantity' : `${product.stock - quantity} remaining`}
                </span>
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="space-y-2 sm:space-y-3 bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-orange-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Price</h3>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600">
                ${totalPrice.toFixed(2)}
              </div>
              {quantity > 1 && (
                <div className="text-sm sm:text-lg text-gray-600">
                  ${product.price.toFixed(2)} × {quantity}
                </div>
              )}
            </div>
            {quantity > 1 && (
              <div className="text-xs sm:text-sm text-gray-500">
                Unit price: ${product.price.toFixed(2)}
              </div>
            )}
            {quantity > 1 && (
              <div className="text-xs sm:text-sm text-green-600 font-medium">
                You're ordering {quantity} items
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Product Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">Brand:</span>
                <span className="ml-2 font-medium">{product.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Stock:</span>
                <span className="ml-2 font-medium">{product.stock} units</span>
              </div>
              <div>
                <span className="text-gray-600">Rating:</span>
                <span className="ml-2 font-medium">
                  {reviewStats?.averageRating?.toFixed(1) || '0.0'}/5
                  {reviewStats?.pagination?.totalReviews > 0 && (
                    <span className="text-gray-500 text-xs ml-1">
                      ({reviewStats.pagination.totalReviews} reviews)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Link href="/products" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Shop
              </button>
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAddingToCart || !selectedSize}
              className={`flex-1 px-4 py-2 sm:px-8 sm:py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : !selectedSize
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isAddingToCart
                      ? 'bg-orange-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white hover:scale-105'
                }`}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  <span className="hidden sm:inline">
                    {product.stock === 0
                      ? 'Out of Stock'
                      : !selectedSize
                        ? 'Select Size First'
                        : `Add ${quantity} to Cart`
                    }
                  </span>
                  <span className="sm:hidden">
                    {product.stock === 0
                      ? 'Out of Stock'
                      : !selectedSize
                        ? 'Select Size'
                        : 'Add to Cart'
                    }
                  </span>
                </>
              )}
            </button>

            <Link href="/cart" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                View Cart
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section - Below Add to Cart */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Reviews productId={product._id} />
      </div>
    </div>
  )
}