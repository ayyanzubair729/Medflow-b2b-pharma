import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "../config/data-source.js";
import { ProductSchema, ProductUnit, StockStatus } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";
import { CategorySchema } from "../entities/Category.js";

dotenv.config();

const productSets = [
  {
    supplierEmail: "supplier1@test.com",
    products: [
      { name: "Amoxicillin 500mg", sku: "S1-AMOX-500", category: "Antibiotics", unit: ProductUnit.BOX, stock: 800, tiers: [{ min: 20, max: 99, price: 1800 }, { min: 100, max: 299, price: 1650 }, { min: 300, max: null, price: 1500 }] },
      { name: "Omeprazole 20mg", sku: "S1-OME-20", category: "Pain Management", unit: ProductUnit.BOX, stock: 600, tiers: [{ min: 30, max: 119, price: 2200 }, { min: 120, max: 299, price: 2000 }, { min: 300, max: null, price: 1850 }] },
    ],
  },
  {
    supplierEmail: "supplier2@test.com",
    products: [
      { name: "Losartan 50mg", sku: "S2-LOS-50", category: "Cardiology", unit: ProductUnit.BOX, stock: 500, tiers: [{ min: 25, max: 99, price: 2800 }, { min: 100, max: 249, price: 2600 }, { min: 250, max: null, price: 2400 }] },
      { name: "Salbutamol Inhaler", sku: "S2-SALB-INH", category: "Respiratory", unit: ProductUnit.UNIT, stock: 300, tiers: [{ min: 10, max: 49, price: 4500 }, { min: 50, max: 149, price: 4200 }, { min: 150, max: null, price: 3900 }] },
    ],
  },
  {
    supplierEmail: "supplier3@test.com",
    products: [
      { name: "Insulin Glargine 100IU", sku: "S3-INS-GLA", category: "Diabetes Care", unit: ProductUnit.VIAL, stock: 200, tiers: [{ min: 10, max: 49, price: 8500 }, { min: 50, max: 149, price: 8000 }, { min: 150, max: null, price: 7600 }] },
      { name: "Clindamycin Gel", sku: "S3-CLIN-GEL", category: "Dermatology", unit: ProductUnit.PACK, stock: 400, tiers: [{ min: 15, max: 59, price: 3200 }, { min: 60, max: 199, price: 2950 }, { min: 200, max: null, price: 2750 }] },
    ],
  },
];

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository("User");
  const catRepo = AppDataSource.getRepository(CategorySchema);
  const prodRepo = AppDataSource.getRepository(ProductSchema);
  const tierRepo = AppDataSource.getRepository(PriceTierSchema);

  for (const set of productSets) {
    const supplier = await userRepo.findOne({ where: { email: set.supplierEmail } });
    if (!supplier) { console.log(`Supplier ${set.supplierEmail} not found`); continue; }

    for (const p of set.products) {
      const existing = await prodRepo.findOne({ where: { sku: p.sku } });
      if (existing) { console.log(`  SKIP ${p.sku} (exists)`); continue; }

      const cat = await catRepo.findOne({ where: { name: p.category } });
      if (!cat) { console.log(`  SKIP ${p.sku} - category "${p.category}" not found`); continue; }

      const product = prodRepo.create({
        supplier_id: supplier.id,
        category_id: cat.id,
        name: p.name,
        sku: p.sku,
        unit: p.unit,
        stock_quantity: p.stock,
        stock_status: StockStatus.IN_STOCK,
        is_active: true,
      });
      await prodRepo.save(product);
      console.log(`  CREATED ${p.sku}`);

      const tiers = p.tiers.map((t) =>
        tierRepo.create({ product_id: product.id, min_quantity: t.min, max_quantity: t.max, price_per_unit: t.price })
      );
      await tierRepo.save(tiers);
    }
  }

  await AppDataSource.destroy();
  console.log("Done.");
}

seed().catch(console.error);
