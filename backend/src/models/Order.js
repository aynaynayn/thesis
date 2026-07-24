import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  line1: { type: String, required: true, trim: true, maxlength: 160 },
  barangay: { type: String, trim: true, maxlength: 100 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  province: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, trim: true, maxlength: 20 },
}, { _id: false });

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String },
  breed: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [itemSchema], required: true, validate: [(items) => items.length > 0, "An order needs at least one item"] },
  deliveryAddress: { type: addressSchema, required: true },
  paymentMethod: { type: String, enum: ["cod", "gcash", "maya"], required: true },
  paymentReference: { type: String, trim: true, maxlength: 100 },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending", index: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  inventoryRestored: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
