import { EntitySchema } from "typeorm";

export const UserRole = Object.freeze({
  BUYER: "buyer",
  SUPPLIER: "supplier",
  ADMIN: "admin",
});

export const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password_hash: {
      type: "varchar",
      nullable: true,
    },
    provider: {
      type: "varchar",
      default: "local",
    },
    oauth_id: {
      type: "varchar",
      nullable: true,
    },
    role: {
      type: "enum",
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
    },
    business_name: {
      type: "varchar",
    },
    license_number: {
      type: "varchar",
      nullable: true,
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    address: {
      type: "varchar",
      nullable: true,
    },
    is_verified: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    avatar_url: {
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
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "supplier",
    },
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "buyer",
    },
    quote_requests: {
      type: "one-to-many",
      target: "QuoteRequest",
      inverseSide: "buyer",
    },
    cart_items: {
      type: "one-to-many",
      target: "CartItem",
      inverseSide: "buyer",
    },
  },
});
