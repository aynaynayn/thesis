import crypto from "crypto";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const shippingFee = Number(process.env.FLAT_SHIPPING_FEE || 100);

function orderNumber() {
  return `PF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

function addressFrom(body) {
  const address = body.deliveryAddress;
  const fields = ["firstName", "lastName", "email", "phone", "line1", "city", "province"];
  if (!address || fields.some((field) => !String(address[field] || "").trim())) {
    throw Object.assign(new Error("Complete delivery information is required"), { statusCode: 400 });
  }
  return Object.fromEntries([...fields, "barangay", "postalCode"].map((field) => [field, String(address[field] || "").trim()]));
}

function serialiseOrder(order) {
  return { ...order.toObject(), id: order._id };
}

export async function createOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { paymentMethod, paymentReference } = req.body;
    if (!["cod", "gcash", "maya"].includes(paymentMethod)) return res.status(400).json({ message: "A valid payment method is required" });
    if (["gcash", "maya"].includes(paymentMethod) && !String(paymentReference || "").trim()) return res.status(400).json({ message: "A payment reference is required for GCash or Maya" });
    const deliveryAddress = addressFrom(req.body);
    let createdOrder;
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product").session(session);
      if (!cart?.items.length) throw Object.assign(new Error("Your cart is empty"), { statusCode: 400 });
      const items = [];
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product) throw Object.assign(new Error("A product in your cart is no longer available"), { statusCode: 409 });
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, isActive: true, inventory: { $elemMatch: { breed: cartItem.breed, size: cartItem.size, stock: { $gte: cartItem.quantity } } } },
          { $inc: { "inventory.$.stock": -cartItem.quantity } },
          { new: true, session },
        );
        if (!updated) throw Object.assign(new Error(`${product.name} no longer has enough stock`), { statusCode: 409 });
        const variant = product.inventory.find((entry) => entry.breed === cartItem.breed && entry.size === cartItem.size);
        items.push({ product: product._id, name: product.name, image: product.image, breed: cartItem.breed, size: cartItem.size, sku: variant.sku, quantity: cartItem.quantity, unitPrice: product.price });
      }
      const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      [createdOrder] = await Order.create([{
        orderNumber: orderNumber(), user: req.user._id, items, deliveryAddress, paymentMethod,
        paymentReference: paymentMethod === "cod" ? undefined : String(paymentReference).trim(),
        subtotal, shippingFee, total: subtotal + shippingFee,
      }], { session });
      cart.items = [];
      await cart.save({ session });
    });
    res.status(201).json({ order: serialiseOrder(createdOrder) });
  } catch (error) { next(error); }
  finally { await session.endSession(); }
}

export async function listMyOrders(req, res, next) {
  try { res.json({ orders: (await Order.find({ user: req.user._id }).sort({ createdAt: -1 })).map(serialiseOrder) }); } catch (error) { next(error); }
}

export async function getMyOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order: serialiseOrder(order) });
  } catch (error) { next(error); }
}

async function restoreInventory(order, session) {
  if (order.inventoryRestored) return;
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product, inventory: { $elemMatch: { breed: item.breed, size: item.size } } }, { $inc: { "inventory.$.stock": item.quantity } }, { session });
  }
  order.inventoryRestored = true;
}

export async function cancelMyOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      order = await Order.findOne({ _id: req.params.id, user: req.user._id }).session(session);
      if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
      if (order.status !== "pending") throw Object.assign(new Error("Only pending orders can be cancelled"), { statusCode: 409 });
      order.status = "cancelled";
      await restoreInventory(order, session);
      await order.save({ session });
    });
    res.json({ order: serialiseOrder(order) });
  } catch (error) { next(error); }
  finally { await session.endSession(); }
}

export async function listAdminOrders(req, res, next) {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    res.json({ orders: (await Order.find(filter).sort({ createdAt: -1 }).populate("user", "name email")).map(serialiseOrder) });
  } catch (error) { next(error); }
}

export async function updateOrderStatus(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    const { status, paymentStatus } = req.body;
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "A valid order status is required" });
    let order;
    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);
      if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });
      if (order.status === "cancelled" && status !== "cancelled") throw Object.assign(new Error("Cancelled orders cannot be reopened"), { statusCode: 409 });
      order.status = status;
      if (paymentStatus && ["pending", "paid", "failed", "refunded"].includes(paymentStatus)) order.paymentStatus = paymentStatus;
      if (status === "cancelled") await restoreInventory(order, session);
      await order.save({ session });
    });
    res.json({ order: serialiseOrder(order) });
  } catch (error) { next(error); }
  finally { await session.endSession(); }
}
