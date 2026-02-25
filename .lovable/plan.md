

# Unseen Task Notification Badge for Employees

## Overview

Add a `seen` boolean field to internal tasks. When an admin assigns a task, it starts as `seen: false`. When the employee views the task list, their unseen tasks are automatically marked as seen. A notification badge on the "Missions Internes" sidebar item shows the count of unseen tasks.

## Backend Changes

### 1. New Migration — Add `seen` column

```sql
ALTER TABLE internal_tasks ADD COLUMN "seen" BOOLEAN NOT NULL DEFAULT false;
```

Existing tasks will default to `false` (unseen). This is safe since admins won't see the badge anyway.

### 2. Entity — `server/src/internal-tasks/entities/internal-task.entity.ts`

Add a `seen` boolean column defaulting to `false`:

```typescript
@Column({ type: 'boolean', default: false })
seen: boolean;
```

### 3. Service — `server/src/internal-tasks/internal-tasks.service.ts`

- In `create()`: tasks are created with `seen: false` by default (column default handles this).
- Add a new method `markAsSeen(userId: string)`: marks all unseen tasks for this employee as `seen: true`.
- Add a new method `getUnseenCount(userId: string): Promise<number>`: returns count of unseen tasks for the employee.

```typescript
async markAsSeen(userId: string): Promise<void> {
  await this.taskRepository.update(
    { assignedTo: userId, seen: false },
    { seen: true },
  );
}

async getUnseenCount(userId: string): Promise<number> {
  return this.taskRepository.count({
    where: { assignedTo: userId, seen: false },
  });
}
```

### 4. Controller — `server/src/internal-tasks/internal-tasks.controller.ts`

Add two new endpoints:

```typescript
@Get('unseen-count')
getUnseenCount(@CurrentUser() user: User): Promise<{ count: number }> {
  return this.tasksService.getUnseenCount(user.id).then(count => ({ count }));
}

@Patch('mark-seen')
markAsSeen(@CurrentUser() user: User): Promise<void> {
  return this.tasksService.markAsSeen(user.id);
}
```

**Important**: These routes must be placed BEFORE the `:id` routes to avoid NestJS interpreting "unseen-count" and "mark-seen" as an `id` parameter.

### 5. DTO — `server/src/internal-tasks/dto/update-internal-task.dto.ts`

No change needed — `seen` is managed by dedicated endpoints, not the general update flow. When admin reassigns or creates a task, the `create()` method already defaults to `seen: false`.

## Frontend Changes

### 6. Types — `src/types/index.ts`

Add `seen` to the `InternalTask` interface:

```typescript
export interface InternalTask {
  // ... existing fields
  seen: boolean;
}
```

### 7. API — `src/lib/api.ts`

Add two new API methods:

```typescript
getUnseenTaskCount = (): Promise<{ count: number }> =>
  this.request('/internal-tasks/unseen-count');

markTasksAsSeen = (): Promise<void> =>
  this.request('/internal-tasks/mark-seen', { method: 'PATCH' });
```

### 8. Hooks — `src/hooks/useInternalTasks.ts`

Add two new hooks:

```typescript
export function useUnseenTaskCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['internal-tasks', 'unseen-count'],
    queryFn: () => api.getUnseenTaskCount(),
    enabled,
    refetchInterval: 30000, // Poll every 30s for new tasks
  });
}

export function useMarkTasksSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markTasksAsSeen(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks', 'unseen-count'] });
    },
  });
}
```

### 9. Sidebar — `src/components/layout/AppSidebar.tsx`

For the "Missions Internes" menu item (employees only), show a red badge with the unseen count:

- Import `useUnseenTaskCount` and `Badge`
- Call `useUnseenTaskCount(!isAdmin)` — only for employees
- Render a small red badge next to the "Missions Internes" label when `count > 0`

```tsx
<NavLink to="/missions-internes" className="flex items-center gap-3">
  <ClipboardCheck className="h-4 w-4" />
  <span>{t(item.titleKey)}</span>
  {unseenCount > 0 && (
    <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-xs">
      {unseenCount}
    </Badge>
  )}
</NavLink>
```

### 10. InternalTasksPage — `src/pages/InternalTasksPage.tsx`

When the page loads (for employees), call `markTasksAsSeen`:

```typescript
const markSeen = useMarkTasksSeen();

useEffect(() => {
  if (!isAdmin && tasks && tasks.some(t => !t.seen)) {
    markSeen.mutate();
  }
}, [isAdmin, tasks]);
```

This automatically clears the badge when the employee visits the tasks page.

## Files Changed Summary

| File | Change |
|---|---|
| `server/src/database/migrations/177XXXXXXX-AddSeenToInternalTasks.ts` | New migration: add `seen` boolean column |
| `server/src/internal-tasks/entities/internal-task.entity.ts` | Add `seen` column |
| `server/src/internal-tasks/internal-tasks.service.ts` | Add `markAsSeen()` and `getUnseenCount()` methods |
| `server/src/internal-tasks/internal-tasks.controller.ts` | Add `GET unseen-count` and `PATCH mark-seen` endpoints |
| `src/types/index.ts` | Add `seen: boolean` to `InternalTask` |
| `src/lib/api.ts` | Add `getUnseenTaskCount()` and `markTasksAsSeen()` |
| `src/hooks/useInternalTasks.ts` | Add `useUnseenTaskCount` and `useMarkTasksSeen` hooks |
| `src/components/layout/AppSidebar.tsx` | Show unseen count badge on sidebar item |
| `src/pages/InternalTasksPage.tsx` | Auto-mark tasks as seen on page visit |

