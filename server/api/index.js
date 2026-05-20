import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let dbReady = false;
let dbError = null;

AppDataSource.initialize()
  .then(() => { dbReady = true; console.log("DB connected"); })
  .catch((err) => { dbError = err; console.error("DB error:", err); });

app.use((req, res, next) => {
  if (req.path === "/api/health") return next();
  if (!dbReady && !dbError) {
    return res.status(503).json({ message: "Server initializing, retry in a moment" });
  }
  if (dbError) {
    return res.status(500).json({ message: "Database connection failed" });
  }
  next();
});

export default app;
