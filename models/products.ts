import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  rating: number;
  averageRating: number;
  totalReviews: number;
  hasSize: boolean;
  availableSizes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0, min: 0 },
  hasSize: { type: Boolean, default: false },
  availableSizes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Product: Model<IProduct> = 
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
