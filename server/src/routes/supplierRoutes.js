import { Router } from "express";
import {
  listMyProducts,
  updateProductVisibility,
  updateProductStock,
} from "../controllers/supplierController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/products", verifyToken, requireRole("supplier"), listMyProducts);
router.patch("/products/:id/visibility", verifyToken, requireRole("supplier"), updateProductVisibility);
router.patch("/products/:id/stock", verifyToken, requireRole("supplier"), updateProductStock);

export default router;
