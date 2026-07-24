import { Router } from "express";
import { adjustInventory, createProduct, deleteProduct, getProduct, listAdminProducts, listProducts, updateProduct } from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/admin/all", protect, authorize("admin"), listAdminProducts);
router.post("/", protect, authorize("admin"), createProduct);
router.patch("/:id/inventory", protect, authorize("admin"), adjustInventory);
router.patch("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);
router.get("/:id", getProduct);

export default router;
