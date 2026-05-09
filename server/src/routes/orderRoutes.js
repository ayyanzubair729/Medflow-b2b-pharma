import { Router } from "express";
import {
  listOrders,
  getOrderById,
  createOrderFromCart,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", verifyToken, listOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/", verifyToken, requireRole("buyer"), createOrderFromCart);
router.patch("/:id/status", verifyToken, requireRole("supplier", "admin"), updateOrderStatus);
router.patch("/:id/cancel", verifyToken, requireRole("buyer"), cancelOrder);

export default router;
