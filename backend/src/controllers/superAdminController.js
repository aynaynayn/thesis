import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Category from "../models/Category.js";
import StoreSettings from "../models/StoreSettings.js";
import AuditLog from "../models/AuditLog.js";
import { writeAudit } from "../utils/audit.js";

const accountView = (user) => ({ id: String(user._id), name: user.name, email: user.email, role: user.role, isActive: user.isActive !== false, isOwner: user.role === "superadmin", pets: user.petProfiles?.length || 0, createdAt: user.createdAt });
const orderView = (order) => ({ ...order.toObject(), id: String(order._id) });
const validRoles = ["user", "admin"];

export async function overview(_req, res, next) {
  try {
    const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
    const [totalUsers, activeAdmins, totalProducts, totalOrders, revenue, bestSelling, lowStock, pending] = await Promise.all([
      User.countDocuments({ role: "user" }), User.countDocuments({ role: "admin", isActive: { $ne: false } }), Product.countDocuments(), Order.countDocuments(),
      Order.aggregate([{ $match: { createdAt: { $gte: month }, paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([{ $unwind: "$items" }, { $group: { _id: "$items.product", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" } } }, { $sort: { quantity: -1 } }, { $limit: 5 }]),
      Product.find({ "inventory.stock": { $lte: 3 } }).select("name inventory").limit(8),
      Order.find({ status: "pending", createdAt: { $lte: new Date(Date.now() - 3 * 86400000) } }).select("orderNumber createdAt").limit(8),
    ]);
    res.json({ stats: { totalUsers, activeAdmins, totalProducts, totalOrders, revenueThisMonth: revenue[0]?.total || 0 }, bestSelling, lowStock, pending });
  } catch (error) { next(error); }
}

export async function listAccounts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const query = String(req.query.query || "").trim(); const role = String(req.query.role || ""); const status = String(req.query.status || "");
    const filter = {}; if (query) filter.$or = [{ name: new RegExp(query, "i") }, { email: new RegExp(query, "i") }];
    if (role === "owner") filter.role = "superadmin"; else if (validRoles.includes(role)) filter.role = role;
    if (status === "active") filter.isActive = { $ne: false }; if (status === "inactive") filter.isActive = false;
    const [items, total] = await Promise.all([User.find(filter).sort({ role: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
    res.json({ accounts: items.map(accountView), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) { next(error); }
}

export async function createAdmin(req, res, next) {
  try {
    const { name, email, temporaryPassword } = req.body; const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!String(name || "").trim() || !normalizedEmail || String(temporaryPassword || "").length < 8) return res.status(400).json({ message: "Name, email, and a temporary password of at least 8 characters are required" });
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email already in use" });
    const account = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(temporaryPassword, 12), role: "admin", isActive: true, mustChangePassword: true });
    await writeAudit(req.user, "admin_account_created", "account", account);
    res.status(201).json({ account: accountView(account), temporaryPassword });
  } catch (error) { next(error); }
}

export async function updateAccount(req, res, next) {
  try {
    const account = await User.findById(req.params.id); if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.role === "superadmin") { await writeAudit(req.user, "superadmin_change_rejected", "account", account); return res.status(403).json({ message: "The owner account cannot be changed here" }); }
    const changes = {}; if (req.body.role !== undefined) { if (!validRoles.includes(req.body.role)) return res.status(400).json({ message: "Role must be user or admin" }); changes.role = req.body.role; }
    if (req.body.isActive !== undefined) changes.isActive = Boolean(req.body.isActive);
    const before = { role: account.role, isActive: account.isActive !== false }; Object.assign(account, changes); await account.save();
    await writeAudit(req.user, "account_updated", "account", account, { before, after: changes }); res.json({ account: accountView(account) });
  } catch (error) { next(error); }
}

export async function listCategories(_req, res, next) { try { const productCategories = await Product.distinct("category"); for (const name of productCategories.map((item) => String(item || "").trim()).filter(Boolean)) { if (!await Category.exists({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") })) await Category.create({ name, addedByAdmin: true }); } const categories = await Category.find().sort({ name: 1 }); const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]); const map = new Map(counts.map((item) => [item._id, item.count])); res.json({ categories: categories.map((item) => ({ id: String(item._id), name: item.name, productCount: map.get(item.name) || 0, addedByAdmin: item.addedByAdmin })) }); } catch (error) { next(error); } }
export async function createCategory(req, res, next) { try { const name = String(req.body.name || "").trim(); if (!name) return res.status(400).json({ message: "Category name is required" }); if (await Category.exists({ name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") })) return res.status(409).json({ message: "A category with this name already exists" }); const category = await Category.create({ name }); await writeAudit(req.user, "category_created", "category", category); res.status(201).json({ category }); } catch (error) { next(error); } }
export async function renameCategory(req, res, next) { try { const category = await Category.findById(req.params.id); const name = String(req.body.name || "").trim(); if (!category) return res.status(404).json({ message: "Category not found" }); if (!name) return res.status(400).json({ message: "Category name is required" }); const oldName = category.name; await Product.updateMany({ category: oldName }, { category: name }); category.name = name; await category.save(); await writeAudit(req.user, "category_renamed", "category", category, { from: oldName, to: name }); res.json({ category }); } catch (error) { next(error); } }
export async function deleteCategory(req, res, next) { try { const category = await Category.findById(req.params.id); if (!category) return res.status(404).json({ message: "Category not found" }); const count = await Product.countDocuments({ category: category.name }); if (count) return res.status(409).json({ message: `Reassign these ${count} products first`, productCount: count }); await category.deleteOne(); await writeAudit(req.user, "category_deleted", "category", category); res.status(204).end(); } catch (error) { next(error); } }

export async function getSettings(_req, res, next) { try { const settings = await StoreSettings.findOneAndUpdate({ key: "store" }, { $setOnInsert: { key: "store" } }, { new: true, upsert: true }); res.json({ settings }); } catch (error) { next(error); } }
export async function updateSettings(req, res, next) { try { const settings = await StoreSettings.findOneAndUpdate({ key: "store" }, { $setOnInsert: { key: "store" } }, { new: true, upsert: true }); const changes = {}; for (const key of ["storeName", "supportEmail", "announcement"]) { if (req.body[key] === undefined) continue; const nextValue = String(req.body[key]).trim(); if (settings[key] !== nextValue) { changes[key] = { from: settings[key], to: nextValue }; settings[key] = nextValue; } } if (Object.keys(changes).length) { await settings.save(); const recent = await AuditLog.findOne({ actor: req.user._id, action: "store_settings_updated", targetType: "settings", createdAt: { $gte: new Date(Date.now() - 60000) } }).sort({ createdAt: -1 }); if (recent) { recent.details = { ...recent.details, ...changes }; await recent.save(); } else await writeAudit(req.user, "store_settings_updated", "settings", settings, changes); } res.json({ settings }); } catch (error) { next(error); } }

export async function transferOwnership(req, res, next) {
  const session = await mongoose.startSession();
  try { const { accountId, phrase, currentPassword } = req.body; if (phrase !== "transfer ownership") return res.status(400).json({ message: "Confirmation phrase does not match" }); const actor = await User.findById(req.user._id).select("+password"); if (!actor || actor.role !== "superadmin" || !(await bcrypt.compare(currentPassword || "", actor.password))) return res.status(403).json({ message: "Current password is incorrect" });
    await session.withTransaction(async () => { const target = await User.findOne({ _id: accountId, role: "admin", isActive: { $ne: false } }).session(session); if (!target) throw Object.assign(new Error("Choose an active admin account"), { statusCode: 400 }); actor.role = "admin"; actor.isOwner = false; await actor.save({ session }); target.role = "superadmin"; target.isOwner = true; await target.save({ session }); await writeAudit(actor, "ownership_transferred", "account", target, { from: actor.email, to: target.email }); }); res.json({ message: "Ownership transferred" });
  } catch (error) { next(error); } finally { await session.endSession(); }
}

export async function listAudit(req, res, next) { try { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); const filter = {}; if (req.query.action) filter.action = req.query.action; if (req.query.actor) filter.actorName = new RegExp(String(req.query.actor), "i"); if (req.query.from || req.query.to) filter.createdAt = { ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00`) } : {}), ...(req.query.to ? { $lte: new Date(`${req.query.to}T23:59:59.999`) } : {}) }; if (req.query.q) { const expression = new RegExp(String(req.query.q), "i"); filter.$or = [{ targetLabel: expression }, { targetId: expression }, { "details.from": expression }, { "details.to": expression }]; } const [items, total] = await Promise.all([AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), AuditLog.countDocuments(filter)]); res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) }); } catch (error) { next(error); } }
export async function listSuperOrders(_req, res, next) { try { res.json({ orders: (await Order.find().sort({ createdAt: -1 }).populate("user", "name email")).map(orderView) }); } catch (error) { next(error); } }
export async function listSuperProducts(_req, res, next) { try { const products = await Product.find().sort({ createdAt: -1 }); res.json({ products: products.map((product) => ({ ...product.toObject(), id: String(product._id), stock: product.inventory.reduce((sum, item) => sum + item.stock, 0), modelCoverage: { uploaded: product.colorVariants.reduce((sum, color) => sum + color.models.length, 0), total: Math.max(1, product.colorVariants.length) * Math.max(1, product.availableBreeds.length) } })) }); } catch (error) { next(error); } }
export async function toggleSuperProduct(req, res, next) { try { const product = await Product.findById(req.params.id); if (!product) return res.status(404).json({ message: "Product not found" }); const before = product.isActive; product.isActive = !product.isActive; await product.save(); await writeAudit(req.user, product.isActive ? "product_shown" : "product_hidden", "product", product, { before, after: product.isActive }); res.json({ product }); } catch (error) { next(error); } }
export async function deleteSuperProduct(req, res, next) { try { const product = await Product.findById(req.params.id); if (!product) return res.status(404).json({ message: "Product not found" }); await product.deleteOne(); await writeAudit(req.user, "product_deleted", "product", product); res.status(204).end(); } catch (error) { next(error); } }
export async function orderTimeline(req, res, next) { try { const logs = await AuditLog.find({ targetType: "order", targetId: req.params.id }).sort({ createdAt: 1 }); res.json({ logs }); } catch (error) { next(error); } }
