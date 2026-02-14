

# Fix: 500 Error on GET /api/commands

## Root Cause
The `COALESCE(command."commandDate", command."createdAt")` used in the `orderBy` call on line 98 of `server/src/commands/commands.service.ts` is causing a SQL error. TypeORM's `orderBy` method can fail with raw SQL expressions containing double-quoted identifiers because it tries to re-escape them.

## Fix

**File: `server/src/commands/commands.service.ts`** (line 97-101)

Replace the `orderBy` with `addOrderBy` and avoid double-quoting issues by using a simpler expression syntax:

```typescript
// Before (broken):
const data = await queryBuilder
  .orderBy('COALESCE(command."commandDate", command."createdAt")', 'DESC')
  .skip(skip)
  .take(limit)
  .getMany();

// After (fixed):
const data = await queryBuilder
  .orderBy('COALESCE(command.commandDate, command.createdAt)', 'DESC')
  .skip(skip)
  .take(limit)
  .getMany();
```

Also fix the same quoting pattern in the `fromDate` and `toDate` filters (lines 75 and 81):

```typescript
// Before:
'COALESCE(command."commandDate", command."createdAt") >= :fromDate'
'COALESCE(command."commandDate", command."createdAt") <= :toDate'

// After:
'COALESCE(command.commandDate, command.createdAt) >= :fromDate'
'COALESCE(command.commandDate, command.createdAt) <= :toDate'
```

TypeORM's QueryBuilder uses property names (camelCase), not raw SQL column names with double quotes. The double quotes cause the SQL generation to break.

## Summary

| File | Change |
|------|--------|
| `server/src/commands/commands.service.ts` | Remove double quotes from COALESCE column references in orderBy and where clauses (lines 75, 81, 98) |

The backend server will need to be redeployed after this fix.
