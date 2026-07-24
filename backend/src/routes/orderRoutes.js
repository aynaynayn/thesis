import { Router } from "express";
import { cancelMyOrder, createOrder, getMyOrder, listAdminOrders, listMyOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);
router.post("/", createOrder);
router.get("/", listMyOrders);
router.get("/admin/all", authorize("admin"), listAdminOrders);
router.patch("/admin/:id/status", authorize("admin"), updateOrderStatus);
router.get("/:id", getMyOrder);
router.patch("/:id/cancel", cancelMyOrder);
export default router;
