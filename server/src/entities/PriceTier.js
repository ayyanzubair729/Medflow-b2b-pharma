import { EntitySchema } from "typeorm";

export const PriceTierSchema = new EntitySchema({
  name: "PriceTier",
  tableName: "price_tiers",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    product_id: {
      type: "varchar",
    },
    min_quantity: {
      type: "int",
    },
    max_quantity: {
      type: "int",
      nullable: true,
    },
    price_per_unit: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
  },
  relations: {
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "price_tiers",
      joinColumn: { name: "product_id" },
      onDelete: "CASCADE",
    },
  },
});
