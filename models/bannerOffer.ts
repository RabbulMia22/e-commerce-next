import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBannerOffer extends Document {
    title: string;
    imageUrl: string;
    discount?: number;
    linkUrl: string;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BannerOfferSchema: Schema<IBannerOffer> = new Schema({
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    title: { type: String, required: true },
    discount: { type: Number, required: false },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const BannerOffer: Model<IBannerOffer> = 
  mongoose.models.BannerOffer || mongoose.model("BannerOffer", BannerOfferSchema);
