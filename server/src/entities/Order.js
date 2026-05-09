import { EntitySchema } from "typeorm";

export const OrderStatus = Object.freeze({
  DRAFT: "draft",
  PLACED: "placed",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

export const OrderSchema = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    buyer_id: {
      type: "varchar",
    },
    supplier_id: {
      type: "varchar",
    },
    status: {
      type: "enum",
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
    total_amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    delivery_address: {
      type: "text",
      nullable: true,
    },
    notes: {
      type: "text",
      nullable: true,
    },
    placed_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    buyer: {
      type: "many-to-one",
      target: "User",
      inverseSide: "orders",
      joinColumn: { name: "buyer_id" },
    },
    supplier: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "supplier_id" },
    },
    items: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "order",
      cascade: true,
      eager: true,
    },
  },
});
