'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { FiStar, FiUser, FiCalendar, FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import ReviewStats from './ReviewStats'

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  rating: number
  title: string
  comment: string
  images: string[]
  createdAt: string
  helpful: number
  helpfulBy: string[]
  verified: boolean
  comments: Array<{
    _id: string
    user: {
      _id: string
      name: string
      email: string
    }
    comment: string
    createdAt: string
  }>
  commentCount: number
}

interface ReviewsProps {
  productId: string
}

async function fetchReviews(productId: string, page: number = 1) {
  const res = await fetch(`/api/reviews?productId=${productId}&page=${page}&limit=10`)
  if (!res.ok) {
    throw new Error('Failed to fetch reviews')
  }
  return res.json()
}

export default function Reviews({ productId }: ReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedReview, setExpandedReview] = useState<string | null>(null)
  const [showComments, setShowComments] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<string>('')
  
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to toggle like')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    }
  })

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ reviewId, comment }: { reviewId: string, comment: string }) => {
      const res = await fetch(`/api/reviews/${reviewId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment })
      })
      if (!res.ok) throw new Error('Failed to add comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      setNewComment('')
      toast.success('Comment added successfully!')
    }
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', productId, currentPage],
    queryFn: () => fetchReviews(productId, currentPage),
    enabled: !!productId,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLike = async (reviewId: string) => {
    if (!session) {
      toast.error('Please login to like reviews')
      return
    }
    likeMutation.mutate(reviewId)
  }

  const handleAddComment = async (reviewId: string) => {
    if (!session) {
      toast.error('Please login to comment')
      return
    }
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }
    if (newComment.length > 500) {
      toast.error('Comment must be 500 characters or less')
      return
    }
    commentMutation.mutate({ reviewId, comment: newComment })
  }

  const isLikedByCurrentUser = (review: Review) => {
    if (!session?.user?.email) return false
    // Check by email since that's what we have in session
    return review.helpfulBy?.includes(session.user.email)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < rating
          return (
            <svg
              key={index}
              className="w-4 h-4"
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <p>Error loading reviews. Please try again later.</p>
        </div>
      </div>
    )
  }

  const { 
    reviews = [], 
    pagination = {}, 
    ratingDistribution = null, 
    averageRating = 0 
  } = data || {}
  
  const totalReviews = pagination.totalReviews || 0

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      <ReviewStats 
        totalReviews={totalReviews}
        averageRating={averageRating}
        ratingDistribution={ratingDistribution}
        showDistribution={totalReviews > 0}
      />

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            All Reviews ({totalReviews})
          </h4>
          <div className="space-y-6">
            {reviews.map((review: Review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {review.user?.name || 'Anonymous'}
                    </h4>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {review.comment.length > 200 && expandedReview !== review._id ? (
                      <>
                        {review.comment.substring(0, 200)}...
                        <button
                          onClick={() => setExpandedReview(review._id)}
                          className="text-orange-500 hover:text-orange-600 font-medium ml-2"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      <>
                        {review.comment}
                        {review.comment.length > 200 && expandedReview === review._id && (
                          <button
                            onClick={() => setExpandedReview(null)}
                            className="text-orange-500 hover:text-orange-600 font-medium ml-2"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {review.images.map((image, index) => (
                          <div key={index} className="flex-shrink-0">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  
                  {/* Like and Comment Buttons */}
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => handleLike(review._id)}
                      disabled={likeMutation.isPending}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLikedByCurrentUser(review)
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FiHeart className={`w-4 h-4 ${isLikedByCurrentUser(review) ? 'fill-current' : ''}`} />
                      <span>{review.helpful || 0}</span>
                      <span>Like</span>
                    </button>

                    <button
                      onClick={() => setShowComments(showComments === review._id ? null : review._id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      <span>{review.commentCount || 0}</span>
                      <span>Comment</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments === review._id && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      {/* Add Comment Form */}
                      {session && (
                        <div className="mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              maxLength={500}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleAddComment(review._id)}
                              disabled={commentMutation.isPending || !newComment.trim()}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <FiSend className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {newComment.length}/500 characters
                          </div>
                        </div>
                      )}

                      {/* Existing Comments */}
                      {review.comments && review.comments.length > 0 && (
                        <div className="space-y-3">
                          {review.comments.map((comment) => (
                            <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <FiUser className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.user?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 ml-8">
                                {comment.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {(!review.comments || review.comments.length === 0) && (
                        <div className="text-sm text-gray-500 text-center py-4">
                          No comments yet. Be the first to comment!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Pagination */}
          {Math.ceil(totalReviews / 10) > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(totalReviews / 10)}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalReviews / 10)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}