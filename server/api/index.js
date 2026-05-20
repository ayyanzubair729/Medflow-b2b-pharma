import "reflect-metadata";
import serverless from "serverless-http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let handler;

async function getHandler() {
  if (!handler) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    handler = serverless(app);
  }
  return handler;
}

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end("");
  }

  if (req.path === "/api/health") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify({ status: "ok", message: "MedFlow API is running." }));
  }

  try {
    const h = await getHandler();
    return h(req, res);
  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 503;
    return res.end(JSON.stringify({ message: "Initializing: " + e.message }));
  }
}
