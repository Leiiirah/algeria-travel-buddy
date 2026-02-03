

# Fix: Add Database Migration for passportUrl Column

## Problem

You're getting a **500 Internal Server Error** on `GET /api/commands` because:

1. The `passportUrl` column was added to the `Command` entity in the code
2. **But no database migration was run** to add this column to the actual database table
3. When TypeORM queries the `commands` table, it looks for `passportUrl` column which doesn't exist, causing the error

## Solution

Create and run a database migration to add the `passportUrl` column to the `commands` table.

---

## Implementation

### 1. Create Migration File

**File**: `server/src/database/migrations/1770033200000-AddPassportUrlToCommands.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPassportUrlToCommands1770033200000 implements MigrationInterface {
  name = 'AddPassportUrlToCommands1770033200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      ADD COLUMN IF NOT EXISTS "passportUrl" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "commands" 
      DROP COLUMN IF EXISTS "passportUrl"
    `);
  }
}
```

### 2. Update typeorm.config.ts 

The migration file needs to be registered. Looking at the existing config, migrations are auto-discovered from `src/database/migrations/*.ts`, so no changes needed there.

---

## After Creating the Migration

You need to run the migration on your server. Connect to your server and run:

```bash
cd server
npm run migration:run
```

Or if migrations run automatically on server startup (as per your config with `migrationsRun: true`), simply restart the NestJS server.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `server/src/database/migrations/1770033200000-AddPassportUrlToCommands.ts` | **CREATE** - New migration file |

---

## Summary

| Category | Count |
|----------|-------|
| Migration files | 1 new |
| **Total** | 1 file |

This fix adds the missing `passportUrl` column to the database, which will resolve the 500 error on the commands endpoint.

