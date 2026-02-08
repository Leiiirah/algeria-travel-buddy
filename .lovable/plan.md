
# Programme Omra -- New Tab for Group Pilgrimage Package Management

## Overview
Add a dedicated "Programme Omra" tab (4th tab) to the Omra module that allows admins to create and manage group pilgrimage packages with structured room pricing. Employees see a read-only dashboard with real-time spot availability (confirmed vs. remaining). The existing order form's "Selectionner un Programme" dropdown is updated to pull from this new entity instead of hotels, and selecting a program + room type auto-fills the selling price.

## What Changes

### 1. New Program Entity (Backend)
A new `omra_programs` database table stores group pilgrimage packages:
- **name** -- Program name (e.g., "Omra Ramadan 2026")
- **periodFrom / periodTo** -- Date range for the pilgrimage
- **totalPlaces** -- Maximum number of spots
- **hotelId** -- Link to an existing Omra hotel
- **pricing** -- JSONB object with prices for each room configuration:
  `{ chambre_1: 250000, chambre_2: 200000, chambre_3: 180000, chambre_4: 160000, chambre_5: 150000, suite: 400000 }`
- **isActive** -- Toggle to show/hide from selectors
- **createdBy** -- Creator user reference

### 2. Programme Omra Tab (Frontend)
A new 4th tab in the Omra page:
- **Admin View**: Full CRUD -- create/edit/delete programs with a form containing name, date range, total places, hotel selector, and a pricing grid (6 room types + suite)
- **Employee View**: Read-only list showing program details with real-time inventory:
  - **Places Confirmees** (green): Count of orders linked to this program with status "confirme"
  - **Places Restantes** (red): totalPlaces minus confirmed count

### 3. Order Form Integration
- The "Selectionner un Programme" dropdown in the order form now lists programs from the new entity (instead of hotels)
- When both a program AND a room type are selected, the "Prix de vente" auto-fills with the corresponding price from the program's pricing object
- The `programId` foreign key on `omra_orders` now references `omra_programs` instead of `omra_hotels`

### 4. Role-Based Access
- Admins can create, edit, delete programs
- Employees can only view the list (read-only)
- The "Create Program" button is hidden for employees

---

## Technical Details

### Database Migration
New migration file: `server/src/database/migrations/1770900000000-AddOmraPrograms.ts`

Creates the `omra_programs` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid (PK) | auto | Primary key |
| name | varchar | required | Program name |
| periodFrom | date | required | Start date |
| periodTo | date | required | End date |
| totalPlaces | int | required | Max spots |
| hotelId | uuid (FK to omra_hotels) | nullable | Linked hotel |
| pricing | jsonb | {} | Room type prices |
| isActive | boolean | true | Visibility toggle |
| createdBy | uuid (FK to users) | required | Creator |
| createdAt | timestamp | auto | Created timestamp |
| updatedAt | timestamp | auto | Updated timestamp |

Also updates the `omra_orders.programId` FK to reference `omra_programs` instead of `omra_hotels`.

### Backend Files

**New: `server/src/omra/entities/omra-program.entity.ts`**
- Entity class with columns matching the table above
- ManyToOne relations to OmraHotel and User

**New: `server/src/omra/dto/create-omra-program.dto.ts`**
- Validation: name (required string), periodFrom/periodTo (date strings), totalPlaces (number), hotelId (optional UUID), pricing (optional object with numeric values for each room type)

**New: `server/src/omra/dto/update-omra-program.dto.ts`**
- PartialType of CreateOmraProgramDto + isActive boolean

**Modified: `server/src/omra/omra.module.ts`**
- Register OmraProgram entity in TypeOrmModule.forFeature

**Modified: `server/src/omra/omra.service.ts`**
- Add program CRUD methods: findAllPrograms, findActivePrograms, findProgramById, createProgram, updateProgram, deleteProgram
- Add getProgramStats method that counts confirmed orders per program to return inventory data
- Prevent deletion of programs linked to active orders

**Modified: `server/src/omra/omra.controller.ts`**
- Add program REST endpoints under `/omra/programs/*`:
  - GET `/programs` -- list all
  - GET `/programs/active` -- list active only
  - GET `/programs/:id` -- get by ID
  - POST `/programs` -- create (admin)
  - PATCH `/programs/:id` -- update (admin)
  - DELETE `/programs/:id` -- delete (admin)
  - GET `/programs/inventory` -- get spot counts per program

