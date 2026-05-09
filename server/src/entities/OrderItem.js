import { EntitySchema } from "typeorm";

export const OrderItemSchema = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    order_id: {
      type: "varchar",
    },
    product_id: {
      type: "varchar",
    },
    quantity: {
      type: "int",
    },
    unit_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    subtotal: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      inverseSide: "items",
      joinColumn: { name: "order_id" },
      onDelete: "CASCADE",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "order_items",
      joinColumn: { name: "product_id" },
    },
  },
});
