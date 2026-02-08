
# Update PDF Header Info & Add Contact Settings Page

## Overview
Two changes are needed:
1. Update the hardcoded agency information displayed in the PDF header with the correct details you provided
2. Create a new "Contact" page accessible to admins where they can edit these agency details, which will then be dynamically reflected in all generated PDFs

## What Changes

### 1. Correct Agency Information (Immediate)
Update the hardcoded constants in `src/constants/agency.ts` with the real values:
- Email: elhikmatours@gmail.com
- Address: 02 rue de kolea zaban blida .09001
- NIF: 001209080768687
- NIS: 001209010018958
- RC: 09/00-0807686B12

### 2. New Backend: Agency Settings Module
Create a new NestJS module (`agency-settings`) to store and manage agency contact information in the database. This replaces the hardcoded constants with dynamic, editable data.

### 3. New Frontend: Contact Page
A new admin-only page at `/contact` where the admin can view and edit the agency's information (name, address, phone, email, NIF, NIS, RC). Changes are saved to the database and immediately used in all future PDF generation.

### 4. PDF Generator Update
Modify `generateClientInvoicePdf` (and `generateInvoicePdf`) to accept agency info as a parameter instead of importing from the hardcoded constants file. The calling pages will fetch the latest agency settings from the API before generating the PDF.

---

## Technical Details

### Database Migration
Create a new `agency_settings` table:

| Column | Type | Default |
|--------|------|---------|
| id | uuid (PK) | auto |
| key | varchar (unique) | - |
| value | text | - |
| updatedAt | timestamp | now() |

Seed with initial values: `legalName`, `address`, `phone`, `email`, `nif`, `nis`, `rc`.

This key-value approach is simple and flexible -- no schema changes needed if the admin wants to add more fields later.

### Backend Files (NestJS -- server/)

| File | Action | Description |
|------|--------|-------------|
| `server/src/agency-settings/entities/agency-setting.entity.ts` | Create | TypeORM entity for `agency_settings` table |
| `server/src/agency-settings/dto/update-agency-settings.dto.ts` | Create | DTO for bulk update |
| `server/src/agency-settings/agency-settings.service.ts` | Create | Service with `getAll()`, `update()`, and `seed()` methods |
| `server/src/agency-settings/agency-settings.controller.ts` | Create | GET (all users) and PUT (admin only) endpoints |
| `server/src/agency-settings/agency-settings.module.ts` | Create | Module with OnModuleInit to auto-seed defaults |
| `server/src/database/migrations/17707XXXXX-AddAgencySettings.ts` | Create | Migration to create `agency_settings` table and seed data |
| `server/src/app.module.ts` | Modify | Import AgencySettingsModule |

**API Endpoints:**
- `GET /agency-settings` -- Returns all settings as key-value pairs (accessible to all authenticated users)
- `PUT /agency-settings` -- Bulk update settings (admin only)

### Frontend Files

| File | Action | Description |
|------|--------|-------------|
| `src/constants/agency.ts` | Modify | Update hardcoded defaults with real values (used as fallback) |
| `src/types/index.ts` | Modify | Add `AgencySettings` interface |
| `src/lib/api.ts` | Modify | Add `getAgencySettings()` and `updateAgencySettings()` API methods |
| `src/hooks/useAgencySettings.ts` | Create | React Query hook for fetching/updating agency settings |
| `src/pages/ContactPage.tsx` | Create | Admin settings page with editable form |
| `src/App.tsx` | Modify | Add `/contact` route (admin only) |
| `src/components/layout/AppSidebar.tsx` | Modify | Add "Contact" nav item in admin section |
| `src/utils/invoiceGenerator.ts` | Modify | Accept agency info as parameter; use it in the PDF header |
| `src/pages/CommandsPage.tsx` | Modify | Fetch agency settings before generating PDF |
| `src/pages/InvoicesPage.tsx` | Modify | Fetch agency settings before generating PDF |
| `src/i18n/locales/fr/common.json` | Modify | Add "contact" navigation key and form labels |
| `src/i18n/locales/ar/common.json` | Modify | Add Arabic translations |

### Contact Page Layout
The page will have a simple card-based form with:
- Agency Legal Name
- Address
- Phone
- Email
- NIF
- NIS
- RC

Each field is an editable text input. A "Save" button persists changes to the backend. Only admins can access this page.

### PDF Header Update
The PDF header section (lines 321-342 in `invoiceGenerator.ts`) will display:
- Logo (unchanged)
- Agency legal name
- Address line
- Phone + Email line
- NIF | NIS | RC line (shown for both proforma and definitive -- currently RC/NIF only shown for definitive; NIS will be added)

All values will come from the agency settings passed as a parameter, falling back to the hardcoded defaults if the API call fails.
