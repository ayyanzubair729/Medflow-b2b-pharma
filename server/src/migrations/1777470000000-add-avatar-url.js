export class AddAvatarUrl1777470000000 {
  name = "AddAvatarUrl1777470000000";

  async up(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "avatar_url" character varying
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url"
    `);
  }
}
