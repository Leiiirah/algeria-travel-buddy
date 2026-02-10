import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearProductionData1771400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE client_invoices CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE payments CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE caisse_history CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE commands CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE supplier_receipts CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE supplier_invoices CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE supplier_orders CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE supplier_transactions CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE employee_transactions CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE omra_visas CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE omra_orders CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE omra_programs CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE omra_hotels CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE expenses CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE internal_tasks CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE refresh_tokens CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Data clearing cannot be reverted
  }
}
