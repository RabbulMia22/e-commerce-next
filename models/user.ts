import type { CallbackWithoutResultAndOptionalError, HydratedDocument, Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
  role?: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

type UserModelType = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    name: { type: String, required: true, trim: true }, // merged first + last
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String }, 
    role: { type: String, enum: ["user", "admin"], default: "user" }, // optional roles
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (this: UserDocument, next: CallbackWithoutResultAndOptionalError) {
  if (!this.isModified("password") || !this.password) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (this: UserDocument, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel: UserModelType =
  (models.User as UserModelType) || model<IUser, UserModelType>("User", UserSchema);

export default UserModel;