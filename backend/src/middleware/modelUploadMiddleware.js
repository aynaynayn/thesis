import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import Product from "../models/Product.js";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const uploadsRoot = path.join(backendRoot, "uploads", "models");

function uploadError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function breedFilename(breed) {
  return breed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    const directory = path.join(uploadsRoot, req.params.id);
    fs.mkdir(directory, { recursive: true }, (error) => callback(error, directory));
  },
  filename(req, _file, callback) {
    const filename = breedFilename(req.body.breed || "");
    if (!filename) return callback(uploadError("Breed is required"));
    return callback(null, `${filename}.glb`);
  },
});

export async function requireExistingProduct(req, _res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(Object.assign(new Error("Product not found"), { statusCode: 404 }));
    }
    if (!(await Product.exists({ _id: req.params.id }))) {
      return next(Object.assign(new Error("Product not found"), { statusCode: 404 }));
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

export const uploadProductModel = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (path.extname(file.originalname).toLowerCase() !== ".glb") {
      return callback(uploadError("Only .glb files are allowed"));
    }
    return callback(null, true);
  },
}).single("model");

export function productModelPath(productId, filename) {
  return path.posix.join("uploads", "models", productId, filename);
}

export function absoluteModelPath(modelPath) {
  const absolutePath = path.resolve(backendRoot, modelPath);
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("Invalid model path");
  }
  return absolutePath;
}
