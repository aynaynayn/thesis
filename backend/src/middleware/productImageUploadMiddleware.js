import multer from "multer";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function imageFileFilter(_req, file, callback) {
  const extension = file.originalname
    .slice(file.originalname.lastIndexOf("."))
    .toLowerCase();

  if (
    !allowedExtensions.has(extension) ||
    !allowedMimeTypes.has(file.mimetype)
  ) {
    return callback(
      uploadError("Only JPEG, PNG, and WebP image files are allowed"),
    );
  }

  return callback(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
});

export const uploadProductImage = upload.single("image");
export const uploadPendingProductImage = upload.single("image");
