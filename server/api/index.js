import "reflect-metadata";
import { AppDataSource } from "../src/config/data-source.js";
import app from "../src/app.js";

AppDataSource.initialize()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB error:", err));

export default app;
