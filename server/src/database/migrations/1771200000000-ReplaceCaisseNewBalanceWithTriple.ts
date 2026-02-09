import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceCaisseNewBalanceWithTriple1771200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.query(`ALTER TABLE "caisse_history" ADD "newCaisse" decimal(12,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "caisse_history" ADD "newImpayes" decimal(12,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "caisse_history" ADD "newBenefices" decimal(12,2) NOT NULL DEFAULT 0`);

    // Migrate existing newBalance data into newCaisse for backwards compatibility
    await queryRunner.query(`UPDATE "caisse_history" SET "newCaisse" = "newBalance" WHERE "newBalance" != 0`);

    // Drop old column
    await queryRunner.query(`ALTER TABLE "caisse_history" DROP COLUMN "newBalance"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "caisse_history" ADD "newBalance" decimal(12,2) NOT NULL DEFAULT 0`);
    await queryRunner.query(`UPDATE "caisse_history" SET "newBalance" = "newCaisse"`);
    await queryRunner.query(`ALTER TABLE "caisse_history" DROP COLUMN "newCaisse"`);
    await queryRunner.query(`ALTER TABLE "caisse_history" DROP COLUMN "newImpayes"`);
    await queryRunner.query(`ALTER TABLE "caisse_history" DROP COLUMN "newBenefices"`);
  }
}
