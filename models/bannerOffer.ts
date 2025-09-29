import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBannerOffer extends Document {
    title: string;
    imageUrl: string;
    linkUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const BannerOfferSchema: Schema<IBannerOffer> = new Schema({
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const BannerOffer: Model<IBannerOffer> = 
  mongoose.models.BannerOffer || mongoose.model("BannerOffer", BannerOfferSchema);