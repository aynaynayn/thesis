import { randomUUID } from "crypto";
import path from "path";
import cloudinary from "../config/cloudinary.js";

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeout;
    const complete = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback(value);
    };
    const stream = cloudinary.uploader.upload_stream(options, (error, asset) => {
      if (error) return complete(reject, error);
      return complete(resolve, asset);
    });

    timeout = setTimeout(() => {
      stream.destroy();
      complete(
        reject,
        Object.assign(
          new Error("Cloud storage did not respond to the model upload in time"),
          { statusCode: 504 },
        ),
      );
    }, 90_000);

    stream.once("error", (error) => complete(reject, error));
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

export async function finalizePendingImage(url, productId) {
  const match = String(url || "").match(/\/upload\/v\d+\/(pawfit\/products\/pending\/[^.?]+)/);
  if (!match) return null;
  const sourcePublicId = match[1];
  const targetPublicId = `pawfit/products/${productId}/${randomUUID()}`;
  const asset = await cloudinary.uploader.rename(sourcePublicId, targetPublicId, {
    resource_type: "image", overwrite: false, invalidate: true,
  });
  return { url: asset.secure_url, publicId: asset.public_id };
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
