import mongoose from "mongoose";

import Product from "../models/Product.js";
import {
  deleteImageAsset,
  deleteModelAsset,
  uploadImageBuffer,
  uploadModelBuffer,
} from "../utils/cloudinaryAssets.js";
const editableFields = [
  "name",
  "slug",
  "description",
  "category",
  "price",
  "image",
  "imageCloudinaryPublicId",
  "images",
  "featured",
  "isActive",
  "availableBreeds",
  "sizeCharts",
  "sizeSpecs",
  "inventory",
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(value, omitId) {
  const base = slugify(value);
  if (!base)
    throw Object.assign(new Error("A valid name or slug is required"), {
      statusCode: 400,
    });
  let candidate = base;
  let counter = 2;
  while (
    await Product.exists({
      slug: candidate,
      ...(omitId ? { _id: { $ne: omitId } } : {}),
    })
  )
    candidate = `${base}-${counter++}`;
  return candidate;
}

function validateInventory(inventory = []) {
  if (!Array.isArray(inventory) || inventory.length === 0)
    throw Object.assign(
      new Error("At least one inventory variant is required"),
      { statusCode: 400 },
    );
  const sizes = new Set();
  const skus = new Set();
  for (const item of inventory) {
    const legacyBreed = item.breed?.trim();
    const size = item.size?.trim().toUpperCase();
    const sku = item.sku?.trim().toUpperCase();
    if (!size || !sku)
      throw Object.assign(
        new Error("Every inventory item needs size and SKU"),
        { statusCode: 400 },
      );
    if (!Number.isInteger(item.stock) || item.stock < 0)
      throw Object.assign(
        new Error("Inventory stock must be a non-negative whole number"),
        { statusCode: 400 },
      );
    if ((sizes.has(size) && !legacyBreed) || skus.has(sku))
      throw Object.assign(
        new Error("Inventory size and SKU values must be unique per product"),
        { statusCode: 400 },
      );
    sizes.add(size);
    skus.add(sku);
    if (legacyBreed) item.breed = legacyBreed;
    item.size = size;
    item.sku = sku;
  }
}

function deriveAvailableBreeds(data) {
  return [
    ...new Set([
      ...(data.models || []).map((model) => model.breed?.trim()),
      ...(data.sizeCharts || []).map((chart) => chart.breed?.trim()),
    ].filter(Boolean)),
  ];
}

function normalizeProductData(data) {
  validateInventory(data.inventory);
  if (data.sizeCharts !== undefined && !Array.isArray(data.sizeCharts)) {
    throw Object.assign(new Error("Size charts must be an array"), {
      statusCode: 400,
    });
  }
  if (data.sizeCharts) {
    for (const chart of data.sizeCharts) chart.breed = String(chart.breed || "").trim();
  }
  if (data.sizeSpecs !== undefined && !Array.isArray(data.sizeSpecs))
    throw Object.assign(new Error("Size specifications must be an array"), {
      statusCode: 400,
    });
  const knownSizes = new Set();
  for (const spec of data.sizeSpecs || []) {
    spec.size = String(spec.size || "")
      .trim()
      .toUpperCase();
    if (!spec.size || knownSizes.has(spec.size))
      throw Object.assign(
        new Error("Each product size specification needs a unique size"),
        { statusCode: 400 },
      );
    knownSizes.add(spec.size);
    for (const [minKey, maxKey, label] of [
      ["neckMinCm", "neckMaxCm", "neck"],
      ["chestMinCm", "chestMaxCm", "chest"],
      ["backMinCm", "backMaxCm", "back"],
    ]) {
      const min = Number(spec[minKey]);
      const max = Number(spec[maxKey]);
      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        min < 0 ||
        max < 0 ||
        min > max
      )
        throw Object.assign(
          new Error(`${spec.size} needs a valid ${label} minimum and maximum`),
          { statusCode: 400 },
        );
      spec[minKey] = min;
      spec[maxKey] = max;
    }
  }
  data.availableBreeds = deriveAvailableBreeds(data);
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
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 24, 1),
      100,
    );
    const filter = publicFilter(req.query);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(
          req.query.q
            ? { score: { $meta: "textScore" } }
            : { featured: -1, createdAt: -1 },
        )
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
      : { slug: req.params.id };
    const product = await Product.findOne({ ...lookup, isActive: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

export async function listAdminProducts(_req, res, next) {
  try {
    res.json({ products: await Product.find().sort({ createdAt: -1 }) });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  let createdProduct;
  let uploadedImagePublicId;
  try {
    const data = Object.fromEntries(
      editableFields
        .filter((key) => req.body[key] !== undefined)
        .map((key) => [key, req.body[key]]),
    );
    if (
      !data.name ||
      !data.description ||
      !data.category ||
      !data.image ||
      data.price === undefined
    )
      return res.status(400).json({
        message: "Name, description, category, image, and price are required",
      });
    data.slug = await uniqueSlug(data.slug || data.name);
    normalizeProductData(data);
    uploadedImagePublicId = data.imageCloudinaryPublicId;

    createdProduct = await Product.create(data);

    res.status(201).json({ product: createdProduct });
  } catch (error) {
    if (createdProduct)
      await Product.deleteOne({ _id: createdProduct._id }).catch(() => {});
    await deleteImageAsset(uploadedImagePublicId).catch(() => {});
    next(error);
  }
}

export async function uploadPendingImage(req, res, next) {
  try {
    if (!req.file) {
      throw Object.assign(new Error("A product image file is required"), {
        statusCode: 400,
      });
    }

    console.log("IMAGE UPLOAD START", {
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: Boolean(req.file.buffer),
    });

    const asset = await uploadImageBuffer(
      req.file.buffer,
      "pawfit/products/pending",
    );

    console.log("CLOUDINARY UPLOAD SUCCESS", {
      publicId: asset.public_id,
      url: asset.secure_url,
    });

    res.status(201).json({
      imagePath: asset.secure_url,
      imageCloudinaryPublicId: asset.public_id,
    });
  } catch (error) {
    console.error("CLOUDINARY IMAGE UPLOAD FAILED:", error);
    next(error);
  }
}

export async function uploadProductImage(req, res, next) {
  let uploadedPublicId;
  try {
    if (!req.file) {
      throw Object.assign(new Error("A product image file is required"), {
        statusCode: 400,
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      throw Object.assign(new Error("Product not found"), { statusCode: 404 });
    }

    const asset = await uploadImageBuffer(
      req.file.buffer,
      `pawfit/products/${product._id}`,
    );

    uploadedPublicId = asset.public_id;
    const previousPublicId = product.imageCloudinaryPublicId;

    product.image = asset.secure_url;
    product.imageCloudinaryPublicId = asset.public_id;
    await product.save();

    await deleteImageAsset(previousPublicId).catch(() => {});

    res.status(200).json({ product });
  } catch (error) {
    await deleteImageAsset(uploadedPublicId).catch(() => {});
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    for (const field of editableFields)
      if (req.body[field] !== undefined && field !== "slug")
        product[field] = req.body[field];
    if (req.body.slug !== undefined || req.body.name !== undefined)
      product.slug = await uniqueSlug(
        req.body.slug || product.name,
        product._id,
      );
    normalizeProductData(product);
    await product.save();
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

export async function adjustInventory(req, res, next) {
  try {
    const { size, quantity, reason } = req.body;
    if (!size || !Number.isInteger(quantity) || quantity === 0)
      return res.status(400).json({
        message: "Size and a non-zero whole-number quantity are required",
      });
    const normalizedSize = size.trim().toUpperCase();
    const stockConstraint =
      quantity < 0 ? { $gte: Math.abs(quantity) } : { $gte: 0 };
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        inventory: {
          $elemMatch: { size: normalizedSize, stock: stockConstraint },
        },
      },
      { $inc: { "inventory.$.stock": quantity } },
      { new: true, runValidators: true },
    );
    if (!product)
      return res.status(409).json({
        message: "Inventory variant was not found or has insufficient stock",
      });
    res.json({
      product,
      adjustment: {
        size: normalizedSize,
        quantity,
        reason: reason?.trim() || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadProductModel(req, res, next) {
  let uploadedPublicId;
  try {
    const breed = req.body.breed?.trim();
    if (!breed)
      throw Object.assign(new Error("Breed is required"), { statusCode: 400 });
    if (!req.file)
      throw Object.assign(new Error("A GLB model file is required"), {
        statusCode: 400,
      });

    const product = await Product.findById(req.params.id);
    if (!product)
      throw Object.assign(new Error("Product not found"), { statusCode: 404 });

    const asset = await uploadModelBuffer(
      req.file.buffer,
      `pawfit/products/${product._id}/models`,
      req.file.originalname,
    );
    uploadedPublicId = asset.public_id;
    const existingIndex = product.models.findIndex(
      (model) => model.breed.toLowerCase() === breed.toLowerCase(),
    );
    const isReplacement = existingIndex !== -1;
    const previousPublicId =
      existingIndex === -1
        ? null
        : product.models[existingIndex].cloudinaryPublicId;

    if (existingIndex === -1)
      product.models.push({
        breed,
        modelPath: asset.secure_url,
        cloudinaryPublicId: asset.public_id,
      });
    else
      product.models[existingIndex] = {
        breed,
        modelPath: asset.secure_url,
        cloudinaryPublicId: asset.public_id,
      };

    product.availableBreeds = deriveAvailableBreeds(product);
    await product.save();
    await deleteModelAsset(previousPublicId).catch(() => {});

    res.status(isReplacement ? 200 : 201).json({
      product,
      model: product.models.find(
        (model) => model.breed.toLowerCase() === breed.toLowerCase(),
      ),
    });
  } catch (error) {
    await deleteModelAsset(uploadedPublicId).catch(() => {});
    next(error);
  }
}

export async function deleteProductModel(req, res, next) {
  try {
    const breed = decodeURIComponent(req.params.breed).trim();
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const index = product.models.findIndex(
      (model) => model.breed.toLowerCase() === breed.toLowerCase(),
    );
    if (index === -1)
      return res.status(404).json({ message: "3D model not found" });

    const [model] = product.models.splice(index, 1);
    product.availableBreeds = deriveAvailableBreeds(product);
    await product.save();
    await deleteModelAsset(model.cloudinaryPublicId).catch(() => {});
    res.json({ product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Product.deleteOne({ _id: product._id });
    await Promise.all([
      deleteImageAsset(product.imageCloudinaryPublicId).catch(() => {}),
      ...product.models.map((model) =>
        deleteModelAsset(model.cloudinaryPublicId).catch(() => {}),
      ),
    ]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
