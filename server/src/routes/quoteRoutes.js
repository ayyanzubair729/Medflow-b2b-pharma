import { Router } from "express";
import {
  listQuotes,
  getQuoteById,
  createQuote,
  respondToQuote,
  acceptQuote,
  rejectQuote,
} from "../controllers/quoteController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/", verifyToken, listQuotes);
router.get("/:id", verifyToken, getQuoteById);
router.post("/", verifyToken, requireRole("buyer"), createQuote);
router.patch("/:id/respond", verifyToken, requireRole("supplier"), respondToQuote);
router.patch("/:id/accept", verifyToken, requireRole("buyer"), acceptQuote);
router.patch("/:id/reject", verifyToken, requireRole("buyer"), rejectQuote);

export default router;
