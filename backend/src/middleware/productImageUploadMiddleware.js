import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import multer from "multer";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const uploadsRoot = path.join(backendRoot, "uploads", "images");
const pendingUploadsRoot = path.join(uploadsRoot, "pending");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    const directory = path.join(uploadsRoot, req.params.id);
    fs.mkdir(directory, { recursive: true }, (error) => callback(error, directory));
  },
  filename(_req, file, callback) {
    callback(null, `product${path.extname(file.originalname).toLowerCase()}`);
  },
});

const pendingStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    fs.mkdir(pendingUploadsRoot, { recursive: true }, (error) => callback(error, pendingUploadsRoot));
  },
  filename(_req, file, callback) {
    callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function imageFileFilter(_req, file, callback) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
    return callback(uploadError("Only JPEG, PNG, and WebP image files are allowed"));
  }
  return callback(null, true);
}

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
}).single("image");

export const uploadPendingProductImage = multer({
  storage: pendingStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
}).single("image");

export function productImagePath(productId, filename) {
  return `/${path.posix.join("uploads", "images", productId, filename)}`;
}

export function pendingProductImagePath(filename) {
  return `/${path.posix.join("uploads", "images", "pending", filename)}`;
}

function relativePublicPath(filePath) {
  return filePath.replace(/^[/\\]+/, "");
}

export function absoluteProductImagePath(imagePath) {
  const absolutePath = path.resolve(backendRoot, relativePublicPath(imagePath));
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error("Invalid product image path");
  }
  return absolutePath;
}

export function isPendingProductImagePath(imagePath) {
  return typeof imagePath === "string" && imagePath.startsWith("/uploads/images/pending/");
}
