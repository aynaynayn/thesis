import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  addedByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
