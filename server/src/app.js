import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import passport from "passport";
import "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import reorderRoutes from "./routes/reorderRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import supplierDirectoryRoutes from "./routes/supplierDirectoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rmaRoutes from "./routes/rmaRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(passport.initialize());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "MedFlow API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/reorder", reorderRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/suppliers", supplierDirectoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rma", rmaRoutes);
app.use("/api/payouts", payoutRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error(err?.stack || err);
  res.status(500).json({ message: "Internal server error." });
});

export default app;