**Modified: `server/src/omra/entities/omra-order.entity.ts`**
- Change the `program` ManyToOne relation from OmraHotel to OmraProgram

### Frontend Files

**New: `src/components/omra/OmraProgramsTab.tsx`**
- Admin: table with program list + create/edit dialog containing:
  - Name, Date range, Total places, Hotel selector
  - Pricing grid: 6 input fields for chambre_1 through chambre_5 + suite, each with a label and DZD price input
- Employee: read-only table with columns: Name, Period, Hotel, Total Places, Places Confirmees (green badge), Places Restantes (red badge)
- Both views show real-time inventory from the `/programs/inventory` endpoint

**Modified: `src/types/index.ts`**
- Add `OmraProgram` interface with all fields including pricing object
- Add `OmraProgramPricing` type: `Record<OmraRoomType, number>`
- Add `OmraProgramInventory` interface: `{ programId, confirmed, remaining }`

**Modified: `src/lib/api.ts`**
- Add program DTOs: CreateOmraProgramDto, UpdateOmraProgramDto
- Add API methods: getOmraPrograms, getActiveOmraPrograms, createOmraProgram, updateOmraProgram, deleteOmraProgram, getOmraProgramInventory

**Modified: `src/hooks/useOmra.ts`**
- Add hooks: useOmraPrograms, useActiveOmraPrograms, useCreateOmraProgram, useUpdateOmraProgram, useDeleteOmraProgram, useOmraProgramInventory

**Modified: `src/pages/OmraPage.tsx`**
- Add 4th tab trigger "Programmes" with Calendar icon
- Update TabsList to grid-cols-4
- Add TabsContent for programs tab rendering OmraProgramsTab

**Modified: `src/components/omra/OmraOrdersTab.tsx`**
- Import useActiveOmraPrograms hook
- Replace hotels-based program dropdown with programs-based dropdown (listing active programs by name + period)
- Add auto-fill logic: when both programId and roomType are set, look up the program's pricing for that room type and set sellingPrice accordingly
- Keep manual override possible (user can still change the price after auto-fill)

**Modified: `src/i18n/locales/fr/omra.json`**
- Add `tabs.programs: "Programmes"`
- Add `programs` section with: title, count, newProgram, empty state, table headers (name, period, hotel, totalPlaces, confirmed, remaining, status, actions), form labels (programName, periodFrom, periodTo, totalPlaces, hotel, pricing, pricingDescription), confirm delete, inventory labels

**Modified: `src/i18n/locales/ar/omra.json`**
- Arabic equivalents for all new program translation keys

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `server/src/database/migrations/1770900000000-AddOmraPrograms.ts` | Create | Migration for omra_programs table + update FK |
| `server/src/omra/entities/omra-program.entity.ts` | Create | Program entity with pricing JSONB |
| `server/src/omra/dto/create-omra-program.dto.ts` | Create | Create DTO with validation |
| `server/src/omra/dto/update-omra-program.dto.ts` | Create | Update DTO (partial) |
| `server/src/omra/omra.module.ts` | Modify | Register OmraProgram entity |
| `server/src/omra/omra.service.ts` | Modify | Add program CRUD + inventory methods |
| `server/src/omra/omra.controller.ts` | Modify | Add program REST endpoints |
| `server/src/omra/entities/omra-order.entity.ts` | Modify | Change program FK to OmraProgram |
| `src/components/omra/OmraProgramsTab.tsx` | Create | New tab component with admin CRUD + employee read-only view |
| `src/types/index.ts` | Modify | Add OmraProgram, OmraProgramPricing types |
| `src/lib/api.ts` | Modify | Add program API methods and DTOs |
| `src/hooks/useOmra.ts` | Modify | Add program React Query hooks |
| `src/pages/OmraPage.tsx` | Modify | Add 4th tab |
| `src/components/omra/OmraOrdersTab.tsx` | Modify | Use programs in dropdown + auto-fill pricing |
| `src/i18n/locales/fr/omra.json` | Modify | French translations |
| `src/i18n/locales/ar/omra.json` | Modify | Arabic translations |
