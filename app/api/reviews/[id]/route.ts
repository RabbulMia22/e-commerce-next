import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/db'
import Review from '@/models/review'
import User from '@/models/user'
import { getSessionSafely } from '@/lib/session'

// GET /api/reviews/[id] - Get specific review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB()
    const { id } = await params
    
    const review = await Review.findById(id)
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews/[id] - Update specific review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const session = await getSessionSafely()
    const { id } = await params
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const body = await request.json()
    const { rating, title, comment, images } = body

    // Get user
    const user = await (User as any).findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Find review and check ownership
    const review = await Review.findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    if (!review.user.equals(user._id)) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      )
    }

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (images && images.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed per review' },
        { status: 400 }
      )
    }

    // Update review
    const updatedReview = await (Review as any).findByIdAndUpdate(
      id,
      {
        ...(rating && { rating }),
        ...(title && { title: title.trim() }),
        ...(comment && { comment: comment.trim() }),
        ...(images && { images })
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete specific review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const session = await getSessionSafely()
    const { id } = await params
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    // Get user
    const user = await (User as any).findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Find review and check ownership
    const review = await (Review as any).findById(id)
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    if (!review.user.equals(user._id)) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      )
    }

    await (Review as any).findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}