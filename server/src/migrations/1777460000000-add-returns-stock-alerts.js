export class AddReturnsStockAlerts1777460000000 {
  name = "AddReturnsStockAlerts1777460000000";

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "return_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "buyer_id" uuid NOT NULL,
        "supplier_id" uuid NOT NULL,
        "reason" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "return_requests"
      ADD CONSTRAINT "fk_return_requests_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "return_requests"
      ADD CONSTRAINT "fk_return_requests_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id")
    `);
    await queryRunner.query(`
      ALTER TABLE "return_requests"
      ADD CONSTRAINT "fk_return_requests_supplier" FOREIGN KEY ("supplier_id") REFERENCES "users"("id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stock_alerts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "supplier_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "threshold" integer NOT NULL,
        "triggered" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "stock_alerts"
      ADD CONSTRAINT "fk_stock_alerts_supplier" FOREIGN KEY ("supplier_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "stock_alerts"
      ADD CONSTRAINT "fk_stock_alerts_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
    `);
  }

  async down(queryRunner) {
    await queryRunner.query('ALTER TABLE "stock_alerts" DROP CONSTRAINT IF EXISTS "fk_stock_alerts_product"');
    await queryRunner.query('ALTER TABLE "stock_alerts" DROP CONSTRAINT IF EXISTS "fk_stock_alerts_supplier"');
    await queryRunner.query('DROP TABLE IF EXISTS "stock_alerts"');

    await queryRunner.query('ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "fk_return_requests_supplier"');
    await queryRunner.query('ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "fk_return_requests_buyer"');
    await queryRunner.query('ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "fk_return_requests_order"');
    await queryRunner.query('DROP TABLE IF EXISTS "return_requests"');
  }
}
