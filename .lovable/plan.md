

# Fix: Use `commandDate` as the Effective Date Across the App

## Problem
The `commandDate` field is correctly saved to the database, but **nothing in the app actually uses it**. Every display, calculation, and filter uses `createdAt` instead. So even when a user sets a custom date, it appears ignored because the app always shows/uses the auto-generated creation timestamp.

## Solution
Introduce a pattern: **effective date = `commandDate` if set, otherwise fall back to `createdAt`**. Apply this everywhere dates are used for commands.

## Changes

### 1. Frontend: `src/pages/CommandsPage.tsx`

**Details dialog (line 1325-1326):** Show `commandDate` (or `createdAt` as fallback) instead of only `createdAt`:
```typescript
// Before:
format(new Date(viewingCommand.createdAt), 'dd/MM/yyyy HH:mm')

// After:
format(new Date(viewingCommand.commandDate || viewingCommand.createdAt), 'dd/MM/yyyy')
```

**Invoice generation (line 425):** Use `commandDate` for the invoice date:
```typescript
// Before:
invoiceDate: format(new Date(command.createdAt), 'dd/MM/yyyy')

// After:
invoiceDate: format(new Date(command.commandDate || command.createdAt), 'dd/MM/yyyy')
```

### 2. Backend: `server/src/analytics/analytics.service.ts`

Replace all `c.createdAt` references used for date grouping/filtering with the effective date pattern:

**Today's commands filter (line 49-52):** Use `commandDate || createdAt`
**Revenue per day grouping (line 65-69):** Use `commandDate || createdAt`
**Revenue stats (line 125-127):** Query using `commandDate` with fallback
**Employee caisse date filtering (line 201-204):** Use `commandDate || createdAt`

For each of these, the pattern will be:
```typescript
const effectiveDate = new Date(c.commandDate || c.createdAt);
```

### 3. Backend: `server/src/caisse-history/caisse-history.service.ts`

**Date filtering (line 105-108):** Same effective date pattern:
```typescript
const filterByDate = <T extends { createdAt: Date; commandDate?: Date }>(items: T[]): T[] => {
  if (!lastResetDate) return items;
  return items.filter(item => new Date(item.commandDate || item.createdAt) > lastResetDate);
};
```

### 4. Backend: `server/src/commands/commands.service.ts`

**Query ordering (line ~100):** Order by `COALESCE(command.commandDate, command.createdAt)` so commands appear sorted by their effective date, not just creation time.

**Date range filters (lines ~80-90):** Apply `fromDate`/`toDate` filters against the effective date:
```sql
COALESCE(command."commandDate", command."createdAt") >= :fromDate
```

## Summary

| File | Change |
|------|--------|
| `src/pages/CommandsPage.tsx` | Use `commandDate \|\| createdAt` for display and invoices |
| `server/src/analytics/analytics.service.ts` | Use effective date for today stats, revenue grouping, employee caisse |
| `server/src/caisse-history/caisse-history.service.ts` | Use effective date for reset-date filtering |
| `server/src/commands/commands.service.ts` | Use `COALESCE(commandDate, createdAt)` for ordering and date range filters |

After these changes, when a user sets a custom `commandDate`, that date will be used everywhere. When not set, the system falls back to `createdAt` (today's date) as before.

**Note:** The backend (NestJS) server will need to be redeployed for changes to take effect.
