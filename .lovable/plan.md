

# Fix: Employee Command Stats Should Only Show Their Own Data

## Problem
The `/commands/stats` endpoint returns company-wide totals (Total Versements, Total Credit, Total Benefice Net) without filtering by user. Employees see the same global numbers as admins.

## Solution
The simplest and most reliable fix is to **stop using the global stats endpoint for employees** and instead calculate the totals from the commands already visible on the page (which are already filtered server-side by `createdBy`).

## Technical Changes

### File: `src/pages/CommandsPage.tsx`

**Current behavior (lines 130-151):** The `totals` memo uses `statsData` from the global `/commands/stats` API when available, and only falls back to local calculation when `statsData` is missing.

**Fix:** For non-admin users, always calculate totals from the locally filtered `commands` array. Only use `statsData` for admins.

```typescript
const totals = useMemo(() => {
  // For admins, use global stats if available
  if (user?.role === 'admin' && statsData) {
    return {
      totalPaid: statsData.totalPaid,
      totalRemaining: statsData.totalRemaining,
      totalProfit: statsData.totalProfit,
    };
  }
  // For employees (or when stats unavailable), calculate from visible commands
  return commands.reduce(
    (acc, cmd) => {
      const remaining = calculateRemainingBalance(cmd.sellingPrice, cmd.amountPaid);
      const profit = calculateNetProfit(cmd.sellingPrice, cmd.buyingPrice);
      return {
        totalPaid: acc.totalPaid + cmd.amountPaid,
        totalRemaining: acc.totalRemaining + remaining,
        totalProfit: acc.totalProfit + profit,
      };
    },
    { totalPaid: 0, totalRemaining: 0, totalProfit: 0 }
  );
}, [user?.role, statsData, commands]);
```

**Note on pagination:** The commands list is paginated (default 20 per page). For employees with more than 20 commands, the local calculation would only cover the current page. To handle this correctly, we will also fetch **all** employee commands for the totals by passing a high limit, or better yet, make the stats endpoint user-aware.

### File: `server/src/commands/commands.controller.ts` (line 62-65)

Pass the user context to `getStats()` so it filters by user for employees:

```typescript
@Get('stats')
getStats(@Request() req: any) {
  const isAdmin = req.user.role === 'admin';
  return this.commandsService.getStats(isAdmin ? undefined : req.user.id);
}
```

### File: `server/src/commands/commands.service.ts` (getStats method)

Accept an optional `userId` parameter and filter commands accordingly:

```typescript
async getStats(userId?: string) {
  const queryBuilder = this.commandsRepository.createQueryBuilder('command');
  if (userId) {
    queryBuilder.where(
      '(command.createdBy = :userId OR command.assignedTo = :userId)',
      { userId }
    );
  }
  const commands = await queryBuilder.getMany();
  // ... rest stays the same
}
```

## Summary

| File | Change |
|------|--------|
| `server/src/commands/commands.controller.ts` | Pass user info to `getStats()` for role-based filtering |
| `server/src/commands/commands.service.ts` | Filter `getStats()` by userId for employees |
| `src/pages/CommandsPage.tsx` | Update `totals` memo to use role-aware logic as fallback safety |

This ensures employees only see stats from their own commands, matching the data isolation policy already in place for the commands list.

