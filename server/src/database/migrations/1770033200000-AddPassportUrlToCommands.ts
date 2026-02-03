import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPassportUrlToCommands1770033200000 implements MigrationInterface {
  name = 'AddPassportUrlToCommands1770033200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD COLUMN IF NOT EXISTS "passportUrl" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      DROP COLUMN IF EXISTS "passportUrl"
    `);
  }
}
