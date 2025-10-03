'use client'
import React from 'react'
import { FiStar } from 'react-icons/fi'

interface ReviewStatsProps {
  totalReviews: number
  averageRating: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  showDistribution?: boolean
}

export default function ReviewStats({ 
  totalReviews, 
  averageRating, 
  ratingDistribution, 
  showDistribution = false 
}: ReviewStatsProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < Math.round(rating)
          return (
            <svg
              key={index}
              className="w-5 h-5"
              viewBox="0 0 20 20"
            >
              <path 
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={isFilled ? '#FCD34D' : '#E5E7EB'}
                stroke={isFilled ? '#F59E0B' : '#D1D5DB'}
                strokeWidth="0.5"
              />
            </svg>
          )
        })}
      </div>
    )
  }

  const getProgressBarWidth = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
          <p className="text-gray-600 text-sm mt-1">
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            {averageRating > 0 && ` • ${averageRating} average rating`}
          </p>
        </div>
        {averageRating > 0 && (
          <div className="text-right">
            {renderStars(averageRating)}
            <p className="text-lg font-bold text-gray-900 mt-1">{averageRating}/5</p>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {showDistribution && ratingDistribution && totalReviews > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20">
                    <path 
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      fill="#FCD34D"
                      stroke="#F59E0B"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${getProgressBarWidth(ratingDistribution[rating as keyof typeof ratingDistribution])}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reviews State */}
      {totalReviews === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <FiStar className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}