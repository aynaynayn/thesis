import { Router } from "express";
import { adjustInventory, createProduct, deleteProduct, deleteProductModel, getProduct, listAdminProducts, listProducts, updateProduct, uploadPendingImage, uploadProductImage, uploadProductModel } from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { requireExistingProduct, uploadProductModel as uploadProductModelFile } from "../middleware/modelUploadMiddleware.js";
import { uploadPendingProductImage, uploadProductImage as uploadProductImageFile } from "../middleware/productImageUploadMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/admin/all", protect, authorize("admin"), listAdminProducts);
router.post("/", protect, authorize("admin"), createProduct);
router.post("/image-upload", protect, authorize("admin"), uploadPendingProductImage, uploadPendingImage);
router.post("/:id/image", protect, authorize("admin"), requireExistingProduct, uploadProductImageFile, uploadProductImage);
router.post("/:id/models", protect, authorize("admin"), requireExistingProduct, uploadProductModelFile, uploadProductModel);
router.delete("/:id/models/:breed", protect, authorize("admin"), requireExistingProduct, deleteProductModel);
router.patch("/:id/inventory", protect, authorize("admin"), adjustInventory);
router.patch("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);
router.get("/:id", getProduct);

export default router;
