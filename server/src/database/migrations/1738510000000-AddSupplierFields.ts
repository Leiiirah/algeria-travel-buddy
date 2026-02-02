import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierFields1738510000000 implements MigrationInterface {
  name = 'AddSupplierFields1738510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to suppliers table
    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN IF NOT EXISTS "type" character varying DEFAULT 'other'
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN IF NOT EXISTS "country" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN IF NOT EXISTS "city" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN IF NOT EXISTS "currency" character varying DEFAULT 'DZD'
    `);

    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN IF NOT EXISTS "bankAccount" character varying
    `);

    // Check if serviceTypes column exists before migrating data
    const hasServiceTypes = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'suppliers' AND column_name = 'serviceTypes'
    `);

    if (hasServiceTypes.length > 0) {
      // Migrate existing serviceTypes data to new type column
      await queryRunner.query(`
        UPDATE "suppliers" SET "type" = 
          CASE 
            WHEN "serviceTypes" LIKE '%visa%' THEN 'visa'
            WHEN "serviceTypes" LIKE '%ticket%' THEN 'airline'
            WHEN "serviceTypes" LIKE '%residence%' THEN 'hotel'
            ELSE 'other'
          END
        WHERE "type" IS NULL OR "type" = 'other'
      `);

      // Drop the old serviceTypes column
      await queryRunner.query(`
        ALTER TABLE "suppliers" DROP COLUMN "serviceTypes"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate serviceTypes column
    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      ADD COLUMN "serviceTypes" text DEFAULT ''
    `);

    // Migrate type back to serviceTypes
    await queryRunner.query(`
      UPDATE "suppliers" SET "serviceTypes" = "type"
    `);

    // Drop new columns
    await queryRunner.query(`
      ALTER TABLE "suppliers" 
      DROP COLUMN IF EXISTS "type",
      DROP COLUMN IF EXISTS "country",
      DROP COLUMN IF EXISTS "city",
      DROP COLUMN IF EXISTS "currency",
      DROP COLUMN IF EXISTS "bankAccount"
    `);
  }
}
