import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectMongoDB from '@/lib/db'
import Review from '@/models/review'
import User from '@/models/user'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST /api/reviews/[id]/comment - Add a comment to a review
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

    const body = await request.json()
    const { comment } = body

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment text is required' },
        { status: 400 }
      )
    }

    if (comment.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Comment must be 500 characters or less' },
        { status: 400 }
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

    // Add new comment
    const newComment = {
      user: user._id,
      comment: comment.trim(),
      createdAt: new Date()
    }

    review.comments.push(newComment)
    review.commentCount = review.comments.length

    await review.save()

    // Populate the user info for response
    await review.populate({
      path: 'comments.user',
      select: 'name email'
    })

    // Return the newly added comment
    const addedComment = review.comments[review.comments.length - 1]

    return NextResponse.json({
      success: true,
      comment: addedComment,
      commentCount: review.commentCount
    })

  } catch (error) {
    console.error('Error adding comment to review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

// GET /api/reviews/[id]/comment - Get comments for a review
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