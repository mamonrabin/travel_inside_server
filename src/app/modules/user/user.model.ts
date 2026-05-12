import { model, Schema } from "mongoose";
import { IsActive, Role, type IUser } from "./user.interface.js";

const authProviderSchema = new Schema(
  {
   provider: {
      type: String,
      enum: ["google", "credentials"],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
  },
  { _id: false, versionKey: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: 0,
    },
    phone: { type: String },

    picture: { type: String },

    address: { type: String },

    isDeleted: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
     auths: [authProviderSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const userModel = model<IUser>("user", userSchema);
