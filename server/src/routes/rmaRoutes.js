import { Router } from "express";
import { createReturn, listReturns, updateReturnStatus } from "../controllers/rmaController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.post("/", verifyToken, requireRole("buyer"), createReturn);
router.get("/", verifyToken, listReturns);
router.patch("/:id/status", verifyToken, requireRole("supplier"), updateReturnStatus);

export default router;