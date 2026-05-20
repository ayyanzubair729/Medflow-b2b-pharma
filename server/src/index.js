import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./config/data-source.js";
import { UserSchema, UserRole } from "./entities/User.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

async function seed() {
  const userRepo = AppDataSource.getRepository(UserSchema);

  const adminEmail = "admin@medflow.test";
  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash("Admin@123", 12);
    await userRepo.save(
      userRepo.create({
        email: adminEmail,
        password_hash: hash,
        role: UserRole.ADMIN,
        business_name: "MedFlow Admin",
        is_verified: true,
        is_active: true,
      })
    );
    console.log("✅ Admin account created.");
  }
}

async function start() {
  try {
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL connected via TypeORM.");

    await AppDataSource.runMigrations();
    console.log("✅ Migrations completed.");

    await seed();

    app.listen(PORT, () => {
      console.log(`🚀 MedFlow server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

start();
