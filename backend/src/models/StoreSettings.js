import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, default: "store", unique: true },
  storeName: { type: String, default: "PawFit", trim: true, maxlength: 100 },
  supportEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 160 },
  announcement: { type: String, default: "Made for real dogs, measured for real life\nFree delivery on orders over PHP 2,000", trim: true, maxlength: 600 },
}, { timestamps: true });

export default mongoose.model("StoreSettings", storeSettingsSchema);
