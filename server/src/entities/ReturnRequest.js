import { EntitySchema } from "typeorm";

export const ReturnRequestSchema = new EntitySchema({
  name: "ReturnRequest",
  tableName: "return_requests",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    order_id: { type: "varchar" },
    buyer_id: { type: "varchar" },
    supplier_id: { type: "varchar" },
    reason: { type: "text" },
    status: { type: "enum", enum: ["pending", "approved", "rejected"], default: "pending" },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    order: { type: "many-to-one", target: "Order", joinColumn: { name: "order_id" }, onDelete: "CASCADE" },
    buyer: { type: "many-to-one", target: "User", joinColumn: { name: "buyer_id" } },
    supplier: { type: "many-to-one", target: "User", joinColumn: { name: "supplier_id" } },
  },
});