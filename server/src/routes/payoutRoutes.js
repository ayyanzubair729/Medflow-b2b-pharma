import { Router } from "express";
import { listInvoices, downloadInvoice } from "../controllers/payoutController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/invoices", verifyToken, requireRole("supplier"), listInvoices);
router.get("/invoices/:id/pdf", verifyToken, requireRole("supplier"), downloadInvoice);

export default router;