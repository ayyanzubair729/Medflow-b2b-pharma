import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let handler;

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function (req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.url === "/api/health") {
    res.status(200).json({ status: "ok", message: "MedFlow API is running." });
    return;
  }

  try {
    if (!handler) {
      await AppDataSource.initialize();
      const { default: serverless } = await import("serverless-http");
      handler = serverless(app);
    }
    return handler(req, res);
  } catch (err) {
    console.error("Init error:", err);
    res.status(500).json({ error: "Server initialization failed" });
  }
}
