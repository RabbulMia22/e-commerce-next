'use client'
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import axios from 'axios'
import ProductShowcase from './ProductShowcase'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useSearchParams } from 'next/navigation'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../styles/swiper-custom.css'

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

async function fetchProducts() {
  try {
    const response = await axios.get("/api/products");
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export default function ProductsPagination() {
  const [currentPage, setCurrentPage] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const productsPerPage = 16
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const { data: allProducts = [], isLoading, isError, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return allProducts;
    }
    
    const query = searchQuery.toLowerCase();
    return allProducts.filter((product: IProduct) => 
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  // Split filtered products into pages of 16
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = []
  
  for (let i = 0; i < totalPages; i++) {
    const start = i * productsPerPage
    const end = start + productsPerPage
    paginatedProducts.push(filteredProducts.slice(start, end))
  }

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0);
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  }, [searchQuery, swiperInstance]);

  // Debug logging
  console.log('ProductsPagination Debug:', {
    totalProducts: allProducts.length,
    filteredProducts: filteredProducts.length,
    searchQuery,
    productsPerPage,
    totalPages,
    currentPage,
    paginatedProducts: paginatedProducts.map(page => page.length)
  })

  const handleSlideChange = (swiper: any) => {
    setCurrentPage(swiper.activeIndex)
  }

  const goToSlide = (index: number) => {
    if (swiperInstance) {
      swiperInstance.slideTo(index)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
            All Products
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our complete collection of premium products
          </p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 font-medium text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load products</h3>
              <p className="text-gray-600 mb-6">Error: {(error as Error).message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
            All Products
          </h1>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">No products available</h3>
          <p className="text-gray-600 max-w-md mb-8">
            We're working on adding new products. Please check back soon for exciting deals and offers!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-2">
          {searchQuery 
            ? `Found ${filteredProducts.length} products matching your search` 
            : 'Discover our complete collection of premium products'
          }
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
          <p className="text-gray-500">
            {searchQuery ? `Showing: ${filteredProducts.length}` : `Total: ${allProducts.length}`} products
          </p>
          <span className="hidden sm:inline text-gray-300">•</span>
          <p className="text-indigo-600 font-semibold">
            Page {currentPage + 1} of {totalPages}
          </p>
          <span className="hidden sm:inline text-gray-300">•</span>
          <p className="text-gray-500">
            {productsPerPage} per page
          </p>
        </div>
      </div>

      {/* No search results */}
      {searchQuery && filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">No products found</h3>
          <p className="text-gray-600 max-w-md mb-8">
            We couldn't find any products matching "{searchQuery}". Try searching with different keywords.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Products Swiper */}
          <div className="relative mb-8">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            el: '.swiper-pagination-custom',
            clickable: true,
            renderBullet: (index: number, className: string) => {
              return `<span class="${className} custom-bullet" data-page="${index + 1}"></span>`
            }
          }}
          onSlideChange={handleSlideChange}
          onSwiper={setSwiperInstance}
          className="products-swiper"
        >
          {paginatedProducts.map((pageProducts, pageIndex) => (
            <SwiperSlide key={pageIndex}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pageProducts.map((product: IProduct) => (
                  <div key={product._id} className="flex">
                    <ProductShowcase product={product} />
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {totalPages > 1 && (
          <>
            <button 
              className="swiper-button-prev-custom swiper-navigation-button prev"
              disabled={currentPage === 0}
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            
            <button 
              className="swiper-button-next-custom swiper-navigation-button next"
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </>
        )}
      </div>

      {/* Custom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mb-8">
          <button
            onClick={() => goToSlide(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, index) => {
              let pageIndex = index;
              
              if (totalPages > 7) {
                if (currentPage < 3) {
                  pageIndex = index;
                } else if (currentPage > totalPages - 4) {
                  pageIndex = totalPages - 7 + index;
                } else {
                  pageIndex = currentPage - 3 + index;
                }
              }

              if (pageIndex >= totalPages) return null;

              return (
                <button
                  key={pageIndex}
                  onClick={() => goToSlide(pageIndex)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === pageIndex
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToSlide(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

          {/* Page Info */}
          <div className="text-center text-gray-500 text-sm">
            <p>
              Showing products {currentPage * productsPerPage + 1} to{' '}
              {Math.min((currentPage + 1) * productsPerPage, filteredProducts.length)} of{' '}
              {filteredProducts.length} total {searchQuery ? 'matching' : ''} products
            </p>
          </div>
        </>
      )}
    </div>
  )
}