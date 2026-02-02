

# Plan: TypeORM Migrations Setup

## Overview

Migrate from `synchronize: true` to a proper TypeORM migrations workflow. This ensures database changes are versioned, predictable, and safe for production environments.

---

## Current State Analysis

| Aspect | Current | Target |
|--------|---------|--------|
| `synchronize` | `true` in dev, varies | Always `false` |
| `autoLoadEntities` | `true` (implicit) | `false` (explicit entity list) |
| Migration config | `data-source.ts` exists but incomplete | Dedicated `typeorm.config.ts` |
| Migrations folder | Empty | Contains initial migration |

---

## Entities to Migrate (16 total)

| Entity | Table Name |
|--------|------------|
| User | `users` |
| RefreshToken | `refresh_tokens` |
| Service | `services` |
| ServiceType | `service_types` |
| Supplier | `suppliers` |
| Command | `commands` |
| Payment | `payments` |
| SupplierTransaction | `supplier_transactions` |
| Document | `documents` |
| OmraHotel | `omra_hotels` |
| OmraOrder | `omra_orders` |
| OmraVisa | `omra_visas` |
| EmployeeTransaction | `employee_transactions` |
| Expense | `expenses` |
| SupplierOrder | `supplier_orders` |
| SupplierReceipt | `supplier_receipts` |
| SupplierInvoice | `supplier_invoices` |

---

## Files to Create

| File | Purpose |
|------|---------|
| `server/typeorm.config.ts` | CLI migration configuration (root of server folder) |
| `server/src/database/migrations/1738505000000-Initial.ts` | Initial migration with complete schema |

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/package.json` | Update migration scripts to use new config |
| `server/src/app.module.ts` | Set `synchronize: false`, explicit entity imports |
| `server/src/database/data-source.ts` | Clean up (optional, can be removed or kept as backup) |

---

## Implementation Details

### 1. Create `server/typeorm.config.ts`

This file will be used by the TypeORM CLI for migrations:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Entity imports
import { User } from './src/users/entities/user.entity';
import { RefreshToken } from './src/auth/entities/refresh-token.entity';
import { Service } from './src/services/entities/service.entity';
import { ServiceType } from './src/service-types/entities/service-type.entity';
import { Supplier } from './src/suppliers/entities/supplier.entity';
import { Command } from './src/commands/entities/command.entity';
import { Payment } from './src/payments/entities/payment.entity';
import { SupplierTransaction } from './src/supplier-transactions/entities/supplier-transaction.entity';
import { Document } from './src/documents/entities/document.entity';
import { OmraHotel } from './src/omra/entities/omra-hotel.entity';
import { OmraOrder } from './src/omra/entities/omra-order.entity';
import { OmraVisa } from './src/omra/entities/omra-visa.entity';
import { EmployeeTransaction } from './src/employee-transactions/entities/employee-transaction.entity';
import { Expense } from './src/expenses/entities/expense.entity';
import { SupplierOrder } from './src/supplier-orders/entities/supplier-order.entity';
import { SupplierReceipt } from './src/supplier-receipts/entities/supplier-receipt.entity';
import { SupplierInvoice } from './src/supplier-invoices/entities/supplier-invoice.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'elhikma',
  entities: [
    User, RefreshToken, Service, ServiceType, Supplier,
    Command, Payment, SupplierTransaction, Document,
    OmraHotel, OmraOrder, OmraVisa, EmployeeTransaction,
    Expense, SupplierOrder, SupplierReceipt, SupplierInvoice,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
```

### 2. Update `server/package.json` Scripts

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate -d typeorm.config.ts",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run -d typeorm.config.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d typeorm.config.ts",
    "migration:show": "npm run typeorm -- migration:show -d typeorm.config.ts"
  }
}
```

**Usage Examples:**
- Generate migration: `npm run migration:generate src/database/migrations/AddNewColumn`
- Run migrations: `npm run migration:run`
- Revert last migration: `npm run migration:revert`
- Show migration status: `npm run migration:show`

### 3. Update `server/src/app.module.ts`

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE', 'elhikma'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,  // <-- ALWAYS FALSE
    logging: configService.get('NODE_ENV') === 'development',
    migrationsRun: true, // Auto-run migrations on startup (optional)
  }),
  inject: [ConfigService],
}),
```

### 4. Create Initial Migration

The initial migration will create all 17 tables with their enums, columns, indexes, and foreign keys. This is a comprehensive SQL migration that captures the entire current schema.

**Key Schema Elements:**

**Enums to create:**
- `user_role_enum` (admin, employee)
- `command_status_enum` (7 new visa statuses)
- `payment_method_enum` (especes, virement, cheque, carte)
- `transaction_type_enum` (sortie, entree)
- `document_category_enum` (assurance, cnas, casnos, autre)
- `omra_room_type_enum` (chambre_1 through chambre_5, suite)
- `omra_status_enum` (en_attente, confirme, termine, annule)
- `employee_transaction_type_enum` (avance, credit, salaire)
- `expense_category_enum` (fournitures, equipement, etc.)
- `expense_payment_method_enum` (especes, virement, cheque, carte)

**Tables with relationships:**
```text
users ──┬──> refresh_tokens (CASCADE)
        ├──> commands
        ├──> payments
        ├──> documents
        ├──> supplier_transactions
        ├──> employee_transactions
        ├──> expenses
        ├──> omra_orders
        ├──> omra_visas
        ├──> supplier_orders
        ├──> supplier_receipts
        └──> supplier_invoices

suppliers ──┬──> services
            ├──> commands
            ├──> supplier_transactions
            ├──> supplier_orders
            ├──> supplier_receipts
            └──> supplier_invoices

services ──> commands

omra_hotels ──┬──> omra_orders
              └──> omra_visas

supplier_orders ──> supplier_receipts
```

---

## Migration Workflow for Future Changes

When you request a database change (e.g., "add a `ticketNumber` column to commands"), I will:

1. **Modify the entity file** with the new column/relation
2. **Generate a migration file** with the SQL changes:
   ```bash
   npm run migration:generate src/database/migrations/AddTicketNumberToCommands
   ```
3. **Review the generated migration** to ensure it's correct
4. **Run the migration** in development:
   ```bash
   npm run migration:run
   ```

**Example generated migration:**
```typescript
export class AddTicketNumberToCommands1738506000000 
  implements MigrationInterface {
  
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD "ticketNumber" varchar(50)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      DROP COLUMN "ticketNumber"
    `);
  }
}
```

---

## Important Notes

1. **First Run**: After applying these changes, run `npm run migration:run` to apply the initial migration

2. **Existing Database**: If your database already has tables, you may need to:
   - Mark the initial migration as "already run" in the `migrations` table
   - Or, drop and recreate the database (development only)

3. **Production Deployment**: Always run `npm run migration:run` as part of your deployment process

4. **Never use `synchronize: true`** in production - it can cause data loss

---

## File Summary

| Category | Count |
|----------|-------|
| New files | 2 |
| Modified files | 2 |
| **Total** | 4 files |

