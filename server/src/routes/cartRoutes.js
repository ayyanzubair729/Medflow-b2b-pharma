import { Router } from "express";
import {
  listCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", verifyToken, requireRole("buyer"), listCartItems);
router.post("/", verifyToken, requireRole("buyer"), addCartItem);
router.put("/:id", verifyToken, requireRole("buyer"), updateCartItem);
router.delete("/:id", verifyToken, requireRole("buyer"), removeCartItem);
router.delete("/", verifyToken, requireRole("buyer"), clearCart);

export default router;
