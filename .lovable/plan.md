
# Plan: Filter Dashboard Stats by User Role

## Overview

Update the analytics/dashboard endpoint to filter data based on user role. Employees will only see statistics for their own commands, while admins continue to see global company statistics.

---

## Current State

| Component | Current Behavior | Target Behavior |
|-----------|-----------------|-----------------|
| `/analytics/dashboard` endpoint | Returns all commands stats | Filter by `createdBy` for employees |
| Dashboard cards | Show global revenue, pending, etc. | Show personal stats for employees |
| Weekly chart | Global revenue by day | Personal revenue by day for employees |
| Service distribution | Global distribution | Personal distribution for employees |
| Recent commands | Already filtered via `useCommands` | Already correct |

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/analytics/analytics.controller.ts` | Pass user info to service method |
| `server/src/analytics/analytics.service.ts` | Add user filtering to `getDashboardStats` |

---

## Implementation Details

### 1. Update Analytics Controller

```typescript
@Get('dashboard')
getDashboardStats(@Request() req: any) {
  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;
  return this.analyticsService.getDashboardStats(userId, isAdmin);
}
```

### 2. Update Analytics Service

```typescript
async getDashboardStats(userId?: string, isAdmin?: boolean) {
  // Build query based on role
  let queryBuilder = this.commandsRepo.createQueryBuilder('command')
    .leftJoinAndSelect('command.service', 'service')
    .orderBy('command.createdAt', 'DESC');
  
  // Filter by user for non-admin
  if (!isAdmin && userId) {
    queryBuilder = queryBuilder.where('command.createdBy = :userId', { userId });
  }
  
  const commands = await queryBuilder.getMany();
  
  // ... rest of calculations remain the same
}
```

---

## Data Flow

```text
Admin User:
  Dashboard Request
       ↓
  getDashboardStats(userId, isAdmin=true)
       ↓
  Query: SELECT * FROM commands
       ↓
  Returns: Global company stats

Employee User:
  Dashboard Request
       ↓
  getDashboardStats(userId, isAdmin=false)
       ↓
  Query: SELECT * FROM commands WHERE createdBy = userId
       ↓
  Returns: Personal stats only
```

---

## Dashboard Display Changes

For employees, the dashboard will show:

| Card | Admin View | Employee View |
|------|-----------|---------------|
| Revenue | Total company revenue | Revenue from employee's commands |
| Today's Commands | All commands today | Employee's commands today |
| In Progress | All in-progress commands | Employee's in-progress commands |
| Unpaid Amount | Total company unpaid | Unpaid from employee's commands |

Charts will also be filtered:
- **Weekly Revenue**: Employee's personal weekly revenue
- **Service Distribution**: Distribution of employee's own commands

---

## File Summary

| Category | Count |
|----------|-------|
| Backend files | 2 |
| **Total** | 2 files |
