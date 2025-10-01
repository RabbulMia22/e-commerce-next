import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // merged first + last
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String }, // hashed password
    role: { type: String, enum: ["user", "admin"], default: "user" }, // optional roles
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
