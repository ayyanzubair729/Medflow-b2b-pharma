import { Router } from "express";
import { listSuppliers } from "../controllers/supplierDirectoryController.js";

const router = Router();

router.get("/", listSuppliers);

export default router;
