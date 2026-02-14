
# Fix: TypeORM orderBy Cannot Handle COALESCE Expression

## Root Cause
TypeORM's `orderBy('COALESCE(command.commandDate, command.createdAt)', 'DESC')` splits the string on `.` and treats `COALESCE(command` as an alias name, which fails. This happens regardless of quoting -- it's a fundamental limitation of `orderBy`.

## Fix

Use `addSelect` to create a computed column with an alias, then `orderBy` that alias. Also use raw SQL column references (with double-quoted actual DB column names, not property names) in `andWhere` since those go directly into the WHERE clause and are not parsed the same way.

**File: `server/src/commands/commands.service.ts`**

### 1. Add a select alias for the effective date (after the initial queryBuilder creation, around line 51)

```typescript
const queryBuilder = this.commandsRepository
  .createQueryBuilder('command')
  .leftJoinAndSelect('command.service', 'service')
  .leftJoinAndSelect('command.supplier', 'supplier')
  .leftJoinAndSelect('command.creator', 'creator')
  .leftJoinAndSelect('command.assignee', 'assignee')
  .addSelect('COALESCE(command."commandDate", command."createdAt")', 'effective_date');
```

### 2. Fix the fromDate/toDate WHERE clauses (lines 75, 81)

In `andWhere`, raw SQL is passed directly to PostgreSQL, so we need actual column names with double quotes:

```typescript
// fromDate filter
queryBuilder.andWhere(
  'COALESCE(command."commandDate", command."createdAt") >= :fromDate',
  { fromDate: new Date(fromDate) }
);

// toDate filter  
queryBuilder.andWhere(
  'COALESCE(command."commandDate", command."createdAt") <= :toDate',
  { toDate: new Date(toDate) }
);
```

### 3. Fix the orderBy (line 98)

Order by the select alias instead of re-specifying the expression:

```typescript
const data = await queryBuilder
  .orderBy('effective_date', 'DESC')
  .skip(skip)
  .take(limit)
  .getMany();
```

## Why This Works
- `addSelect` creates a named computed column (`effective_date`) that TypeORM recognizes as a valid alias
- `orderBy('effective_date', 'DESC')` references that alias without any dot-splitting issues
- `andWhere` passes raw SQL directly to PostgreSQL, so double-quoted column names work correctly there

## Summary

| Line(s) | Change |
|---------|--------|
| ~51 | Add `.addSelect('COALESCE(command."commandDate", command."createdAt")', 'effective_date')` |
| 75 | Use double-quoted column names in fromDate WHERE |
| 81 | Use double-quoted column names in toDate WHERE |
| 98 | Change `orderBy` to use `'effective_date'` alias |

The backend server will need to be redeployed after this fix.
