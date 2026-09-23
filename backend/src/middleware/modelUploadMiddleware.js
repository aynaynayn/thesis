import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import Product from "../models/Product.js";

function uploadError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

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
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (path.extname(file.originalname).toLowerCase() !== ".glb") {
      return callback(uploadError("Only .glb files are allowed"));
    }
    return callback(null, true);
  },
}).single("model");
