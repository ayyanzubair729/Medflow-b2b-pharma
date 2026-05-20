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

export default async function (req, res) {
  const h = await getHandler();
  return h(req, res);
}
