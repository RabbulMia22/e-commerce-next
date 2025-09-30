import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBannerOffer extends Document {
  title: string;
  imageUrl: string;
  linkUrl: string;
  discount?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerOfferSchema: Schema<IBannerOffer> = new Schema({
  title: { 
    type: String, 
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Banner image is required'],
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  linkUrl: { 
    type: String, 
    required: [true, 'Banner link URL is required'],
    trim: true
  },
  discount: { 
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    required: false
  },
  startDate: { 
    type: Date,
    required: false,
    validate: {
      validator: function(this: IBannerOffer, value: Date) {
        // If both startDate and endDate are provided, startDate should be before endDate
        if (value && this.endDate) {
          return value < this.endDate;
        }
        return true;
      },
      message: 'Start date must be before end date'
    }
  },
  endDate: { 
    type: Date,
    required: false,
    validate: {
      validator: function(this: IBannerOffer, value: Date) {
        // If both startDate and endDate are provided, endDate should be after startDate
        if (value && this.startDate) {
          return value > this.startDate;
        }
        return true;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: { 
    type: Boolean, 
    default: true,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
BannerOfferSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
BannerOfferSchema.index({ isActive: 1 });
BannerOfferSchema.index({ startDate: 1, endDate: 1 });
BannerOfferSchema.index({ createdAt: -1 });

// Add a virtual property to check if banner is currently active based on dates
BannerOfferSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  // If no dates specified, banner is active based on isActive field only
  if (!this.startDate && !this.endDate) {
    return this.isActive;
  }
  
  // Check if current time is within the campaign period
  const afterStart = !this.startDate || now >= this.startDate;
  const beforeEnd = !this.endDate || now <= this.endDate;
  
  return this.isActive && afterStart && beforeEnd;
});

// Add a method to activate/deactivate banner
BannerOfferSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  this.updatedAt = new Date();
  return this.save();
};

// Add a static method to get currently active banners
BannerOfferSchema.statics.getCurrentlyActive = function() {
  const now = new Date();
  
  return this.find({
    isActive: true,
    $or: [
      // No date restrictions
      { startDate: { $exists: false }, endDate: { $exists: false } },
      // Within date range
      {
        $and: [
          { $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] }
        ]
      }
    ]
  }).sort({ createdAt: -1 });
};

// Clear any existing model to ensure we use the updated schema
if (mongoose.models.BannerOffer) {
  delete mongoose.models.BannerOffer;
}

export const BannerOffer: Model<IBannerOffer> = mongoose.model("BannerOffer", BannerOfferSchema);