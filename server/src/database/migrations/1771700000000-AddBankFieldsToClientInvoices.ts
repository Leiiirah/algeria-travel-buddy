import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankFieldsToClientInvoices1771700000000 implements MigrationInterface {
  name = 'AddBankFieldsToClientInvoices1771700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "client_invoices" ADD COLUMN IF NOT EXISTS "bankName" varchar(100) DEFAULT NULL`);
    await queryRunner.query(`ALTER TABLE "client_invoices" ADD COLUMN IF NOT EXISTS "bankAccount" varchar(100) DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "client_invoices" DROP COLUMN IF EXISTS "bankAccount"`);
    await queryRunner.query(`ALTER TABLE "client_invoices" DROP COLUMN IF EXISTS "bankName"`);
  }
}
