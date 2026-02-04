import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInternalTasks1770100000000 implements MigrationInterface {
  name = 'AddInternalTasks1770100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM ('urgent', 'normal', 'critical')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM ('in_progress', 'completed')
    `);
    
    await queryRunner.query(`
      CREATE TYPE "task_visibility_enum" AS ENUM ('clear', 'unreadable')
    `);

    // Create table
    await queryRunner.query(`
      CREATE TABLE "internal_tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "priority" "task_priority_enum" NOT NULL DEFAULT 'normal',
        "status" "task_status_enum" NOT NULL DEFAULT 'in_progress',
        "visibility" "task_visibility_enum" NOT NULL DEFAULT 'clear',
        "assignedTo" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "dueDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_internal_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_internal_tasks_assignedTo" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_internal_tasks_createdBy" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_internal_tasks_assignedTo" ON "internal_tasks" ("assignedTo")
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_internal_tasks_status" ON "internal_tasks" ("status")
    `);
    
    await queryRunner.query(`
      CREATE INDEX "IDX_internal_tasks_priority" ON "internal_tasks" ("priority")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_internal_tasks_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_internal_tasks_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_internal_tasks_assignedTo"`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "internal_tasks"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "task_visibility_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_priority_enum"`);
  }
}
