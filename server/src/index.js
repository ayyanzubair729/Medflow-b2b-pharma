import "reflect-metadata";
import { AppDataSource } from "./config/data-source.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL connected via TypeORM.");

    await AppDataSource.runMigrations();
    console.log("✅ Migrations completed.");

    app.listen(PORT, () => {
      console.log(`🚀 MedFlow server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

start();
