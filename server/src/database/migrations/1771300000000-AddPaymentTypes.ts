import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTypes1771300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_types" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "payment_types" ("name") VALUES
        ('Cash'),
        ('Edahabia / CIB'),
        ('BaridiMob'),
        ('International Cards')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_types"`);
  }
}
