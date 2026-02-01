
# Plan: Restrict Supplier Management to Admin Only

## Overview

This plan restricts the ability to add, edit, and delete suppliers to admin users only. Regular employees will still be able to view the suppliers list but won't see the management buttons.

## Changes Required

### Backend (NestJS)

**File: `server/src/suppliers/suppliers.controller.ts`**

Add the `RolesGuard` and `@Roles('admin')` decorator to the create, update, and delete endpoints, following the same pattern used in `UsersController`:

```typescript
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)  // Add RolesGuard here
export class SuppliersController {
  // GET endpoints remain accessible to all authenticated users
  
  @Post()
  @Roles('admin')  // Only admin can create
  create(...) { }

  @Patch(':id')
  @Roles('admin')  // Only admin can update
  update(...) { }

  @Delete(':id')
  @Roles('admin')  // Only admin can delete
  remove(...) { }
}
```

### Frontend (React)

**File: `src/pages/SuppliersPage.tsx`**

Hide the "Add", "Edit", and "Delete" buttons for non-admin users using the `isAdmin` flag from `useAuth()`:

- Import `useAuth` from `@/contexts/AuthContext`
- Conditionally render the "Ajouter" button only for admins
- Conditionally render the Edit and Delete action buttons only for admins

## Files to Modify

| File | Change |
|------|--------|
| `server/src/suppliers/suppliers.controller.ts` | Add RolesGuard and @Roles('admin') to POST, PATCH, DELETE |
| `src/pages/SuppliersPage.tsx` | Hide add/edit/delete buttons for non-admin users |

## Security Note

This implementation uses server-side role validation (via `RolesGuard` on the backend) to ensure security. The frontend changes are purely for UX - even if someone bypasses the UI, the backend will reject unauthorized requests with a 403 Forbidden error.

## After Implementation

On your VPS, you'll need to:
1. Pull the latest code
2. Run `npm run build` in the server directory
3. Restart the NestJS server
