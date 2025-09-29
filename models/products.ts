import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[]; 
  stock: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    brand: {
      type: String,
      default: "Generic",
    },
    images: {
      type: [String], // array of strings
      required: [true, "At least one product image is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Product must have at least one image",
      },
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
