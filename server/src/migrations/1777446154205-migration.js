export class Migration1777446154205 {
  name = "Migration1777446154205";

  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "categories" ADD "description" text`);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "categories" ADD "description" character varying`);
  }
}
