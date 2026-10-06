import { Router } from "express";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createAdmin, createCategory, deleteCategory, deleteSuperProduct, getSettings, listAccounts, listAudit, listCategories, listSuperOrders, listSuperProducts, orderTimeline, overview, renameCategory, toggleSuperProduct, transferOwnership, updateAccount, updateSettings } from "../controllers/superAdminController.js";

const router = Router();
router.use(protect, authorize("superadmin"));
router.get("/overview", overview);
router.get("/accounts", listAccounts); router.post("/accounts", createAdmin); router.patch("/accounts/:id", updateAccount);
router.get("/orders", listSuperOrders);
router.get("/orders/:id/timeline", orderTimeline);
router.get("/products", listSuperProducts); router.patch("/products/:id/toggle", toggleSuperProduct); router.delete("/products/:id", deleteSuperProduct);
router.get("/categories", listCategories); router.post("/categories", createCategory); router.patch("/categories/:id", renameCategory); router.delete("/categories/:id", deleteCategory);
router.get("/settings", getSettings); router.patch("/settings", updateSettings); router.post("/settings/transfer-ownership", transferOwnership);
router.get("/audit", listAudit);
export default router;
