
# Plan: Fix Supplier Dropdown for Employees

## Problem

When employees try to create a command, the supplier dropdown is empty because all supplier endpoints are currently restricted to admin-only access.

## Root Cause

In `server/src/suppliers/suppliers.controller.ts`, the `@Roles('admin')` decorator is applied at the **class level** (line 20), which blocks ALL endpoints including the read-only ones needed for the command form.

## Solution

Remove the class-level `@Roles('admin')` decorator and apply it only to the endpoints that require admin access (create, update, delete). The read endpoints (`GET /suppliers`, `GET /suppliers/:id`) should remain accessible to all authenticated users.

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/suppliers/suppliers.controller.ts` | Move `@Roles('admin')` from class level to only POST, PATCH, DELETE endpoints |

---

## Implementation Details

### Current Code (Problematic)

```typescript
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // ❌ Blocks ALL endpoints for employees
export class SuppliersController {
  @Get()
  findAll() { ... }  // ❌ Blocked for employees

  @Post()
  @Roles('admin')  // Redundant
  create() { ... }
}
```

### Updated Code (Fixed)

```typescript
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
// No class-level @Roles decorator - READ endpoints accessible to all
export class SuppliersController {
  @Get()
  findAll() { ... }  // ✅ Accessible to all authenticated users

  @Get('accounting')
  @Roles('admin')  // Only admins can see supplier accounting data
  findAllWithBalance() { ... }

  @Get(':id')
  findOne() { ... }  // ✅ Accessible to all

  @Get(':id/balance')
  @Roles('admin')  // Only admins can see balance details
  getBalance() { ... }

  @Post()
  @Roles('admin')  // ✅ Only admins can create
  create() { ... }

  @Patch(':id')
  @Roles('admin')  // ✅ Only admins can update
  update() { ... }

  @Delete(':id')
  @Roles('admin')  // ✅ Only admins can delete
  remove() { ... }
}
```

---

## Access Control After Fix

| Endpoint | Admin | Employee |
|----------|-------|----------|
| `GET /suppliers` | ✅ | ✅ (for dropdown) |
| `GET /suppliers/:id` | ✅ | ✅ |
| `GET /suppliers/accounting` | ✅ | ❌ |
| `GET /suppliers/:id/balance` | ✅ | ❌ |
| `POST /suppliers` | ✅ | ❌ |
| `PATCH /suppliers/:id` | ✅ | ❌ |
| `DELETE /suppliers/:id` | ✅ | ❌ |

---

## Why This Is Safe

- Employees can **view** supplier names for selection in command forms
- Employees **cannot** access sensitive data (accounting/balance info)
- Employees **cannot** create, modify, or delete suppliers
- The SuppliersPage route remains admin-only (protected in `App.tsx`)

---

## File Summary

| Category | Count |
|----------|-------|
| Backend files | 1 |
| **Total** | 1 file |
