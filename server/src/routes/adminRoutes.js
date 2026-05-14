import { Router } from "express";
import { listUnverifiedSuppliers, verifySupplier, rejectSupplier } from "../controllers/adminController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/suppliers/pending", verifyToken, requireRole("admin"), listUnverifiedSuppliers);
router.patch("/suppliers/:id/verify", verifyToken, requireRole("admin"), verifySupplier);
router.patch("/suppliers/:id/reject", verifyToken, requireRole("admin"), rejectSupplier);

export default router;