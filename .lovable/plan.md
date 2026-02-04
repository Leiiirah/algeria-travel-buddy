
# Fix: Prevent Stats API Call for Employee Users

## Problem

When logged in as an employee, the Internal Tasks page is making an API request to `/api/internal-tasks/stats` which returns a 403 Forbidden error. This is expected backend behavior since the endpoint is restricted to admin users only, but the **frontend should not make this request** for non-admin users.

## Root Cause

In `src/hooks/useInternalTasks.ts`, the `useInternalTaskStats` hook has no role-based guard:

```typescript
export function useInternalTaskStats() {
  return useQuery({
    queryKey: ['internal-tasks', 'stats'],
    queryFn: () => api.getInternalTaskStats(),
    // No 'enabled' condition to check if user is admin
  });
}
```

## Solution

Modify the `useInternalTaskStats` hook to accept an `enabled` parameter and only fetch stats when the user is an admin. The consuming component already knows whether the user is an admin via `useAuth()`.

### Changes Required

**File: `src/hooks/useInternalTasks.ts`**

Update the `useInternalTaskStats` function to conditionally enable the query:

```typescript
export function useInternalTaskStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['internal-tasks', 'stats'],
    queryFn: () => api.getInternalTaskStats(),
    enabled, // Only fetch when enabled is true
  });
}
```

**File: `src/pages/InternalTasksPage.tsx`**

Pass the `isAdmin` flag to the hook:

```typescript
// Line 93 - BEFORE:
const { data: stats, isLoading: statsLoading } = useInternalTaskStats();

// AFTER:
const { data: stats, isLoading: statsLoading } = useInternalTaskStats(isAdmin);
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Modified | 2 (hook + page) |
| Lines Changed | ~4 |
| Risk Level | Low |
| Breaking Changes | None |

The `enabled` option in React Query prevents the query from running when set to `false`. This is the standard pattern for conditional data fetching based on user permissions.
