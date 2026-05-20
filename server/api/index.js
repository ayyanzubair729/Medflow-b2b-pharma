import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

let handler;

async function getHandler() {
  if (!handler) {
    await AppDataSource.initialize();
    console.log("DB connected");
    await AppDataSource.runMigrations();
    console.log("Migrations done");
    const { default: serverless } = await import("serverless-http");
    handler = serverless(app);
  }
  return handler;
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

  const h = await getHandler();
  return h(req, res);
}
