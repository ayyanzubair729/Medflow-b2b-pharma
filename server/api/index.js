import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let handler;
let initError;

async function getHandler() {
  if (initError) throw initError;
  if (handler) return handler;

  try {
    await AppDataSource.initialize();
    console.log("DB connected");
    const { default: serverless } = await import("serverless-http");
    handler = serverless(app);
    return handler;
  } catch (err) {
    initError = err;
    throw err;
  }
}

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

  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Server initialization failed" });
  }
}
