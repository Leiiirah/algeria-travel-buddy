
# Plan: Role-Based Access Control for Employees

## Overview

Implement stricter access control to restrict employees from accessing supplier information, global company accounting, and document management capabilities. Employees will only see their own commands and their own accounting information.

---

## Current State Analysis

| Feature | Current Access | Target Access |
|---------|---------------|---------------|
| Fournisseurs (Suppliers) | All users | Admin only |
| Situation Fournisseurs (Supplier Accounting) | All users | Admin only |
| Comptabilité (Global Accounting) | All users | Admin only |
| Commandes | All users see all commands | Employees see only their own |
| Comptabilité Employés | Admin sees all, employees not restricted | Employees see only their own |
| Documents (GED) | All users can view, admin can modify | All users can view, admin only can add/modify |

---

## Changes Required

### Frontend Changes

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `adminOnly` to routes: `/fournisseurs`, `/situation-fournisseurs`, `/comptabilite` |
| `src/components/layout/AppSidebar.tsx` | Move Suppliers, Supplier Accounting, and Global Accounting to admin-only menu |
| `src/pages/CommandsPage.tsx` | Filter commands by `createdBy === user.id` for non-admin users |
| `src/pages/EmployeeAccountingPage.tsx` | For employees, redirect to their own accounting view only |
| `src/pages/DocumentsPage.tsx` | Already implemented (admin-only upload/delete) - verify no changes needed |
| `src/hooks/useCommands.ts` | Pass `createdBy` filter for non-admin users |
| `src/lib/api.ts` | Add `createdBy` to `CommandFilters` interface |

### Backend Changes

| File | Changes |
|------|---------|
| `server/src/commands/commands.controller.ts` | Add role-based filtering (employees only see own commands) |
| `server/src/commands/commands.service.ts` | Add `createdBy` filter to `findAll` method |
| `server/src/suppliers/suppliers.controller.ts` | Add `@Roles('admin')` to all endpoints |
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Add `@Roles('admin')` to all endpoints |
| `server/src/payments/payments.controller.ts` | Add `@Roles('admin')` to list/create endpoints |
| `server/src/employee-transactions/employee-transactions.controller.ts` | Employees can only access their own transactions |

---

## Implementation Details

### 1. Restrict Routes in App.tsx

```typescript
// Routes that become admin-only
<Route
  path="/fournisseurs"
  element={
    <ProtectedRoute adminOnly>
      <SuppliersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/situation-fournisseurs"
  element={
    <ProtectedRoute adminOnly>
      <SupplierAccountingPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/comptabilite"
  element={
    <ProtectedRoute adminOnly>
      <AccountingPage />
    </ProtectedRoute>
  }
/>
```

### 2. Update Sidebar Navigation

Move supplier-related items to the admin-only section:

**Current Structure:**
```
Main Menu:
  - Dashboard
  - Commands
  - Omra
  - Documents

Management (visible to all):
  - Employees
  - Suppliers
  - Supplier Accounting
  - Employee Accounting
  - Accounting

Administration (admin only):
  - Services
  - Service Types
  - Expenses
```

**New Structure:**
```
Main Menu (all users):
  - Dashboard
  - Commands
  - Omra
  - Documents

Personal (employees only):
  - My Accounting

Management (admin only):
  - Employees
  - Suppliers
  - Supplier Accounting
  - Employee Accounting
  - Accounting

Administration (admin only):
  - Services
  - Service Types
  - Expenses
```

### 3. Filter Commands for Employees

**Backend - commands.service.ts:**
```typescript
// Add createdBy filter
async findAll(filters: CommandFilters = {}, userId?: string, isAdmin?: boolean): Promise<PaginatedResponse<Command>> {
  // ... existing code ...
  
  // If not admin, only show user's own commands
  if (!isAdmin && userId) {
    queryBuilder.andWhere('command.createdBy = :userId', { userId });
  }
  
  // ... rest of the code
}
```

