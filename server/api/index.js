import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let ready = false;
let initErr = null;

async function init() {
  if (!ready) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      ready = true;
    } catch (e) {
      initErr = e;
    }
  }
}

init();

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
    return res.end(JSON.stringify({ status: "ok" }));
  }

  if (!ready) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = initErr ? 500 : 503;
    return res.end(JSON.stringify({
      message: initErr ? "DB init failed: " + initErr.message : "Initializing, try again"
    }));
  }

  app(req, res);
}
