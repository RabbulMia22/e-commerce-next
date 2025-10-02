import mongoose, { Schema, Document } from "mongoose";

interface IPendingOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: string;
  userId: string;
  userEmail: string;
  items: Array<{
    product: string;
    quantity: number;
    selectedSize: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    area: string;
    district: string;
    division: string;
    postalCode?: string;
    addressType: string;
    landmark?: string;
    deliveryZone: string;
    deliveryType: string;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
  };
  deliveryType: string;
  notes?: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

const PendingOrderSchema = new Schema<IPendingOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  items: [{
    product: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    selectedSize: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String, required: true },
    district: { type: String, required: true },
    division: { type: String, required: true },
    postalCode: { type: String },
    addressType: { type: String, required: true },
    landmark: { type: String },
    deliveryZone: { type: String, required: true },
    deliveryType: { type: String, required: true }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  },
  deliveryType: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  transactionId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true
  }
}, {
  timestamps: true
});

// Auto-expire pending orders after 30 minutes
PendingOrderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

export default mongoose.models.PendingOrder || mongoose.model<IPendingOrder>("PendingOrder", PendingOrderSchema);