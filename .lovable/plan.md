

# Plan: Restrict Document Management to Admin Only

## Overview

This plan restricts the ability to upload, update, and delete documents to admin users only. Regular employees will still be able to view and download documents but won't see the management buttons (Upload, Replace, Delete).

## Changes Required

### Backend (NestJS)

**File: `server/src/documents/documents.controller.ts`**

Add the `RolesGuard` and `@Roles('admin')` decorator to the upload, update, and delete endpoints:

```typescript
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)  // Add RolesGuard
export class DocumentsController {
  // GET endpoints remain accessible to all authenticated users
  
  @Post('upload')
  @Roles('admin')  // Only admin can upload
  upload(...) { }

  @Patch(':id')
  @Roles('admin')  // Only admin can update
  update(...) { }

  @Delete(':id')
  @Roles('admin')  // Only admin can delete
  remove(...) { }
}
```

### Frontend (React)

**File: `src/pages/DocumentsPage.tsx`**

Hide the upload, replace, and delete buttons for non-admin users:

1. Import `useAuth` from `@/contexts/AuthContext`
2. Get the `isAdmin` flag from the hook
3. Conditionally render the "Téléverser" (Upload) button only for admins
4. Conditionally render the Replace and Delete action buttons only for admins
5. Adjust empty state message for non-admin users

## Files to Modify

| File | Change |
|------|--------|
| `server/src/documents/documents.controller.ts` | Add RolesGuard and @Roles('admin') to POST, PATCH, DELETE |
| `src/pages/DocumentsPage.tsx` | Hide upload/replace/delete buttons for non-admin users |

## Technical Details

### Backend Changes
- Import `RolesGuard` from `../common/guards/roles.guard`
- Import `Roles` decorator from `../common/decorators/roles.decorator`
- Add `RolesGuard` to the controller-level `@UseGuards()` decorator
- Add `@Roles('admin')` to `upload()`, `update()`, and `remove()` methods

### Frontend Changes
- Add `const { isAdmin } = useAuth();` after existing hooks
- Wrap the Upload Dialog trigger in `{isAdmin && ...}`
- Wrap the Replace and Delete buttons in `{isAdmin && ...}`
- Download button remains visible to all users

## Security Note

The backend validation ensures that even if someone bypasses the UI, non-admin requests to upload/update/delete will be rejected with a 403 Forbidden error.

## After Implementation

On your VPS, you'll need to:
1. Pull the latest code
2. Run `npm run build` in the server directory
3. Restart the NestJS server (e.g., `pm2 restart all`)

