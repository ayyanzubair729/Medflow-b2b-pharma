import { EntitySchema } from "typeorm";

export const QuoteStatus = Object.freeze({
  PENDING: "pending",
  RESPONDED: "responded",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

export const QuoteRequestSchema = new EntitySchema({
  name: "QuoteRequest",
  tableName: "quote_requests",
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
    product_id: {
      type: "varchar",
    },
    quantity_requested: {
      type: "int",
    },
    message: {
      type: "text",
      nullable: true,
    },
    status: {
      type: "enum",
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.PENDING,
    },
    supplier_response: {
      type: "text",
      nullable: true,
    },
    quoted_price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    responded_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    buyer: {
      type: "many-to-one",
      target: "User",
      inverseSide: "quote_requests",
      joinColumn: { name: "buyer_id" },
    },
    supplier: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "supplier_id" },
    },
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "quote_requests",
      joinColumn: { name: "product_id" },
    },
  },
});
