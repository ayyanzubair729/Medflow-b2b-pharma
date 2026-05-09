import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserSchema } from "../entities/User.js";
import { CategorySchema } from "../entities/Category.js";
import { ProductSchema } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";
import { OrderSchema } from "../entities/Order.js";
import { OrderItemSchema } from "../entities/OrderItem.js";
import { QuoteRequestSchema } from "../entities/QuoteRequest.js";
import { CartItemSchema } from "../entities/CartItem.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "medflow_db",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    UserSchema,
    CategorySchema,
    ProductSchema,
    PriceTierSchema,
    OrderSchema,
    OrderItemSchema,
    QuoteRequestSchema,
    CartItemSchema,
  ],
  migrations: ["src/migrations/*.js"],
  subscribers: [],
});
