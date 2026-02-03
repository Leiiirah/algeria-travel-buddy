

# Plan: Fix Employee Command Statistics Display

## Problem Analysis

After thoroughly scanning the codebase, I found that the **implementation exists** but may have issues preventing it from working properly. The expected flow is:

1. Employee creates a command
2. Command is saved with `createdBy` = employee's user ID
3. Employee visits `/comptabilite-employes` (Employee Accounting page)
4. Frontend calls `GET /analytics/employee-stats`
5. Backend returns stats calculated from commands where `createdBy` matches employee's ID
6. Frontend displays "Ma Performance" section with stats

## Current Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Backend endpoint | Exists | `server/src/analytics/analytics.controller.ts` line 26-29 |
| Backend service method | Exists | `server/src/analytics/analytics.service.ts` lines 143-170 |
| Frontend API function | Exists | `src/lib/api.ts` lines 852-863 |
| Frontend hook | Exists | `src/hooks/useAnalytics.ts` lines 33-37 |
| Frontend UI | Exists | `src/pages/EmployeeAccountingPage.tsx` lines 366-397 |
| Translations | Exists | `src/i18n/locales/fr/employees.json` lines 56-62 |

## Identified Issues

### Issue 1: Query Cache Invalidation
When a command is created, `['analytics']` is invalidated, but the `useEmployeeStats` query uses `['analytics', 'employee-stats']`. This should work due to partial matching, but we should verify.

### Issue 2: Conditional Rendering May Hide Debug Information
The section only shows when `!isAdmin && employeeStats`. If `employeeStats` is `undefined` or `null` (due to an API error), the section won't display at all - no error message shown.

### Issue 3: Backend Server Deployment
The NestJS server code exists but may not be deployed or running with the latest changes.

---

## Solution

### Step 1: Add Error Handling and Debug Information

Update `EmployeeAccountingPage.tsx` to show error states and ensure the component provides feedback when data is missing.

**Changes to make:**
- Add error state from the `useEmployeeStats` hook
- Show a loading state or error message when stats cannot be loaded
- Add fallback values to prevent UI from breaking

### Step 2: Ensure Query Invalidation Works

Update `useCreateCommand` to explicitly invalidate the employee-stats query key for immediate feedback.

### Step 3: Add Default Values for Stats

Ensure the backend returns default values (0) even when there are no commands, rather than throwing an error.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/EmployeeAccountingPage.tsx` | Add error handling, improve conditional rendering, show loading/error states |
| `src/hooks/useCommands.ts` | Add explicit invalidation for `employee-stats` query |
| `server/src/analytics/analytics.service.ts` | Ensure robust handling when no commands exist |

---

## Detailed Implementation

### 1. Update EmployeeAccountingPage.tsx

```typescript
// Add error state from hook
const { data: employeeStats, isLoading: loadingStats, isError: statsError } = useEmployeeStats();

// Update the My Performance section
{!isAdmin && (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">
      {t('accounting.myPerformance.title')}
    </h2>
    
    {loadingStats ? (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    ) : statsError ? (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          {tCommon('error.loadFailed')}
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title={t('accounting.myPerformance.myCommands')}
          value={employeeStats?.totalCommands ?? 0}
          icon={ClipboardList}
          variant="info"
        />
        {/* ... rest of stats cards with fallback values */}
      </div>
    )}
  </div>
)}
```

### 2. Update useCommands.ts

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['commands'] });
  queryClient.invalidateQueries({ queryKey: ['analytics'] });
  queryClient.invalidateQueries({ queryKey: ['analytics', 'employee-stats'] });
  // ... rest
}
```

### 3. Update analytics.service.ts (Backend)

Ensure the method handles empty results gracefully:

```typescript
async getEmployeeCommandStats(userId: string) {
  const commands = await this.commandsRepo.find({
    where: { createdBy: userId },
    relations: ['service'],
  });

  // Always return valid structure even if no commands
  if (!commands || commands.length === 0) {
    return {
      totalCommands: 0,
      totalRevenue: 0,
      totalProfit: 0,
      pendingAmount: 0,
      byStatus: {
        en_attente: 0,
        en_cours: 0,
        termine: 0,
      },
    };
  }

  // ... existing calculation logic
}
```

---

## Testing Checklist

After implementation, verify:

1. Log in as an employee
2. Navigate to `/comptabilite-employes`
3. Verify "Ma Performance" section is visible (even with 0 values)
4. Create a new command
5. Navigate back to `/comptabilite-employes`
6. Verify the stats have updated to reflect the new command

---

## Summary

| Category | Count |
|----------|-------|
| Frontend files | 2 |
| Backend files | 1 |
| **Total** | 3 files |

The main fix ensures that:
1. The section always shows for employees (not hidden when stats are 0)
2. Error states are properly displayed
3. Query invalidation is explicit and reliable
4. Backend handles edge cases gracefully

