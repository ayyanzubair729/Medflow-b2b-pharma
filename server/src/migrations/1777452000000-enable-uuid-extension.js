export class EnableUuidExtension1777452000000 {
  name = "EnableUuidExtension1777452000000";

  async up(queryRunner) {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  async down(queryRunner) {
    await queryRunner.query('DROP EXTENSION IF EXISTS "uuid-ossp"');
  }
}
