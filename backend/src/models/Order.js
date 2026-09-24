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
  // Legacy orders retain their breed label. New orders may save the preview
  // breed as optional metadata, but it is not an inventory key.
  breed: { type: String },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  inventoryAllocations: {
    type: [{ sku: { type: String, required: true }, quantity: { type: Number, required: true, min: 1 } }],
    default: [],
    _id: false,
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [itemSchema], required: true, validate: [(items) => items.length > 0, "An order needs at least one item"] },
  deliveryAddress: { type: addressSchema, required: true },
  // GCash and Maya remain here only so historical orders can still be read.
  // New checkout orders are cash on delivery only.
  paymentMethod: { type: String, enum: ["cod", "gcash", "maya"], required: true },
  paymentReference: { type: String, trim: true, maxlength: 100 },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending", index: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  inventoryRestored: { type: Boolean, default: false },
  cancellationReason: { type: String, trim: true, maxlength: 500 },
  cancelledBy: { type: String, enum: ["customer", "admin"] },
  cancelledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
