

# Add Payment Type Dropdown to Command Form

## Overview

Add a "Type de paiement" (Payment Type) dropdown to the command creation/edit form with these default values:
- Cash
- Edahabia / CIB
- BaridiMob
- International Cards

The payment types will be stored as a simple admin-managed list in the backend (new `payment_types` table/entity), and only admins can add, edit, or delete them. The selected value is saved in the command's `data` JSONB field as `paymentType`.

## Files to Create / Modify

### 1. Backend -- New Entity: `server/src/payment-types/entities/payment-type.entity.ts`
- Simple entity: `id` (uuid), `name` (string), `isActive` (boolean), `createdAt`, `updatedAt`

### 2. Backend -- New DTO: `server/src/payment-types/dto/create-payment-type.dto.ts`
- `name: string` (required)

### 3. Backend -- New DTO: `server/src/payment-types/dto/update-payment-type.dto.ts`
- `name?: string`, `isActive?: boolean`

### 4. Backend -- New Service: `server/src/payment-types/payment-types.service.ts`
- CRUD operations for payment types

### 5. Backend -- New Controller: `server/src/payment-types/payment-types.controller.ts`
- `GET /payment-types` -- all users (for dropdown)
- `POST /payment-types` -- admin only
- `PATCH /payment-types/:id` -- admin only
- `DELETE /payment-types/:id` -- admin only

### 6. Backend -- New Module: `server/src/payment-types/payment-types.module.ts`
- Register entity, service, controller

### 7. Backend -- Update `server/src/app.module.ts`
- Import `PaymentTypesModule`

### 8. Backend -- New Migration: `server/src/database/migrations/1771300000000-AddPaymentTypes.ts`
- Create `payment_types` table
- Seed default values: Cash, Edahabia / CIB, BaridiMob, International Cards

### 9. Frontend -- New Type in `src/types/index.ts`
- Add `PaymentType` interface: `{ id, name, isActive, createdAt, updatedAt }`

### 10. Frontend -- Update `src/lib/api.ts`
- Add `PaymentType` DTOs and API methods: `getPaymentTypes()`, `createPaymentType()`, `updatePaymentType()`, `deletePaymentType()`

### 11. Frontend -- New Hook: `src/hooks/usePaymentTypes.ts`
- `usePaymentTypes()` -- fetch all active payment types
- `useCreatePaymentType()`, `useUpdatePaymentType()`, `useDeletePaymentType()` -- admin mutations

### 12. Frontend -- Update `src/pages/CommandsPage.tsx`
- Add `paymentType` to `formData` state (default: `''`)
- Add a Select dropdown in the accounting section (after supplier) with payment types from the API
- Include an inline "add" button (visible to admins only, same pattern as the company inline add)
- Save `paymentType` into the command's `data` JSONB field
- Load `paymentType` from `command.data.paymentType` when editing
- Reset `paymentType` in `resetForm()`
- Display payment type in the table (optional new column or in the details view)

### 13. Frontend -- Translation updates
- `src/i18n/locales/fr/commands.json`: Add `form.paymentType`, `form.selectPaymentType`, `form.noPaymentType`, `form.addPaymentType`
- `src/i18n/locales/ar/commands.json`: Same keys in Arabic

## Technical Notes

- Payment type values are stored as the `name` string in `command.data.paymentType` (inside the JSONB field), not as a foreign key, to keep it simple and avoid schema changes to the commands table.
- The admin inline-add pattern follows the existing Company inline-add dialog already in the form.
- The `@Roles('admin')` decorator + `RolesGuard` is used on create/update/delete endpoints, matching existing patterns (e.g., Companies controller).
