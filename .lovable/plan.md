
# Fix: Employee-Created Commands in Caisse + Hide Creator Badge for Employees

## Two Changes

### 1. Include employee-created commands in Caisse stats

Currently, the caisse calculation (both in `analytics.service.ts` and `caisse-history.service.ts`) only counts commands where `assignedTo = employeeId`. Commands that an employee **created** (but didn't explicitly assign to themselves) are ignored.

**Fix:** Change the filter logic to include commands where `assignedTo = employeeId` **OR** `createdBy = employeeId`, while avoiding double-counting when both fields match the same employee.

**Files to change:**

**`server/src/analytics/analytics.service.ts`** (lines 192-194)
- Change the filter from only `assignedTo` to include `createdBy` as well, using a deduplication approach:
```typescript
// Before:
const assignedCommands = commands.filter(c => c.assignedTo === employee.id);

// After:
const assignedCommands = commands.filter(
  c => c.assignedTo === employee.id || c.createdBy === employee.id
);
```
Same for `omraOrders` and `omraVisas`.

**`server/src/caisse-history/caisse-history.service.ts`** (lines 92-95)
- Same change in `calculateEmployeeStats`:
```typescript
// Before:
this.commandsRepo.find({ where: { assignedTo: employeeId } })

// After: Use QueryBuilder with OR condition
this.commandsRepo.createQueryBuilder('c')
  .where('c.assignedTo = :id OR c.createdBy = :id', { id: employeeId })
  .getMany()
```
Same for `omraOrders` and `omraVisas`.

### 2. Hide "par..." creator badge for employees

Since employees only see their own commands, showing "par [their own name]" is redundant.

**File to change:**

**`src/pages/CommandsPage.tsx`** (lines 1186-1193)
- Wrap the creator badge with an admin role check:
```typescript
{user?.role === 'admin' && command.creator && (
  <Badge ...>
    {t('table.by')} {command.creator.firstName}
  </Badge>
)}
```

## Summary

| File | Change |
|------|--------|
| `server/src/analytics/analytics.service.ts` | Filter commands by `assignedTo OR createdBy` instead of only `assignedTo` |
| `server/src/caisse-history/caisse-history.service.ts` | Same OR filter in `calculateEmployeeStats` |
| `src/pages/CommandsPage.tsx` | Only show creator badge for admin users |
