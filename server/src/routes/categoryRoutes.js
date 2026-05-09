import { Router } from "express";
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategoryById);
router.post("/", verifyToken, requireRole("admin"), createCategory);
router.put("/:id", verifyToken, requireRole("admin"), updateCategory);

export default router;
