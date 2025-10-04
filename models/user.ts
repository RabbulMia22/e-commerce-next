import mongoose, {
  Schema,
  model,
  models,
  type CallbackWithoutResultAndOptionalError,
  type HydratedDocument,
  type Model,
} from "mongoose";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/db";

export interface IUser {
  name: string;
  email: string;
  phone?: string;
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

const normalizePhone = (value: string | null | undefined) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const UserSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    name: { type: String, required: true, trim: true }, // merged first + last
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
      type: String,
      trim: true,
      set: normalizePhone,
    },
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

const ensurePhoneIndex = async () => {
  try {
    await dbConnect();
    const collection = mongoose.connection.collection("users");
    const indexes = await collection.indexes();
    const phoneIndex = indexes.find((index) => index.name === "phone_1");

    const desiredPartialFilter = { phone: { $type: "string", $ne: "" } };
    const requiresRefresh =
      !phoneIndex ||
      phoneIndex.unique !== true ||
      phoneIndex.sparse !== true ||
      JSON.stringify(phoneIndex.key) !== JSON.stringify({ phone: 1 }) ||
      JSON.stringify(phoneIndex.partialFilterExpression ?? {}) !==
        JSON.stringify(desiredPartialFilter);

    if (requiresRefresh) {
      if (phoneIndex) {
        try {
          await collection.dropIndex("phone_1");
        } catch (dropError) {
          const mongoError = dropError as { code?: number };
          if (mongoError.code !== 27) {
            throw dropError;
          }
        }
      }

      await collection.createIndex(
        { phone: 1 },
        {
          name: "phone_1",
          unique: true,
          sparse: true,
          partialFilterExpression: desiredPartialFilter,
        },
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[models/user] Failed to ensure phone index", error);
    }
  }
};

const globalForUserModel = globalThis as typeof globalThis & {
  __usersPhoneIndexEnsured?: boolean;
};

if (!globalForUserModel.__usersPhoneIndexEnsured) {
  globalForUserModel.__usersPhoneIndexEnsured = true;
  void ensurePhoneIndex();
}

const UserModel: UserModelType =
  (models.User as UserModelType) || model<IUser, UserModelType>("User", UserSchema);

export default UserModel;