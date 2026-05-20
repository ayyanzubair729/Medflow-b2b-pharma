import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

const dbReady = AppDataSource.isInitialized
  ? Promise.resolve()
  : AppDataSource.initialize().catch((e) => {
      console.error("DB init error:", e);
      return Promise.reject(e);
    });

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end("");
  }

  if (req.path === "/api/health") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify({ status: "ok" }));
  }

  try {
    await dbReady;
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    return res.end(JSON.stringify({ message: "Database connection failed" }));
  }

  app(req, res);
}
