import { EntitySchema } from "typeorm";

export const CartItemSchema = new EntitySchema({
  name: "CartItem",
  tableName: "cart_items",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    buyer_id: {
      type: "varchar",
    },
    product_id: {
      type: "varchar",
    },
    quantity: {
      type: "int",
    },
    added_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    buyer: {
      type: "many-to-one",
      target: "User",
      inverseSide: "cart_items",
      joinColumn: { name: "buyer_id" },
      onDelete: "CASCADE",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "cart_items",
      joinColumn: { name: "product_id" },
    },
  },
});
