import "reflect-metadata";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";
import { CategorySchema } from "../entities/Category.js";
import { ProductSchema, ProductUnit, StockStatus } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";

dotenv.config();

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const categories = [
  { name: "Pain Management", description: "Analgesics and fever reducers" },
  { name: "Antibiotics", description: "Broad spectrum antibacterial therapies" },
  { name: "Cardiology", description: "Cardiovascular treatments and controls" },
  { name: "Diabetes Care", description: "Glucose management and insulin care" },
  { name: "Dermatology", description: "Skin care and topical treatments" },
  { name: "Respiratory", description: "Respiratory and allergy support" },
];

const products = [
  {
    name: "Paracetamol 500mg",
    sku: "MF-PARA-500",
    category: "Pain Management",
    unit: ProductUnit.BOX,
    stock_quantity: 1200,
    stock_status: StockStatus.IN_STOCK,
    tiers: [
      { min: 50, max: 199, price: 980 },
      { min: 200, max: 499, price: 940 },
      { min: 500, max: null, price: 910 },
    ],
  },
  {
    name: "Azithromycin 250mg",
    sku: "MF-AZI-250",
    category: "Antibiotics",
    unit: ProductUnit.BOX,
    stock_quantity: 620,
    stock_status: StockStatus.IN_STOCK,
    tiers: [
      { min: 30, max: 99, price: 2550 },
      { min: 100, max: 249, price: 2400 },
      { min: 250, max: null, price: 2290 },
    ],
  },
  {
    name: "Metformin 500mg",
    sku: "MF-MET-500",
    category: "Diabetes Care",
    unit: ProductUnit.BOX,
    stock_quantity: 840,
    stock_status: StockStatus.IN_STOCK,
    tiers: [
      { min: 40, max: 149, price: 2000 },
      { min: 150, max: 399, price: 1880 },
      { min: 400, max: null, price: 1750 },
    ],
  },
  {
    name: "Atorvastatin 20mg",
    sku: "MF-ATOR-20",
    category: "Cardiology",
    unit: ProductUnit.BOX,
    stock_quantity: 500,
    stock_status: StockStatus.LOW_STOCK,
    tiers: [
      { min: 30, max: 119, price: 2650 },
      { min: 120, max: 299, price: 2480 },
      { min: 300, max: null, price: 2325 },
    ],
  },
  {
    name: "Cetirizine 10mg",
    sku: "MF-CET-10",
    category: "Respiratory",
    unit: ProductUnit.BOX,
    stock_quantity: 950,
    stock_status: StockStatus.IN_STOCK,
    tiers: [
      { min: 40, max: 149, price: 1450 },
      { min: 150, max: 399, price: 1320 },
      { min: 400, max: null, price: 1210 },
    ],
  },
  {
    name: "Hydrocortisone Cream",
    sku: "MF-HYD-CRM",
    category: "Dermatology",
    unit: ProductUnit.PACK,
    stock_quantity: 420,
    stock_status: StockStatus.LOW_STOCK,
    tiers: [
      { min: 20, max: 79, price: 3600 },
      { min: 80, max: 199, price: 3350 },
      { min: 200, max: null, price: 3180 },
    ],
  },
];

const seed = async () => {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(UserSchema);
  const categoryRepo = AppDataSource.getRepository(CategorySchema);
  const productRepo = AppDataSource.getRepository(ProductSchema);
  const priceTierRepo = AppDataSource.getRepository(PriceTierSchema);

  const supplierEmail = "supplier@medflow.test";
  let supplier = await userRepo.findOne({ where: { email: supplierEmail } });

  if (!supplier) {
    const password_hash = await bcrypt.hash("Supplier@123", 12);
    supplier = userRepo.create({
      email: supplierEmail,
      password_hash,
      role: UserRole.SUPPLIER,
      business_name: "MedFlow Verified Supplier",
      license_number: "SUP-0001",
      phone: "+92 300 555 0000",
      address: "Karachi, Pakistan",
      is_verified: true,
      is_active: true,
    });
    await userRepo.save(supplier);
  }

  const categoryMap = new Map();
  for (const entry of categories) {
    const slug = slugify(entry.name);
    let category = await categoryRepo.findOne({ where: [{ slug }, { name: entry.name }] });
    if (!category) {
      category = categoryRepo.create({
        name: entry.name,
        slug,
        description: entry.description,
        is_active: true,
      });
      await categoryRepo.save(category);
    }
    categoryMap.set(entry.name, category.id);
  }

  for (const product of products) {
    const existing = await productRepo.findOne({ where: { sku: product.sku } });
    if (existing) {
      continue;
    }

    const created = productRepo.create({
      supplier_id: supplier.id,
      category_id: categoryMap.get(product.category),
      name: product.name,
      description: "",
      sku: product.sku,
      unit: product.unit,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      requires_prescription: false,
      is_active: true,
    });

    await productRepo.save(created);

    const tiers = product.tiers.map((tier) =>
      priceTierRepo.create({
        product_id: created.id,
        min_quantity: tier.min,
        max_quantity: tier.max,
        price_per_unit: tier.price,
      })
    );
    await priceTierRepo.save(tiers);
  }

  await AppDataSource.destroy();
  console.log("Seed complete: categories, supplier, and products added.");
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
