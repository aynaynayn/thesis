import { randomUUID } from "crypto";
import path from "path";
import cloudinary from "../config/cloudinary.js";

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, asset) => {
      if (error) return reject(error);
      return resolve(asset);
    });
    stream.end(buffer);
  });
}

export function uploadImageBuffer(buffer, folder) {
  return uploadBuffer(buffer, {
    resource_type: "image",
    folder,
    public_id: randomUUID(),
    overwrite: false,
  });
}

export function uploadModelBuffer(buffer, folder, originalName) {
  const extension = path.extname(originalName).toLowerCase() || ".glb";
  return uploadBuffer(buffer, {
    resource_type: "raw",
    folder,
    public_id: `${randomUUID()}${extension}`,
    overwrite: false,
  });
}

export async function deleteImageAsset(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

export async function deleteModelAsset(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    invalidate: true,
  });
}
