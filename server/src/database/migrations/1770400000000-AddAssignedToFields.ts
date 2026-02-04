import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssignedToFields1770400000000 implements MigrationInterface {
  name = 'AddAssignedToFields1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add assignedTo column to commands table
    await queryRunner.query(`
      ALTER TABLE "commands" ADD COLUMN "assignedTo" UUID
    `);
    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD CONSTRAINT "FK_commands_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_commands_assignedTo" ON "commands"("assignedTo")
    `);

    // Add assignedTo column to omra_orders table
    await queryRunner.query(`
      ALTER TABLE "omra_orders" ADD COLUMN "assignedTo" UUID
    `);
    await queryRunner.query(`
      ALTER TABLE "omra_orders" 
      ADD CONSTRAINT "FK_omra_orders_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_omra_orders_assignedTo" ON "omra_orders"("assignedTo")
    `);

    // Add assignedTo column to omra_visas table
    await queryRunner.query(`
      ALTER TABLE "omra_visas" ADD COLUMN "assignedTo" UUID
    `);
    await queryRunner.query(`
      ALTER TABLE "omra_visas" 
      ADD CONSTRAINT "FK_omra_visas_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_omra_visas_assignedTo" ON "omra_visas"("assignedTo")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop from omra_visas
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_omra_visas_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "omra_visas" DROP CONSTRAINT IF EXISTS "FK_omra_visas_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "omra_visas" DROP COLUMN IF EXISTS "assignedTo"`);

    // Drop from omra_orders
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_omra_orders_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "omra_orders" DROP CONSTRAINT IF EXISTS "FK_omra_orders_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "omra_orders" DROP COLUMN IF EXISTS "assignedTo"`);

    // Drop from commands
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_commands_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP CONSTRAINT IF EXISTS "FK_commands_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP COLUMN IF EXISTS "assignedTo"`);
  }
}
