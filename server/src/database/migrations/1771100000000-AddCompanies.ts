import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanies1771100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "companies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_companies" PRIMARY KEY ("id")
      )
    `);

    // Seed initial companies
    await queryRunner.query(`
      INSERT INTO "companies" ("name") VALUES
        ('Air Algérie'),
        ('Turkish Airlines'),
        ('Algérie Ferries'),
        ('Tunisair'),
        ('Royal Air Maroc'),
        ('Air France'),
        ('Transavia'),
        ('Tassili Airlines'),
        ('Nouvelair')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "companies"`);
  }
}
