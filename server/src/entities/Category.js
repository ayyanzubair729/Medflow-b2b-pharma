import { EntitySchema } from "typeorm";

export const CategorySchema = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
      unique: true,
    },
    slug: {
      type: "varchar",
      unique: true,
    },
    description: {
      type: "text",
      nullable: true,
    },
    icon_url: {
      type: "varchar",
      nullable: true,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    parent_id: {
      type: "varchar",
      nullable: true,
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
    parent: {
      type: "many-to-one",
      target: "Category",
      joinColumn: { name: "parent_id" },
      nullable: true,
    },
    children: {
      type: "one-to-many",
      target: "Category",
      inverseSide: "parent",
    },
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "category",
    },
  },
});
