import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommandDate1771500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable commandDate to commands table
    await queryRunner.query(
      `ALTER TABLE "commands" ADD COLUMN IF NOT EXISTS "commandDate" TIMESTAMP`,
    );

    // Make orderDate nullable on omra_orders
    await queryRunner.query(
      `ALTER TABLE "omra_orders" ALTER COLUMN "orderDate" DROP NOT NULL`,
    );

    // Make visaDate nullable on omra_visas
    await queryRunner.query(
      `ALTER TABLE "omra_visas" ALTER COLUMN "visaDate" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "commands" DROP COLUMN IF EXISTS "commandDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "omra_orders" ALTER COLUMN "orderDate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "omra_visas" ALTER COLUMN "visaDate" SET NOT NULL`,
    );
  }
}
