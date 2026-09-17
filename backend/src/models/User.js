import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 50 },
    recipientName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    line1: { type: String, trim: true, maxlength: 160 },
    line2: { type: String, trim: true, maxlength: 160 },
    barangay: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 100 },
    province: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const petProfileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    breed: { type: String, trim: true, maxlength: 80 },
    neckCm: { type: Number, min: 0, max: 300 },
    chestCm: { type: Number, min: 0, max: 300 },
    backCm: { type: Number, min: 0, max: 300 },
    neckGirthCm: { type: Number, min: 0, max: 300 },
    chestGirthCm: { type: Number, min: 0, max: 300 },
    backLengthCm: { type: Number, min: 0, max: 300 },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [addressSchema],
    petProfiles: { type: [petProfileSchema], default: [] },
    // Retained for existing accounts. It is folded into petProfiles when the
    // account is returned or a profile is next written.
    petProfile: { type: petProfileSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
