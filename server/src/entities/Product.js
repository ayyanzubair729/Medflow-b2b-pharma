import { EntitySchema } from "typeorm";

export const StockStatus = Object.freeze({
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
});

export const ProductUnit = Object.freeze({
  BOX: "box",
  STRIP: "strip",
  VIAL: "vial",
  PACK: "pack",
  BOTTLE: "bottle",
  UNIT: "unit",
});

export const ProductSchema = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    supplier_id: {
      type: "varchar",
    },
    category_id: {
      type: "varchar",
    },
    name: {
      type: "varchar",
    },
    description: {
      type: "text",
      nullable: true,
    },
    sku: {
      type: "varchar",
      unique: true,
    },
    unit: {
      type: "enum",
      enum: Object.values(ProductUnit),
      default: ProductUnit.BOX,
    },
    stock_quantity: {
      type: "int",
      default: 0,
    },
    stock_status: {
      type: "enum",
      enum: Object.values(StockStatus),
      default: StockStatus.IN_STOCK,
    },
    requires_prescription: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    supplier: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "supplier_id" },
    },
    category: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "category_id" },
    },
    price_tiers: {
      type: "one-to-many",
      target: "PriceTier",
      inverseSide: "product",
      cascade: true,
      eager: true,
    },
    order_items: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "product",
    },
    cart_items: {
      type: "one-to-many",
      target: "CartItem",
      inverseSide: "product",
    },
    quote_requests: {
      type: "one-to-many",
      target: "QuoteRequest",
      inverseSide: "product",
    },
  },
});
