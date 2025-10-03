import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectMongoDB from '@/lib/db'
import Review from '@/models/review'
import User from '@/models/user'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST /api/reviews/[id]/like - Toggle like on a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this review
    const hasLiked = review.helpfulBy.includes(user._id)

    if (hasLiked) {
      // Unlike: Remove user from helpfulBy array and decrease count
      review.helpfulBy = review.helpfulBy.filter(
        (userId: any) => userId.toString() !== user._id.toString()
      )
      review.helpful = Math.max(0, review.helpful - 1)
    } else {
      // Like: Add user to helpfulBy array and increase count
      review.helpfulBy.push(user._id)
      review.helpful += 1
    }

    await review.save()

    return NextResponse.json({
      success: true,
      liked: !hasLiked,
      helpfulCount: review.helpful
    })

  } catch (error) {
    console.error('Error toggling review like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// GET /api/reviews/[id]/comments - Get comments for a review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectMongoDB()

    const review = await Review.findById(id)
      .populate({
        path: 'comments.user',
        select: 'name email'
      })
      
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comments: review.comments || [],
      commentCount: review.commentCount || 0
    })

  } catch (error) {
    console.error('Error fetching review comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}