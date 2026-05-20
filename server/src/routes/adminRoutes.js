import { Router } from "express";
import {
	listUnverifiedSuppliers,
	verifySupplier,
	rejectSupplier,
	getAdminOverview,
	listUsers,
	updateUserStatus,
	listSuppliersAdmin,
	listProductsAdmin,
	updateProductStatus,
	listReturnsAdmin,
	updateReturnStatusAdmin,
	cancelOrderAdmin,
} from "../controllers/adminController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

router.get("/overview", verifyToken, requireRole("admin"), getAdminOverview);

router.get("/users", verifyToken, requireRole("admin"), listUsers);
router.patch("/users/:id/status", verifyToken, requireRole("admin"), updateUserStatus);

router.get("/suppliers", verifyToken, requireRole("admin"), listSuppliersAdmin);
router.get("/suppliers/pending", verifyToken, requireRole("admin"), listUnverifiedSuppliers);
router.patch("/suppliers/:id/verify", verifyToken, requireRole("admin"), verifySupplier);
router.patch("/suppliers/:id/reject", verifyToken, requireRole("admin"), rejectSupplier);

router.get("/products", verifyToken, requireRole("admin"), listProductsAdmin);
router.patch("/products/:id/status", verifyToken, requireRole("admin"), updateProductStatus);

router.get("/returns", verifyToken, requireRole("admin"), listReturnsAdmin);
router.patch("/returns/:id/status", verifyToken, requireRole("admin"), updateReturnStatusAdmin);

router.patch("/orders/:id/cancel", verifyToken, requireRole("admin"), cancelOrderAdmin);

export default router;