import "reflect-metadata";
import { AppDataSource } from "./config/data-source.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ PostgreSQL connected via TypeORM.");
    app.listen(PORT, () => {
      console.log(`🚀 MedFlow server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });
