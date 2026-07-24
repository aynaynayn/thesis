import mongoose from "mongoose";
import Product from "../models/Product.js";

const editableFields = ["name", "slug", "description", "category", "price", "image", "images", "featured", "isActive", "availableBreeds", "sizeCharts", "inventory"];

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function uniqueSlug(value, omitId) {
  const base = slugify(value);
  if (!base) throw Object.assign(new Error("A valid name or slug is required"), { statusCode: 400 });
  let candidate = base;
  let counter = 2;
  while (await Product.exists({ slug: candidate, ...(omitId ? { _id: { $ne: omitId } } : {}) })) candidate = `${base}-${counter++}`;
  return candidate;
}

function validateInventory(inventory = []) {
  if (!Array.isArray(inventory) || inventory.length === 0) throw Object.assign(new Error("At least one inventory variant is required"), { statusCode: 400 });
  const variants = new Set();
  const skus = new Set();
  for (const item of inventory) {
    const breed = item.breed?.trim();
    const size = item.size?.trim().toUpperCase();
    const sku = item.sku?.trim().toUpperCase();
    if (!breed || !size || !sku) throw Object.assign(new Error("Every inventory item needs breed, size, and SKU"), { statusCode: 400 });
    if (!Number.isInteger(item.stock) || item.stock < 0) throw Object.assign(new Error("Inventory stock must be a non-negative whole number"), { statusCode: 400 });
    const variant = `${breed}:${size}`;
    if (variants.has(variant) || skus.has(sku)) throw Object.assign(new Error("Inventory breed/size and SKU values must be unique per product"), { statusCode: 400 });
    variants.add(variant);
    skus.add(sku);
    item.breed = breed;
    item.size = size;
    item.sku = sku;
  }
}

function normalizeProductData(data) {
  validateInventory(data.inventory);
  const breeds = [...new Set(data.inventory.map((item) => item.breed))];
  data.availableBreeds = breeds;
  if (data.sizeCharts !== undefined && !Array.isArray(data.sizeCharts)) {
    throw Object.assign(new Error("Size charts must be an array"), { statusCode: 400 });
  }
  if (data.sizeCharts) {
    for (const chart of data.sizeCharts) {
      if (!breeds.includes(chart.breed)) throw Object.assign(new Error("Size charts can only be created for available breeds"), { statusCode: 400 });
    }
  }
}

function publicFilter(query) {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.breed) filter.availableBreeds = query.breed;
  if (query.featured === "true") filter.featured = true;
  if (query.q) filter.$text = { $search: query.q };
  return filter;
}

export async function listProducts(req, res, next) {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 24, 1), 100);
    const filter = publicFilter(req.query);
    const [products, total] = await Promise.all([
      Product.find(filter).sort(req.query.q ? { score: { $meta: "textScore" } } : { featured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

export async function getProduct(req, res, next) {
  try {
    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
      : { slug: req.params.id };
    const product = await Product.findOne({ ...lookup, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) { next(error); }
}

export async function listAdminProducts(_req, res, next) {
  try { res.json({ products: await Product.find().sort({ createdAt: -1 }) }); } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const data = Object.fromEntries(editableFields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    if (!data.name || !data.description || !data.category || !data.image || data.price === undefined) return res.status(400).json({ message: "Name, description, category, image, and price are required" });
    data.slug = await uniqueSlug(data.slug || data.name);
    normalizeProductData(data);
    const product = await Product.create(data);
    res.status(201).json({ product });
  } catch (error) { next(error); }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    for (const field of editableFields) if (req.body[field] !== undefined && field !== "slug") product[field] = req.body[field];
    if (req.body.slug !== undefined || req.body.name !== undefined) product.slug = await uniqueSlug(req.body.slug || product.name, product._id);
    normalizeProductData(product);
    await product.save();
    res.json({ product });
  } catch (error) { next(error); }
}

export async function adjustInventory(req, res, next) {
  try {
    const { breed, size, quantity, reason } = req.body;
    if (!breed || !size || !Number.isInteger(quantity) || quantity === 0) return res.status(400).json({ message: "Breed, size, and a non-zero whole-number quantity are required" });
    const normalizedSize = size.trim().toUpperCase();
    const stockConstraint = quantity < 0 ? { $gte: Math.abs(quantity) } : { $gte: 0 };
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, inventory: { $elemMatch: { breed: breed.trim(), size: normalizedSize, stock: stockConstraint } } },
      { $inc: { "inventory.$.stock": quantity } },
      { new: true, runValidators: true },
    );
    if (!product) return res.status(409).json({ message: "Inventory variant was not found or has insufficient stock" });
    res.json({ product, adjustment: { breed: breed.trim(), size: normalizedSize, quantity, reason: reason?.trim() || null } });
  } catch (error) { next(error); }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.isActive = false;
    await product.save();
    res.status(204).end();
  } catch (error) { next(error); }
}
