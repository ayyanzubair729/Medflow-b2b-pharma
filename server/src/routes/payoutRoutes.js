import { Router } from "express";
import { listInvoices } from "../controllers/payoutController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/invoices", verifyToken, requireRole("supplier"), listInvoices);

export default router;