export class AddOauthColumns1777449000000 {
  name = "AddOauthColumns1777449000000";

  async up(queryRunner) {
    await queryRunner.query(
      "ALTER TABLE \"users\" ADD \"provider\" character varying NOT NULL DEFAULT 'local'"
    );
    await queryRunner.query(
      "ALTER TABLE \"users\" ADD \"oauth_id\" character varying"
    );
    await queryRunner.query(
      "ALTER TABLE \"users\" ALTER COLUMN \"password_hash\" DROP NOT NULL"
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      "ALTER TABLE \"users\" ALTER COLUMN \"password_hash\" SET NOT NULL"
    );
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "oauth_id"');
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "provider"');
  }
}
