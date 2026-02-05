 import { MigrationInterface, QueryRunner } from 'typeorm';
 
 export class AddInvoiceDetailFields1770500000000 implements MigrationInterface {
   name = 'AddInvoiceDetailFields1770500000000';
 
   public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(`
       ALTER TABLE "client_invoices"
       ADD COLUMN IF NOT EXISTS "clientPassport" varchar(50),
       ADD COLUMN IF NOT EXISTS "companyName" varchar(100),
       ADD COLUMN IF NOT EXISTS "departureDate" date,
       ADD COLUMN IF NOT EXISTS "returnDate" date,
       ADD COLUMN IF NOT EXISTS "pnr" varchar(20),
       ADD COLUMN IF NOT EXISTS "travelClass" varchar(50),
       ADD COLUMN IF NOT EXISTS "ticketPrice" decimal(10, 2),
       ADD COLUMN IF NOT EXISTS "agencyFees" decimal(10, 2),
       ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(50),
       ADD COLUMN IF NOT EXISTS "validityHours" int DEFAULT 48
     `);
   }
 
   public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(`
       ALTER TABLE "client_invoices"
       DROP COLUMN IF EXISTS "clientPassport",
       DROP COLUMN IF EXISTS "companyName",
       DROP COLUMN IF EXISTS "departureDate",
       DROP COLUMN IF EXISTS "returnDate",
       DROP COLUMN IF EXISTS "pnr",
       DROP COLUMN IF EXISTS "travelClass",
       DROP COLUMN IF EXISTS "ticketPrice",
       DROP COLUMN IF EXISTS "agencyFees",
       DROP COLUMN IF EXISTS "paymentMethod",
       DROP COLUMN IF EXISTS "validityHours"
     `);
   }
 }