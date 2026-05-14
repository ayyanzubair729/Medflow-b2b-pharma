import { EntitySchema } from "typeorm";

export const StockAlertSchema = new EntitySchema({
  name: "StockAlert",
  tableName: "stock_alerts",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    supplier_id: { type: "varchar" },
    product_id: { type: "varchar" },
    threshold: { type: "int" },
    triggered: { type: "boolean", default: false },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    supplier: { type: "many-to-one", target: "User", joinColumn: { name: "supplier_id" } },
    product: { type: "many-to-one", target: "Product", joinColumn: { name: "product_id" } },
  },
});