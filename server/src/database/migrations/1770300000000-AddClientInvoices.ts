import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientInvoices1770300000000 implements MigrationInterface {
  name = 'AddClientInvoices1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create invoice type enum
    await queryRunner.query(`
      CREATE TYPE "client_invoice_type_enum" AS ENUM('proforma', 'finale')
    `);

    // Create invoice status enum
    await queryRunner.query(`
      CREATE TYPE "client_invoice_status_enum" AS ENUM('brouillon', 'envoyee', 'payee', 'annulee')
    `);

    // Create client_invoices table
    await queryRunner.query(`
      CREATE TABLE "client_invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceNumber" character varying(50) NOT NULL,
        "type" "client_invoice_type_enum" NOT NULL DEFAULT 'proforma',
        "status" "client_invoice_status_enum" NOT NULL DEFAULT 'brouillon',
        "commandId" uuid,
        "clientName" character varying(255) NOT NULL,
        "clientPhone" character varying(50),
        "clientEmail" character varying(255),
        "serviceName" character varying(255) NOT NULL,
        "serviceType" character varying(50),
        "destination" character varying(255),
        "totalAmount" decimal(10,2) NOT NULL DEFAULT 0,
        "paidAmount" decimal(10,2) NOT NULL DEFAULT 0,
        "invoiceDate" date NOT NULL DEFAULT CURRENT_DATE,
        "dueDate" date,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_client_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_client_invoices_number" UNIQUE ("invoiceNumber")
      )
    `);

    // Add foreign key to commands table (optional link)
    await queryRunner.query(`
      ALTER TABLE "client_invoices" 
      ADD CONSTRAINT "FK_client_invoices_command" 
      FOREIGN KEY ("commandId") REFERENCES "commands"("id") ON DELETE SET NULL
    `);

    // Add foreign key to users table (creator)
    await queryRunner.query(`
      ALTER TABLE "client_invoices" 
      ADD CONSTRAINT "FK_client_invoices_creator" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_type" ON "client_invoices" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_status" ON "client_invoices" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_createdBy" ON "client_invoices" ("createdBy")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_commandId" ON "client_invoices" ("commandId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_invoiceDate" ON "client_invoices" ("invoiceDate")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_client_invoices_clientName" ON "client_invoices" ("clientName")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_clientName"`);
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_invoiceDate"`);
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_commandId"`);
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_createdBy"`);
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_status"`);
    await queryRunner.query(`DROP INDEX "IDX_client_invoices_type"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "client_invoices" DROP CONSTRAINT "FK_client_invoices_creator"`);
    await queryRunner.query(`ALTER TABLE "client_invoices" DROP CONSTRAINT "FK_client_invoices_command"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "client_invoices"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "client_invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE "client_invoice_type_enum"`);
  }
}
