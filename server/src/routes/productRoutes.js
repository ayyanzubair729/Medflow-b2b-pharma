import { Router } from "express";
import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, requireRole("supplier", "admin"), createProduct);
router.put("/:id", verifyToken, requireRole("supplier", "admin"), updateProduct);

export default router;
