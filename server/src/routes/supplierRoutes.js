import { Router } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import {
  listMyProducts,
  updateProductVisibility,
  updateProductStock,
  listSupplierOrders,
  advanceOrderStatus,
} from "../controllers/supplierController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

// Products
router.get("/products",                   verifyToken, requireRole("supplier"), listMyProducts);
router.patch("/products/:id/visibility",  verifyToken, requireRole("supplier"), updateProductVisibility);
router.patch("/products/:id/stock",       verifyToken, requireRole("supplier"), updateProductStock);

// Orders
router.get("/orders",                     verifyToken, requireRole("supplier"), listSupplierOrders);
router.patch("/orders/:id/status",        verifyToken, requireRole("supplier"), advanceOrderStatus);

// Supplier dashboard summary
router.get("/dashboard", verifyToken, requireRole("supplier"), async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: "Not authenticated." });

    const productRepo = AppDataSource.getRepository("Product");
    const orderRepo   = AppDataSource.getRepository("Order");
    const quoteRepo   = AppDataSource.getRepository("QuoteRequest");

    const [active_products, open_orders, pending_quotes] = await Promise.all([
      productRepo.count({ where: { supplier_id: id, is_active: true } }),
      orderRepo.count({ where: { supplier_id: id, status: In(["placed", "confirmed", "shipped"]) } }),
      quoteRepo.count({ where: { supplier_id: id, status: "pending" } }),
    ]);

    res.json({ active_products, open_orders, pending_quotes, revenue_month: 0 });
  } catch (e) {
    console.error("Supplier dashboard error:", e);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;