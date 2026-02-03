import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceiptUrlToSupplierTransactions1738600000000 implements MigrationInterface {
  name = 'AddReceiptUrlToSupplierTransactions1738600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      ADD COLUMN IF NOT EXISTS "receiptUrl" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      DROP COLUMN IF EXISTS "receiptUrl"
    `);
  }
}
