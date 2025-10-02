import mongoose, { Schema, Document, model, models } from "mongoose";

// Order Item Interface
interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  image: string;
  brand?: string;
}

// Shipping Address Interface
interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Payment Info Interface
interface IPaymentInfo {
  method: 'credit_card' | 'paypal' | 'stripe' | 'cash_on_delivery';
  transactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: Date;
  amount: number;
}

// Order Interface
interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentInfo: IPaymentInfo;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  totalAmount: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedSize: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    trim: true
  }
});

// Shipping Address Schema
const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'United States'
  },
  phone: {
    type: String,
    trim: true
  }
});

// Payment Info Schema
const PaymentInfoSchema = new Schema<IPaymentInfo>({
  method: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe', 'cash_on_delivery'],
    required: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

// Main Order Schema
const OrderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  paymentInfo: {
    type: PaymentInfoSchema,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for better query performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ 'paymentInfo.paymentStatus': 1 });

// Generate unique order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Generate random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000);
    
    // Format: ORD-YYMMDD-XXXX
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
    
    // Check if order number already exists
    const existingOrder = await mongoose.models.Order.findOne({ orderNumber: this.orderNumber });
    if (existingOrder) {
      // Generate new random number if duplicate
      const newRandom = Math.floor(1000 + Math.random() * 9000);
      this.orderNumber = `ORD-${year}${month}${day}-${newRandom}`;
    }
  }
  next();
});

// Virtual for order age
OrderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function(): boolean {
  return ['pending', 'confirmed'].includes(this.orderStatus);
};

// Method to check if order can be returned
OrderSchema.methods.canBeReturned = function(): boolean {
  const deliveryDate = this.deliveredAt;
  if (!deliveryDate || this.orderStatus !== 'delivered') return false;
  
  const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  return (Date.now() - deliveryDate.getTime()) <= returnWindow;
};

// Method to calculate estimated delivery
OrderSchema.methods.calculateEstimatedDelivery = function(): Date {
  const now = new Date();
  const deliveryDays = this.shippingCost === 0 ? 7 : 3; // Free shipping takes longer
  return new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
};

// Static method to get orders by status
OrderSchema.statics.getOrdersByStatus = function(status: string) {
  return this.find({ orderStatus: status }).populate('user', 'name email').sort({ createdAt: -1 });
};

// Static method to get user orders
OrderSchema.statics.getUserOrders = function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get order analytics
OrderSchema.statics.getOrderAnalytics = function(startDate?: Date, endDate?: Date) {
  const match: any = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ]);
};

// Export the model
const Order = models.Order || model<IOrder>('Order', OrderSchema);
export default Order;

// Export interfaces
export type { IOrder, IOrderItem, IShippingAddress, IPaymentInfo };