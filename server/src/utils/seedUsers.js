import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";

const users = [
  { email: "admin@medflow.test", password: "Admin@123", role: UserRole.ADMIN, business_name: "MedFlow Admin", is_verified: true },
  { email: "buyer1@test.com", password: "Buyer@123", role: UserRole.BUYER, business_name: "City Pharma", is_verified: true },
  { email: "buyer2@test.com", password: "Buyer@123", role: UserRole.BUYER, business_name: "MediCare Store", is_verified: true },
  { email: "buyer3@test.com", password: "Buyer@123", role: UserRole.BUYER, business_name: "HealthPlus Pharmacy", is_verified: true },
  { email: "buyer4@test.com", password: "Buyer@123", role: UserRole.BUYER, business_name: "Green Cross Drugstore", is_verified: true },
  { email: "buyer5@test.com", password: "Buyer@123", role: UserRole.BUYER, business_name: "Prime Medical Store", is_verified: true },
  { email: "supplier1@test.com", password: "Supplier@123", role: UserRole.SUPPLIER, business_name: "MediSupply Co", license_number: "SUP-001", is_verified: true },
  { email: "supplier2@test.com", password: "Supplier@123", role: UserRole.SUPPLIER, business_name: "PharmaDistributors", license_number: "SUP-002", is_verified: true },
  { email: "supplier3@test.com", password: "Supplier@123", role: UserRole.SUPPLIER, business_name: "HealthLink Pharma", license_number: "SUP-003", is_verified: true },
  { email: "supplier4@test.com", password: "Supplier@123", role: UserRole.SUPPLIER, business_name: "BioCare Solutions", license_number: "SUP-004", is_verified: true },
  { email: "supplier5@test.com", password: "Supplier@123", role: UserRole.SUPPLIER, business_name: "MedWorld Traders", license_number: "SUP-005", is_verified: true },
];

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(UserSchema);

  for (const u of users) {
    const exists = await repo.findOne({ where: { email: u.email } });
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 12);
      await repo.save(repo.create({ ...u, password_hash: hash }));
      console.log(`Created: ${u.email}`);
    } else {
      console.log(`Skipped (exists): ${u.email}`);
    }
  }

  await AppDataSource.destroy();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
