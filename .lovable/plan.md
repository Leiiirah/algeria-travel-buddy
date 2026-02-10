

# Add Admin Delete Functionality to Multiple Tabs

## Overview

Add delete buttons (admin-only) to 4 tabs that are currently missing them. All deletions will require a confirmation dialog (AlertDialog) to prevent accidental data loss.

## Current State

- **Commands, Omra, Employee Accounting** -- already have delete functionality
- **Employees, Services, Service Types, Supplier Accounting** -- missing delete in the UI

## Changes Required

### 1. Employees Page (`src/pages/EmployeesPage.tsx`)

The backend endpoint, API method, and `useDeleteUser` hook all exist. Just need to:
- Import `useDeleteUser`, `Trash2`, and AlertDialog components
- Add a delete button next to the edit button in the actions column
- Wrap in an AlertDialog for confirmation
- Only visible to admins (already gated by `isAdmin`)

### 2. Services Page (`src/pages/ServicesPage.tsx`)

This requires the most work since there's no backend delete endpoint:

**Backend:**
- Add `remove()` method to `server/src/services/services.service.ts`
- Add `@Delete(':id')` endpoint (admin-only) to `server/src/services/services.controller.ts`

**Frontend:**
- Add `deleteService` API method to `src/lib/api.ts`
- Add `useDeleteService` hook to `src/hooks/useServices.ts`
- Add delete button to each service card with AlertDialog confirmation
- Import `Trash2` icon and AlertDialog components

### 3. Service Types Page (`src/pages/ServiceTypesPage.tsx`)

Backend, API, and `useDeleteServiceType` hook all exist. Just need to:
- Import `useDeleteServiceType`, `Trash2`, and AlertDialog components
- Add a delete button/menu item in the actions area
- Wrap in AlertDialog for confirmation

### 4. Supplier Accounting Page (`src/pages/SupplierAccountingPage.tsx`)

Backend `DELETE /supplier-transactions/:id` exists, `useDeleteSupplierTransaction` hook exists. Need to:
- Import the hook, `Trash2`, and AlertDialog components
- Add delete button to each transaction row in the transactions table
- Admin-only visibility
- AlertDialog confirmation

## Translation Updates

Add a generic delete confirmation key if not already present:
- `src/i18n/locales/fr/common.json`: `"confirmDelete"` message
- `src/i18n/locales/ar/common.json`: Same in Arabic

## Technical Details

- All delete buttons use the `AlertDialog` pattern (already used in InternalTasksPage and EmployeeAccountingPage) for safe confirmation
- Delete buttons are only rendered when `isAdmin` is true
- The `Trash2` icon from lucide-react is used consistently with `text-destructive` styling
- Backend delete for Services follows the exact same pattern as the existing `remove()` in `CommandsService`
