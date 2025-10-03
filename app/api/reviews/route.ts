import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectMongoDB from '@/lib/db'
import Review from '@/models/review'
import { Product } from '@/models/products'
import User from '@/models/user'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import uploadImage from '@/middleware/multerStorage'

// GET /api/reviews - Get reviews with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const rating = searchParams.get('rating')
    const sortBy = searchParams.get('sortBy') || 'createdAt' // createdAt, rating, helpful
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { approved: true }
    
    if (productId) {
      filter.product = productId
    }
    
    if (userId) {
      filter.user = userId
    }
    
    if (rating) {
      filter.rating = parseInt(rating)
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = order === 'desc' ? -1 : 1

    // Get reviews with pagination and populate comments
    const reviews = await Review.find(filter)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(filter)

    // Calculate rating distribution if productId is provided
    let ratingDistribution = null
    let averageRating = 0
    
    if (productId) {
      const distribution = await Review.aggregate([
        { $match: { product: productId, approved: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ])

      ratingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }

      let totalRatings = 0
      let totalScore = 0

      distribution.forEach(item => {
        ratingDistribution[item._id] = item.count
        totalRatings += item.count
        totalScore += item._id * item.count
      })

      averageRating = totalRatings > 0 ? totalScore / totalRatings : 0
    }

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      },
      ratingDistribution,
      averageRating: Math.round(averageRating * 10) / 10
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    console.log('=== API REVIEW SUBMISSION DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('Server session:', session)
    console.log('Session user:', session?.user)
    console.log('User email:', session?.user?.email)
    
    if (!session || !session.user?.email) {
      console.log('❌ Authentication failed - no session or email')
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please login to submit a review.' },
        { status: 401 }
      )
    }

    console.log('✅ Authentication successful for:', session.user.email)

    await connectMongoDB()

    // Handle both JSON and FormData requests
    const contentType = request.headers.get('content-type')
    console.log('🔍 Content-Type:', contentType)
    
    let reviewData: any = {}
    let imageFiles: File[] = []

    if (contentType?.includes('multipart/form-data')) {
      console.log('📦 Parsing as FormData...')
      const formData = await request.formData()
      
      reviewData.productId = formData.get('productId') as string
      reviewData.rating = parseInt(formData.get('rating') as string)
      reviewData.title = formData.get('title') as string
      reviewData.comment = formData.get('comment') as string
      
      // Get all image files
      const files = formData.getAll('images') as File[]
      imageFiles = files.filter(file => file && file.size > 0)
      
      console.log('📋 FormData contents:', {
        productId: reviewData.productId,
        rating: reviewData.rating,
        title: reviewData.title?.substring(0, 20) + '...',
        comment: reviewData.comment?.substring(0, 30) + '...',
        totalFiles: files.length,
        validImageFiles: imageFiles.length
      })
      
      // Log each image file details
      imageFiles.forEach((file, index) => {
        console.log(`📸 Image ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        })
      })
      
    } else {
      console.log('📄 Parsing as JSON...')
      const body = await request.json()
      reviewData = body
      console.log('📋 Received JSON review data:', reviewData)
    }

    const { productId, rating, title, comment } = reviewData

    // Detailed validation logging
    console.log('🔍 Validating fields:')
    console.log('  - productId:', productId ? '✅' : '❌', productId)
    console.log('  - rating:', rating ? '✅' : '❌', rating)
    console.log('  - title:', title ? '✅' : '❌', title)
    console.log('  - comment:', comment ? '✅' : '❌', comment)

    // Validation
    if (!productId || !rating || !title || !comment) {
      const missingFields = []
      if (!productId) missingFields.push('productId')
      if (!rating) missingFields.push('rating')
      if (!title) missingFields.push('title')
      if (!comment) missingFields.push('comment')
      
      console.log('❌ Validation failed - missing fields:', missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (imageFiles && imageFiles.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed per review' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get user
    const user = await (User as any).findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Allow multiple reviews per user per product
    console.log('✅ Multiple reviews per user allowed for product:', productId)

    // Upload images using your middleware if any are provided
    let uploadedImageUrls: string[] = []
    
    if (imageFiles && imageFiles.length > 0) {
      console.log(`📸 Starting upload of ${imageFiles.length} images...`)
      try {
        const uploadPromises = imageFiles.map((file, index) => {
          console.log(`⬆️ Uploading image ${index + 1}: ${file.name}`)
          return uploadImage(file)
        })
        
        uploadedImageUrls = await Promise.all(uploadPromises)
        
        console.log(`✅ Successfully uploaded ${uploadedImageUrls.length} images:`)
        uploadedImageUrls.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`)
        })
      } catch (uploadError: any) {
        console.error('❌ Image upload failed:', uploadError)
        return NextResponse.json(
          { success: false, error: `Failed to upload images: ${uploadError.message || uploadError}` },
          { status: 500 }
        )
      }
    } else {
      console.log('📝 No images to upload')
    }

    // Create the review with uploaded image URLs
    const reviewDbData: any = {
      user: user._id,
      product: productId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
    }

    // Validate uploaded images count
    if (uploadedImageUrls.length > 10) {
      console.log('❌ Too many uploaded images:', uploadedImageUrls.length)
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed per review' },
        { status: 400 }
      )
    }

    // Add images if any were uploaded
    if (uploadedImageUrls.length > 0) {
      reviewDbData.images = uploadedImageUrls
      console.log(`💾 Saving review with ${uploadedImageUrls.length} images to database`)
    } else {
      console.log('💾 Saving review without images to database')
    }

    console.log('📋 Final review data for database:', {
      ...reviewDbData,
      images: uploadedImageUrls.length > 0 ? `[${uploadedImageUrls.length} images]` : 'none'
    })

    console.log('🔍 Validating data before creating review instance:')
    console.log('  - user ID:', user._id)
    console.log('  - product ID:', productId)
    console.log('  - rating type:', typeof rating, 'value:', rating)
    console.log('  - title type:', typeof title, 'length:', title?.length)
    console.log('  - comment type:', typeof comment, 'length:', comment?.length)

    const review = new Review(reviewDbData)
    console.log('🔨 Created review instance successfully')

    console.log('💾 Attempting to save to database...')
    await review.save()
    console.log('✅ Review saved to database with ID:', review._id)

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
    console.log('📖 Populated review:', {
      id: populatedReview?._id,
      hasImages: populatedReview?.images ? populatedReview.images.length : 0
    })

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ CRITICAL ERROR creating review:')
    console.error('Error type:', typeof error)
    console.error('Error message:', error?.message)
    console.error('Error code:', error?.code)
    console.error('Error stack:', error?.stack)
    console.error('Full error object:', error)
    
    if (error.code === 11000) {
      console.log('🔄 Duplicate key error detected - but multiple reviews should be allowed now')
      console.log('Error details:', error)
      // Note: This should not happen anymore since we removed the unique index
      return NextResponse.json(
        { success: false, error: 'Database constraint error - please try again' },
        { status: 500 }
      )
    }

    // MongoDB validation error
    if (error.name === 'ValidationError') {
      console.error('❌ MongoDB Validation Error:', error.errors)
      const validationErrors = Object.keys(error.errors).map(key => 
        `${key}: ${error.errors[key].message}`
      )
      return NextResponse.json(
        { success: false, error: `Validation failed: ${validationErrors.join(', ')}` },
        { status: 400 }
      )
    }

    // Cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      console.error('❌ Cast Error:', error.message)
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: `Server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// PUT /api/reviews - Update helpful count
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const body = await request.json()
    const { reviewId, action } = body // action: 'helpful' or 'unhelpful'

    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, error: 'Review ID and action are required' },
        { status: 400 }
      )
    }

    const user = await (User as any).findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const review = await (Review as any).findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    const hasVoted = review.helpfulBy.includes(user._id)

    if (action === 'helpful' && !hasVoted) {
      review.helpful += 1
      review.helpfulBy.push(user._id)
    } else if (action === 'unhelpful' && hasVoted) {
      review.helpful -= 1
      review.helpfulBy = review.helpfulBy.filter((id: any) => !id.equals(user._id))
    }

    await review.save()

    return NextResponse.json({
      success: true,
      helpful: review.helpful,
      hasVoted: action === 'helpful' ? true : false
    })

  } catch (error) {
    console.error('Error updating review helpfulness:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}