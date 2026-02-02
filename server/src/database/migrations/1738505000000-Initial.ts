import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1738505000000 implements MigrationInterface {
  name = 'Initial1738505000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin', 'employee')
    `);

    await queryRunner.query(`
      CREATE TYPE "command_status_enum" AS ENUM (
        'dossier_incomplet', 'depose', 'en_traitement', 
        'accepte', 'refuse', 'visa_delivre', 'retire'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM ('especes', 'virement', 'cheque', 'carte')
    `);

    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('sortie', 'entree')
    `);

    await queryRunner.query(`
      CREATE TYPE "document_category_enum" AS ENUM ('assurance', 'cnas', 'casnos', 'autre')
    `);

    await queryRunner.query(`
      CREATE TYPE "omra_room_type_enum" AS ENUM (
        'chambre_1', 'chambre_2', 'chambre_3', 'chambre_4', 'chambre_5', 'suite'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "omra_status_enum" AS ENUM ('en_attente', 'confirme', 'termine', 'annule')
    `);

    await queryRunner.query(`
      CREATE TYPE "employee_transaction_type_enum" AS ENUM ('avance', 'credit', 'salaire')
    `);

    await queryRunner.query(`
      CREATE TYPE "expense_category_enum" AS ENUM (
        'fournitures', 'equipement', 'factures', 'transport', 'maintenance', 'marketing', 'autre'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "expense_payment_method_enum" AS ENUM ('especes', 'virement', 'cheque', 'carte')
    `);

    // Create tables
    // 1. Users table (no foreign keys)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'employee',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // 2. Refresh tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "token" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "revoked" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
    `);

    // 3. Suppliers table (no foreign keys)
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "contact" character varying,
        "phone" character varying,
        "email" character varying,
        "serviceTypes" text NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
      )
    `);

    // 4. Service types table (no foreign keys)
    await queryRunner.query(`
      CREATE TABLE "service_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying NOT NULL,
        "nameFr" character varying NOT NULL,
        "nameAr" character varying NOT NULL,
        "icon" character varying NOT NULL DEFAULT 'FileText',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_service_types_code" UNIQUE ("code"),
        CONSTRAINT "PK_service_types" PRIMARY KEY ("id")
      )
    `);

    // 5. Services table (references suppliers)
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "type" character varying NOT NULL,
        "description" text,
        "defaultSupplierId" uuid,
        "defaultBuyingPrice" numeric(10,2),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services" PRIMARY KEY ("id")
      )
    `);

    // 6. Commands table (references services, suppliers, users)
    await queryRunner.query(`
      CREATE TABLE "commands" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "serviceId" uuid NOT NULL,
        "supplierId" uuid NOT NULL,
        "data" jsonb NOT NULL,
        "status" "command_status_enum" NOT NULL DEFAULT 'dossier_incomplet',
        "destination" character varying,
        "sellingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "amountPaid" numeric(10,2) NOT NULL DEFAULT 0,
        "buyingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_commands" PRIMARY KEY ("id")
      )
    `);

    // 7. Payments table (references commands, users)
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "commandId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "method" "payment_method_enum" NOT NULL,
        "recordedBy" uuid NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    // 8. Supplier transactions table (references suppliers, users)
    await queryRunner.query(`
      CREATE TABLE "supplier_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "date" date NOT NULL,
        "supplierId" uuid NOT NULL,
        "type" "transaction_type_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "note" text,
        "recordedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supplier_transactions" PRIMARY KEY ("id")
      )
    `);

    // 9. Documents table (references users)
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "category" "document_category_enum" NOT NULL,
        "fileUrl" character varying NOT NULL,
        "uploadedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      )
    `);

    // 10. Omra hotels table (no foreign keys)
    await queryRunner.query(`
      CREATE TABLE "omra_hotels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "location" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_omra_hotels" PRIMARY KEY ("id")
      )
    `);

    // 11. Omra orders table (references omra_hotels, users)
    await queryRunner.query(`
      CREATE TABLE "omra_orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "clientName" character varying NOT NULL,
        "phone" character varying,
        "orderDate" date NOT NULL,
        "periodFrom" date NOT NULL,
        "periodTo" date NOT NULL,
        "hotelId" uuid,
        "roomType" "omra_room_type_enum" NOT NULL DEFAULT 'chambre_2',
        "status" "omra_status_enum" NOT NULL DEFAULT 'en_attente',
        "sellingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "amountPaid" numeric(10,2) NOT NULL DEFAULT 0,
        "buyingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_omra_orders" PRIMARY KEY ("id")
      )
    `);

    // 12. Omra visas table (references omra_hotels, users)
    await queryRunner.query(`
      CREATE TABLE "omra_visas" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "clientName" character varying NOT NULL,
        "phone" character varying,
        "visaDate" date NOT NULL,
        "entryDate" date NOT NULL,
        "hotelId" uuid,
        "status" "omra_status_enum" NOT NULL DEFAULT 'en_attente',
        "sellingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "amountPaid" numeric(10,2) NOT NULL DEFAULT 0,
        "buyingPrice" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_omra_visas" PRIMARY KEY ("id")
      )
    `);

    // 13. Employee transactions table (references users)
    await queryRunner.query(`
      CREATE TABLE "employee_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "employeeId" uuid NOT NULL,
        "type" "employee_transaction_type_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "date" date NOT NULL,
        "month" character varying,
        "note" text,
        "recordedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_employee_transactions" PRIMARY KEY ("id")
      )
    `);

    // 14. Expenses table (references users)
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category" "expense_category_enum" NOT NULL DEFAULT 'autre',
        "description" character varying(255) NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "date" date NOT NULL,
        "paymentMethod" "expense_payment_method_enum" NOT NULL DEFAULT 'especes',
        "vendor" character varying(255),
        "receiptUrl" character varying,
        "note" text,
        "recordedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);

    // 15. Supplier orders table (references suppliers, users)
    await queryRunner.query(`
      CREATE TABLE "supplier_orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "supplierId" uuid NOT NULL,
        "orderNumber" character varying NOT NULL,
        "description" text NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL,
        "totalAmount" numeric(12,2) NOT NULL,
        "orderDate" date NOT NULL,
        "status" character varying NOT NULL DEFAULT 'en_attente',
        "deliveredQuantity" integer NOT NULL DEFAULT 0,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supplier_orders" PRIMARY KEY ("id")
      )
    `);

    // 16. Supplier receipts table (references suppliers, supplier_orders, users)
    await queryRunner.query(`
      CREATE TABLE "supplier_receipts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "supplierId" uuid NOT NULL,
        "orderId" uuid,
        "receiptNumber" character varying NOT NULL,
        "description" text NOT NULL,
        "quantity" integer NOT NULL,
        "unitPrice" numeric(12,2) NOT NULL,
        "totalAmount" numeric(12,2) NOT NULL,
        "receiptDate" date NOT NULL,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supplier_receipts" PRIMARY KEY ("id")
      )
    `);

    // 17. Supplier invoices table (references suppliers, users)
    await queryRunner.query(`
      CREATE TABLE "supplier_invoices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "supplierId" uuid NOT NULL,
        "invoiceNumber" character varying NOT NULL,
        "internalRef" character varying NOT NULL,
        "description" text NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "invoiceDate" date NOT NULL,
        "dueDate" date,
        "status" character varying NOT NULL DEFAULT 'non_paye',
        "paidAmount" numeric(12,2) NOT NULL DEFAULT 0,
        "fileUrl" character varying,
        "notes" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supplier_invoices" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens" 
      ADD CONSTRAINT "FK_refresh_tokens_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "services" 
      ADD CONSTRAINT "FK_services_defaultSupplierId" 
      FOREIGN KEY ("defaultSupplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD CONSTRAINT "FK_commands_serviceId" 
      FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD CONSTRAINT "FK_commands_supplierId" 
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD CONSTRAINT "FK_commands_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_commandId" 
      FOREIGN KEY ("commandId") REFERENCES "commands"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_recordedBy" 
      FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      ADD CONSTRAINT "FK_supplier_transactions_supplierId" 
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      ADD CONSTRAINT "FK_supplier_transactions_recordedBy" 
      FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD CONSTRAINT "FK_documents_uploadedBy" 
      FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "omra_orders" 
      ADD CONSTRAINT "FK_omra_orders_hotelId" 
      FOREIGN KEY ("hotelId") REFERENCES "omra_hotels"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "omra_orders" 
      ADD CONSTRAINT "FK_omra_orders_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "omra_visas" 
      ADD CONSTRAINT "FK_omra_visas_hotelId" 
      FOREIGN KEY ("hotelId") REFERENCES "omra_hotels"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "omra_visas" 
      ADD CONSTRAINT "FK_omra_visas_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "employee_transactions" 
      ADD CONSTRAINT "FK_employee_transactions_employeeId" 
      FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "employee_transactions" 
      ADD CONSTRAINT "FK_employee_transactions_recordedBy" 
      FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" 
      ADD CONSTRAINT "FK_expenses_recordedBy" 
      FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_orders" 
      ADD CONSTRAINT "FK_supplier_orders_supplierId" 
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_orders" 
      ADD CONSTRAINT "FK_supplier_orders_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_receipts" 
      ADD CONSTRAINT "FK_supplier_receipts_supplierId" 
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_receipts" 
      ADD CONSTRAINT "FK_supplier_receipts_orderId" 
      FOREIGN KEY ("orderId") REFERENCES "supplier_orders"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_receipts" 
      ADD CONSTRAINT "FK_supplier_receipts_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_invoices" 
      ADD CONSTRAINT "FK_supplier_invoices_supplierId" 
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "supplier_invoices" 
      ADD CONSTRAINT "FK_supplier_invoices_createdBy" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "supplier_invoices" DROP CONSTRAINT "FK_supplier_invoices_createdBy"`);
    await queryRunner.query(`ALTER TABLE "supplier_invoices" DROP CONSTRAINT "FK_supplier_invoices_supplierId"`);
    await queryRunner.query(`ALTER TABLE "supplier_receipts" DROP CONSTRAINT "FK_supplier_receipts_createdBy"`);
    await queryRunner.query(`ALTER TABLE "supplier_receipts" DROP CONSTRAINT "FK_supplier_receipts_orderId"`);
    await queryRunner.query(`ALTER TABLE "supplier_receipts" DROP CONSTRAINT "FK_supplier_receipts_supplierId"`);
    await queryRunner.query(`ALTER TABLE "supplier_orders" DROP CONSTRAINT "FK_supplier_orders_createdBy"`);
    await queryRunner.query(`ALTER TABLE "supplier_orders" DROP CONSTRAINT "FK_supplier_orders_supplierId"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_recordedBy"`);
    await queryRunner.query(`ALTER TABLE "employee_transactions" DROP CONSTRAINT "FK_employee_transactions_recordedBy"`);
    await queryRunner.query(`ALTER TABLE "employee_transactions" DROP CONSTRAINT "FK_employee_transactions_employeeId"`);
    await queryRunner.query(`ALTER TABLE "omra_visas" DROP CONSTRAINT "FK_omra_visas_createdBy"`);
    await queryRunner.query(`ALTER TABLE "omra_visas" DROP CONSTRAINT "FK_omra_visas_hotelId"`);
    await queryRunner.query(`ALTER TABLE "omra_orders" DROP CONSTRAINT "FK_omra_orders_createdBy"`);
    await queryRunner.query(`ALTER TABLE "omra_orders" DROP CONSTRAINT "FK_omra_orders_hotelId"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_uploadedBy"`);
    await queryRunner.query(`ALTER TABLE "supplier_transactions" DROP CONSTRAINT "FK_supplier_transactions_recordedBy"`);
    await queryRunner.query(`ALTER TABLE "supplier_transactions" DROP CONSTRAINT "FK_supplier_transactions_supplierId"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_recordedBy"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_commandId"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP CONSTRAINT "FK_commands_createdBy"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP CONSTRAINT "FK_commands_supplierId"`);
    await queryRunner.query(`ALTER TABLE "commands" DROP CONSTRAINT "FK_commands_serviceId"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_services_defaultSupplierId"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "supplier_invoices"`);
    await queryRunner.query(`DROP TABLE "supplier_receipts"`);
    await queryRunner.query(`DROP TABLE "supplier_orders"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "employee_transactions"`);
    await queryRunner.query(`DROP TABLE "omra_visas"`);
    await queryRunner.query(`DROP TABLE "omra_orders"`);
    await queryRunner.query(`DROP TABLE "omra_hotels"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "supplier_transactions"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "commands"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "service_types"`);
    await queryRunner.query(`DROP TABLE "suppliers"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_token"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "expense_payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "expense_category_enum"`);
    await queryRunner.query(`DROP TYPE "employee_transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "omra_status_enum"`);
    await queryRunner.query(`DROP TYPE "omra_room_type_enum"`);
    await queryRunner.query(`DROP TYPE "document_category_enum"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "command_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
