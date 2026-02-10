

# Fix: Show All Employees in Caisse Section

## Problem

The "Caisse par employe" table only shows employees who either:
1. Have commands/omra orders/visas with `assignedTo` set to their ID, OR
2. Have a past caisse settlement history

Employees like "bouknane djawed", "ALI KHOUDJA ZOUBIR", and "Admin System" are missing because no records are assigned to them.

## Solution

Change the filtering logic so that **all active employees** appear in the caisse table, even if they currently have zero activity. This gives admins full visibility over all staff.

## Changes

### `server/src/analytics/analytics.service.ts`

Remove the filter on line 246 that excludes employees with no activity. Replace:

```typescript
const activeEmployeeStats = employeeStats.filter(e => 
  e.commandCount > 0 || (lastResetDates && lastResetDates[e.employeeId])
);
```

With simply using all employee stats (no filtering). All active employees will always appear in the table, showing zeros if they have no assigned work.

The global totals calculation and return statement will reference the full list instead of the filtered one.

This is a ~3 line change in a single file.

