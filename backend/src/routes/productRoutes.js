import { Router } from "express";
import { adjustInventory, createProduct, deleteProduct, deleteProductModel, getProduct, listAdminProducts, listProducts, updateProduct, uploadPendingImage, uploadProductImage, uploadProductModel } from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { requireExistingProduct, uploadProductModel as uploadProductModelFile } from "../middleware/modelUploadMiddleware.js";
import { uploadPendingProductImage, uploadProductImage as uploadProductImageFile } from "../middleware/productImageUploadMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/admin/all", protect, authorize("admin", "superadmin"), listAdminProducts);
router.post("/", protect, authorize("admin", "superadmin"), createProduct);
router.post("/image-upload", protect, authorize("admin", "superadmin"), uploadPendingProductImage, uploadPendingImage);
router.post("/:id/image", protect, authorize("admin", "superadmin"), requireExistingProduct, uploadProductImageFile, uploadProductImage);
router.post("/:id/models", protect, authorize("admin", "superadmin"), requireExistingProduct, uploadProductModelFile, uploadProductModel);
router.delete("/:id/models/:breed", protect, authorize("admin", "superadmin"), requireExistingProduct, deleteProductModel);
router.patch("/:id/inventory", protect, authorize("admin", "superadmin"), adjustInventory);
router.patch("/:id", protect, authorize("admin", "superadmin"), updateProduct);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteProduct);
router.get("/:id", getProduct);

export default router;
