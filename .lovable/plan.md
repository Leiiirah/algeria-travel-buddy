
# Add "Filter by Employee" to Commands Page (Admin Only)

## Overview
Add an employee filter dropdown to the admin commands table so you can fetch only commands created by or assigned to a specific employee.

## Changes

### 1. Frontend filter interface (`src/lib/api.ts`)
Add `createdBy` to the `CommandFilters` interface (the backend already supports this parameter).

### 2. Filter UI (`src/pages/CommandsPage.tsx`)
Add a new filter option in the `AdvancedFilter` `filterConfig` array for employee selection. This filter will only be shown for admin users.

### 3. Translation keys (`src/i18n/locales/fr/commands.json` and `src/i18n/locales/ar/commands.json`)
Add a translation key for the new filter label: `filters.employee`.

## Technical Details

| File | Change |
|------|--------|
| `src/lib/api.ts` (line 175-184) | Add `createdBy?: string` to `CommandFilters` |
| `src/pages/CommandsPage.tsx` (lines 773-807) | Add employee filter to `filterConfig` array, conditionally for admins |
| `src/i18n/locales/fr/commands.json` | Add `"employee": "Employé"` under `filters` |
| `src/i18n/locales/ar/commands.json` | Add `"employee": "الموظف"` under `filters` |

The backend `CommandsService.findAll` already handles the `createdBy` filter parameter, filtering by `command.createdBy = :userId OR command.assignedTo = :userId`. For admin users, the controller passes it through directly as a query param (it only force-sets it for non-admin users).