**Backend - commands.controller.ts:**
```typescript
@Get()
findAll(@Query() filters: CommandFilters, @Request() req: any) {
  const isAdmin = req.user.role === 'admin';
  return this.commandsService.findAll(filters, req.user.id, isAdmin);
}
```

### 4. Restrict Backend Endpoints

**suppliers.controller.ts** - Add `@Roles('admin')` to all read endpoints:
```typescript
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')  // All supplier operations require admin
export class SuppliersController { ... }
```

**supplier-transactions.controller.ts:**
```typescript
@Controller('supplier-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')  // All supplier transaction operations require admin
export class SupplierTransactionsController { ... }
```

**payments.controller.ts:**
```typescript
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')  // Accounting operations require admin
export class PaymentsController { ... }
```

### 5. Employee Accounting Self-Access

**employee-transactions.controller.ts:**
```typescript
@Get()
findAll(@Request() req: any) {
  // Admin sees all, employee sees only their own
  if (req.user.role === 'admin') {
    return this.service.findAll();
  }
  return this.service.findByEmployee(req.user.id);
}

@Get('balances')
getAllBalances(@Request() req: any) {
  // Admin sees all balances, employee sees only their own
  if (req.user.role === 'admin') {
    return this.service.getAllBalances();
  }
  return this.service.getEmployeeBalance(req.user.id);
}
```

**Update EmployeeAccountingPage.tsx for employees:**
- Show only their own transactions
- Hide the "new transaction" button (already done with `isAdmin` check)
- Display personal balance summary

---

## Security Considerations

| Layer | Protection |
|-------|------------|
| **Frontend Routes** | `ProtectedRoute` with `adminOnly` prop |
| **Frontend Navigation** | Sidebar hides admin-only links |
| **Backend Controllers** | `@Roles('admin')` decorator |
| **Backend Services** | Filter by `userId` for non-admin requests |

This multi-layer approach ensures:
1. Users cannot navigate to restricted pages
2. Even if they try direct URL access, they're redirected
3. API calls are rejected if unauthorized
4. Database queries only return authorized data

---

## Access Control Summary

| Page/Feature | Admin | Employee |
|--------------|-------|----------|
| Dashboard | ✅ Full stats | ✅ Limited stats (own commands only) |
| Commands | ✅ See all, edit all | ✅ See own only, edit within 24h |
| Omra | ✅ Full access | ✅ Full access |
| Documents | ✅ Upload, modify, delete | 👁️ View only |
| Suppliers | ✅ Full access | ❌ No access |
| Supplier Accounting | ✅ Full access | ❌ No access |
| Global Accounting | ✅ Full access | ❌ No access |
| Employee Accounting | ✅ See all employees | 👁️ See own only |
| Expenses | ✅ Full access | ❌ No access |
| Services | ✅ Full access | ❌ No access |
| Employees | ✅ Full access | ❌ No access |

---

## Files to Modify

### Frontend (7 files)
| File | Type |
|------|------|
| `src/App.tsx` | Route protection |
| `src/components/layout/AppSidebar.tsx` | Navigation visibility |
| `src/pages/CommandsPage.tsx` | Add user context for filtering |
| `src/pages/EmployeeAccountingPage.tsx` | Employee self-view mode |
| `src/hooks/useCommands.ts` | Pass user ID to API |
| `src/lib/api.ts` | Add createdBy filter |
| `src/pages/DashboardPage.tsx` | Filter stats for employees |

### Backend (6 files)
| File | Type |
|------|------|
| `server/src/commands/commands.controller.ts` | Role-based filtering |
| `server/src/commands/commands.service.ts` | Add createdBy filter |
| `server/src/suppliers/suppliers.controller.ts` | Add admin role requirement |
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Add admin role |
| `server/src/payments/payments.controller.ts` | Add admin role |
| `server/src/employee-transactions/employee-transactions.controller.ts` | Self-access for employees |

---

## Summary

| Category | Count |
|----------|-------|
| Frontend files | 7 |
| Backend files | 6 |
| **Total** | 13 files |

