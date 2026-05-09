import { Router } from "express";
import { reorderFromOrder } from "../controllers/reorderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.post("/orders/:id", verifyToken, requireRole("buyer"), reorderFromOrder);

export default router;
