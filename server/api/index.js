import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let handler;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function (req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
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
    res.status(500).json({ error: "Server init failed" });
  }
}
