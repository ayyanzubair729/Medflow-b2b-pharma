import { Router } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../config/data-source.js";
import {
  listMyProducts,
  updateProductVisibility,
  updateProductStock,
  listSupplierOrders,
  advanceOrderStatus,
  createProduct,        // 🔥 add these imports
  updateProduct,        // 🔥
  deleteProduct,        // 🔥
} from "../controllers/supplierController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

// ─── Product CRUD ──────────────────────────────
router.get("/products",                   verifyToken, requireRole("supplier"), listMyProducts);
router.post("/products",                  verifyToken, requireRole("supplier"), createProduct);
router.put("/products/:id",               verifyToken, requireRole("supplier"), updateProduct);
router.delete("/products/:id",            verifyToken, requireRole("supplier"), deleteProduct);
router.patch("/products/:id/visibility",  verifyToken, requireRole("supplier"), updateProductVisibility);
router.patch("/products/:id/stock",       verifyToken, requireRole("supplier"), updateProductStock);

// ─── Orders ────────────────────────────────────
router.get("/orders",                     verifyToken, requireRole("supplier"), listSupplierOrders);
router.patch("/orders/:id/status",        verifyToken, requireRole("supplier"), advanceOrderStatus);
router.post("/orders/:id/advance",        verifyToken, requireRole("supplier"), advanceOrderStatus);

// ─── Stock Alerts ──────────────────────────────
router.get("/alerts", verifyToken, requireRole("supplier"), async (req, res) => {
  try {
    const alerts = await AppDataSource.getRepository("StockAlert").find({
      where: { supplier_id: req.user.id },
      relations: ["product"],
    });
    res.json(alerts);
  } catch (e) {
    console.error("List alerts error:", e);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/alerts", verifyToken, requireRole("supplier"), async (req, res) => {
  try {
    const { product_id, threshold } = req.body;
    if (!product_id || !threshold) {
      return res.status(400).json({ message: "product_id and threshold required." });
    }
    const repo = AppDataSource.getRepository("StockAlert");
    const alert = repo.create({ supplier_id: req.user.id, product_id, threshold });
    await repo.save(alert);
    res.status(201).json(alert);
  } catch (e) {
    console.error("Create alert error:", e);
    res.status(500).json({ message: "Server error." });
  }
});

router.delete("/alerts/:id", verifyToken, requireRole("supplier"), async (req, res) => {
  try {
    await AppDataSource.getRepository("StockAlert").delete({
      id: req.params.id,
      supplier_id: req.user.id,
    });
    res.json({ message: "Alert removed." });
  } catch (e) {
    console.error("Delete alert error:", e);
    res.status(500).json({ message: "Server error." });
  }
});

// ─── Dashboard Summary ─────────────────────────
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueResult = await orderRepo
      .createQueryBuilder("orders")
      .select("COALESCE(SUM(orders.total_amount), 0)", "total")
      .where("orders.supplier_id = :id", { id })
      .andWhere("orders.status = :status", { status: "delivered" })
      .andWhere("orders.updated_at >= :startOfMonth", { startOfMonth })
      .getRawOne();

    res.json({
      active_products,
      open_orders,
      pending_quotes,
      revenue_month: Number(revenueResult?.total || 0),
    });
  } catch (e) {
    console.error("Supplier dashboard error:", e);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;