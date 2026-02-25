import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeenToInternalTasks1771800000000 implements MigrationInterface {
  name = 'AddSeenToInternalTasks1771800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "internal_tasks" ADD COLUMN "seen" BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "internal_tasks" DROP COLUMN "seen"
    `);
  }
}
