

# Companies Management for Commands

## Overview
Add admin-managed "Companies" (compagnies de transport) that employees select from when creating ticket-type commands. Currently the company field is a free-text input -- this changes it to a dropdown populated from a backend-managed list. Only admins can add/edit/delete companies; employees can only select from the existing list.

## What Changes

### 1. Backend: New Companies Module (NestJS)

**New entity**: `server/src/companies/entities/company.entity.ts`
- `id` (UUID, primary key)
- `name` (string, e.g. "Air Algerie", "Turkish Airlines")
- `isActive` (boolean, default true)
- `createdAt`, `updatedAt` (timestamps)

**New DTO files**:
- `create-company.dto.ts`: name (required string)
- `update-company.dto.ts`: name (optional), isActive (optional)

**New service**: `server/src/companies/companies.service.ts`
- `findAll()` -- returns all companies ordered by name
- `findActive()` -- returns only active companies (for employee dropdown)
- `create(dto)` -- admin only
- `update(id, dto)` -- admin only
- `remove(id)` -- admin only

**New controller**: `server/src/companies/companies.controller.ts`
- `GET /companies` -- all users (returns active only for employees, all for admins)
- `POST /companies` -- admin only (guarded with `@Roles('admin')`)
- `PATCH /companies/:id` -- admin only
- `DELETE /companies/:id` -- admin only

**New module**: `server/src/companies/companies.module.ts`
- Register in `app.module.ts`

**New migration**: `server/src/database/migrations/1771100000000-AddCompanies.ts`
- Creates `companies` table
- Seeds initial data from existing supplier airline names (Air Algerie, Turkish Airlines, etc.)

### 2. Frontend: API Layer

**`src/lib/api.ts`**: Add new endpoints:
- `getCompanies()` -- GET /companies
- `createCompany(data)` -- POST /companies
- `updateCompany(id, data)` -- PATCH /companies/:id
- `deleteCompany(id)` -- DELETE /companies/:id

**New types in `src/types/index.ts`**:
```text
Company {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**New hook**: `src/hooks/useCompanies.ts`
- `useCompanies()` -- fetch all companies
- `useCreateCompany()` -- mutation
- `useUpdateCompany()` -- mutation
- `useDeleteCompany()` -- mutation

### 3. Frontend: Commands Page Changes

**`src/pages/CommandsPage.tsx`**:
- For ticket-type commands, replace the free-text `<Input>` for company with a `<Select>` dropdown populated from `useCompanies()`
- Admins see the dropdown + a small "+" button next to it to quickly add a new company inline (opens a small dialog)
- Employees see only the dropdown (no add button)
- The selected value stored in `formData.company` remains a string (the company name) for backward compatibility with existing commands

### 4. Frontend: Admin Companies Management

**New page**: `src/pages/CompaniesPage.tsx` (admin only)
- Simple table listing all companies with name and active status
- Add/Edit/Delete actions
- Toggle active/inactive
- Accessible from the sidebar (admin only)

**`src/components/layout/AppSidebar.tsx`**: Add "Compagnies" link in the admin section of the sidebar

**`src/App.tsx`**: Add route `/companies` wrapped in ProtectedRoute (admin only)

### 5. Translations

Add entries in both `fr` and `ar` locale files for:
- "Compagnies" / "الشركات"
- "Ajouter une compagnie" / "إضافة شركة"
- Form labels, success/error messages

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `server/src/companies/entities/company.entity.ts` | Create | Company entity |
| `server/src/companies/dto/create-company.dto.ts` | Create | Create DTO |
| `server/src/companies/dto/update-company.dto.ts` | Create | Update DTO |
| `server/src/companies/companies.service.ts` | Create | CRUD service |
| `server/src/companies/companies.controller.ts` | Create | REST controller with role guards |
| `server/src/companies/companies.module.ts` | Create | NestJS module |
| `server/src/app.module.ts` | Modify | Register CompaniesModule |
| `server/src/database/migrations/1771100000000-AddCompanies.ts` | Create | Migration + seed data |
| `src/types/index.ts` | Modify | Add Company interface |
| `src/lib/api.ts` | Modify | Add company API methods |
| `src/hooks/useCompanies.ts` | Create | React Query hooks |
| `src/pages/CompaniesPage.tsx` | Create | Admin management page |
| `src/pages/CommandsPage.tsx` | Modify | Replace Input with Select for company field |
| `src/components/layout/AppSidebar.tsx` | Modify | Add sidebar link (admin) |
| `src/App.tsx` | Modify | Add /companies route |
| `src/i18n/locales/fr/common.json` | Modify | Add translations |
| `src/i18n/locales/ar/common.json` | Modify | Add translations |

## Backward Compatibility
Existing commands with free-text company names will continue to display correctly. The company field in `command.data.company` remains a string. When editing old commands, if the stored company name matches an existing company in the list, it will be pre-selected; otherwise it shows as-is.

