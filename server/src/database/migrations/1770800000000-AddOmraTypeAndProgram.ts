import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOmraTypeAndProgram1770800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create omra_order_type enum
    await queryRunner.query(`
      CREATE TYPE "omra_order_type_enum" AS ENUM ('groupe', 'libre')
    `);

    // Add omraType column
    await queryRunner.query(`
      ALTER TABLE "omra_orders"
      ADD COLUMN "omraType" "omra_order_type_enum" NOT NULL DEFAULT 'libre'
    `);

    // Add programId column (FK to omra_hotels)
    await queryRunner.query(`
      ALTER TABLE "omra_orders"
      ADD COLUMN "programId" uuid NULL
    `);

    // Add inProgram column
    await queryRunner.query(`
      ALTER TABLE "omra_orders"
      ADD COLUMN "inProgram" boolean NOT NULL DEFAULT false
    `);

    // Add FK constraint for programId
    await queryRunner.query(`
      ALTER TABLE "omra_orders"
      ADD CONSTRAINT "FK_omra_orders_program"
      FOREIGN KEY ("programId") REFERENCES "omra_hotels"("id")
      ON DELETE SET NULL
    `);

    // Extend omra_status_enum with 'reserve'
    await queryRunner.query(`
      ALTER TYPE "omra_orders_status_enum" ADD VALUE IF NOT EXISTS 'reserve'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK constraint
    await queryRunner.query(`
      ALTER TABLE "omra_orders" DROP CONSTRAINT IF EXISTS "FK_omra_orders_program"
    `);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "omra_orders" DROP COLUMN IF EXISTS "inProgram"
    `);
    await queryRunner.query(`
      ALTER TABLE "omra_orders" DROP COLUMN IF EXISTS "programId"
    `);
    await queryRunner.query(`
      ALTER TABLE "omra_orders" DROP COLUMN IF EXISTS "omraType"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "omra_order_type_enum"
    `);

    // Note: Cannot remove enum value from omra_orders_status_enum easily in PG
  }
}
