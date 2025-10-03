import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: {
    type: [String],
    default: []
  },
  verified: {
    type: Boolean,
    default: false // Will be true if user actually purchased this product
  },
  helpful: {
    type: Number,
    default: 0 // Count of how many users found this review helpful
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: true // Auto-approve reviews, can be changed for moderation
  }
}, {
  timestamps: true
})

// Index for better query performance
reviewSchema.index({ product: 1, createdAt: -1 })
reviewSchema.index({ user: 1, createdAt: -1 })
reviewSchema.index({ rating: 1 })

// Populate user and product info when querying
reviewSchema.pre(/^find/, function(this: any) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'product',
    select: 'title images'
  })
})

// Calculate average rating for product after review save/update/delete
reviewSchema.post('save', async function() {
  await updateProductRating(this.product)
})

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    await updateProductRating(doc.product)
  }
})

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateProductRating(doc.product)
  }
})

async function updateProductRating(productId: mongoose.Types.ObjectId) {
  try {
    const Review = mongoose.model('Review')
    const Product = mongoose.model('Product')
    
    const stats = await Review.aggregate([
      { $match: { product: productId, approved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ])

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
        totalReviews: stats[0].totalReviews
      })
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      })
    }
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
}

// Allow multiple reviews from same user for same product
// reviewSchema.index({ user: 1, product: 1 }, { unique: true }) // Commented out to allow multiple reviews

// Clear any existing model to ensure we use the updated schema
if (mongoose.models.Review) {
  delete mongoose.models.Review
}

const Review = mongoose.model('Review', reviewSchema)

export default Review