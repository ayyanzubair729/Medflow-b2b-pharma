export class InitialSchema1777446000000 {
  name = "InitialSchema1777446000000";

  async up(queryRunner) {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('buyer', 'supplier', 'admin')`);
    await queryRunner.query(`CREATE TYPE "public"."products_unit_enum" AS ENUM('box', 'strip', 'vial', 'pack', 'bottle', 'unit')`);
    await queryRunner.query(`CREATE TYPE "public"."products_stock_status_enum" AS ENUM('in_stock', 'low_stock', 'out_of_stock')`);
    await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('draft', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "public"."quote_requests_status_enum" AS ENUM('pending', 'responded', 'accepted', 'rejected')`);
    await queryRunner.query(`CREATE TYPE "public"."return_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'buyer',
        "business_name" character varying NOT NULL,
        "license_number" character varying,
        "phone" character varying,
        "address" character varying,
        "is_verified" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "provider" character varying NOT NULL DEFAULT 'local',
        "oauth_id" character varying,
        "avatar_url" character varying,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "icon_url" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "parent_id" character varying,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supplier_id" character varying NOT NULL,
        "category_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "sku" character varying NOT NULL,
        "unit" "public"."products_unit_enum" NOT NULL DEFAULT 'box',
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "stock_status" "public"."products_stock_status_enum" NOT NULL DEFAULT 'in_stock',
        "requires_prescription" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "price_tiers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" character varying NOT NULL,
        "min_quantity" integer NOT NULL,
        "max_quantity" integer,
        "price_per_unit" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_price_tiers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyer_id" character varying NOT NULL,
        "supplier_id" character varying NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'placed',
        "total_amount" numeric(10,2) NOT NULL,
        "delivery_address" text,
        "notes" text,
        "placed_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyer_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "added_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quote_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyer_id" character varying NOT NULL,
        "supplier_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        "quantity_requested" integer NOT NULL,
        "message" text,
        "status" "public"."quote_requests_status_enum" NOT NULL DEFAULT 'pending',
        "supplier_response" text,
        "quoted_price" numeric(10,2),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "responded_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_quote_requests" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "return_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" character varying NOT NULL,
        "buyer_id" character varying NOT NULL,
        "supplier_id" character varying NOT NULL,
        "reason" text NOT NULL,
        "status" "public"."return_requests_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_return_requests" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "stock_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "supplier_id" character varying NOT NULL,
        "product_id" character varying NOT NULL,
        "threshold" integer NOT NULL,
        "triggered" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_alerts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_supplier" FOREIGN KEY ("supplier_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id")`);
    await queryRunner.query(`ALTER TABLE "price_tiers" ADD CONSTRAINT "FK_price_tiers_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_supplier" FOREIGN KEY ("supplier_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id")`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id")`);
    await queryRunner.query(`ALTER TABLE "quote_requests" ADD CONSTRAINT "FK_quote_requests_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "quote_requests" ADD CONSTRAINT "FK_quote_requests_supplier" FOREIGN KEY ("supplier_id") REFERENCES "users"("id")`);
    await queryRunner.query(`ALTER TABLE "quote_requests" ADD CONSTRAINT "FK_quote_requests_product" FOREIGN KEY ("product_id") REFERENCES "products"("id")`);
    await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id")`);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "FK_categories_parent"`);
    await queryRunner.query(`ALTER TABLE "quote_requests" DROP CONSTRAINT IF EXISTS "FK_quote_requests_product"`);
    await queryRunner.query(`ALTER TABLE "quote_requests" DROP CONSTRAINT IF EXISTS "FK_quote_requests_supplier"`);
    await queryRunner.query(`ALTER TABLE "quote_requests" DROP CONSTRAINT IF EXISTS "FK_quote_requests_buyer"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "FK_cart_items_product"`);
    await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "FK_cart_items_buyer"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_product"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_order"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_supplier"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_buyer"`);
    await queryRunner.query(`ALTER TABLE "price_tiers" DROP CONSTRAINT IF EXISTS "FK_price_tiers_product"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_category"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_supplier"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "stock_alerts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "return_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quote_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "price_tiers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."return_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."quote_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."products_stock_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."products_unit_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
