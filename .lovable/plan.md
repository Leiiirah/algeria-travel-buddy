

# Refine Omra Order Form: Two Types, Program Link, and New Status

## Overview
This plan adds two new concepts to Omra orders: an **Omra Type** (Groupe vs. Libre), a **Program reference** (linking to existing hotels from the 3rd tab), an **"En Programme"** indicator, and a new **"Reservé"** status value. The form adapts its layout based on the selected type, and all new fields are persisted in the backend.

## What Changes

### 1. Omra Type Toggle
A toggle group at the top of the "Nouvelle Commande Omra" form lets the user pick between:
- **Omra de Groupe** -- for fixed-date agency group tours
- **Omra Libre** -- for custom individual bookings

When "Omra Libre" is selected, the fields Hotel, Period dates, Selling Price, and Amount Paid are visually highlighted with a subtle accent border to indicate they require special attention for individual bookings.

### 2. New "Reserve" Status
A fifth status value ("Reservé") is added alongside the existing four (En attente, Confirmé, Terminé, Annulé). It appears in the table's inline status dropdown with a purple color badge.

### 3. Program Selector
At the bottom of the form (before the financial summary), a "Sélectionner un Programme" dropdown lists all active hotels from the Hotels tab. This acts as a label/reference only (no auto-fill, per your preference). Selecting a program also toggles the "En Programme" indicator to true.

### 4. "En Programme" Indicator
A badge visible in the orders table showing if a command is currently linked to an active program. Displayed as a small tag in the client column.

---

## Technical Details

### Database Migration
A new migration file adds 3 columns to the `omra_orders` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `omraType` | enum ('groupe', 'libre') | 'libre' | Type of Omra booking |
| `programId` | uuid (nullable, FK to omra_hotels) | null | Reference to a hotel/program |
| `inProgram` | boolean | false | Whether order is in an active group schedule |

The `OmraStatus` enum also gets a new value: `reserve`.

### Backend (server/) Changes

**File: `server/src/omra/entities/omra-order.entity.ts`**
- Add `OmraOrderType` enum with values `GROUPE = 'groupe'` and `LIBRE = 'libre'`
- Add `reserve` to `OmraStatus` enum
- Add `omraType` column (enum, default LIBRE)
- Add `programId` column (nullable UUID)
- Add `inProgram` column (boolean, default false)
- Add `@ManyToOne` relation from `programId` to `OmraHotel` as `program`

**File: `server/src/omra/dto/create-omra-order.dto.ts`**
- Add `omraType` (optional enum)
- Add `programId` (optional UUID)
- Add `inProgram` (optional boolean)

**File: `server/src/omra/dto/update-omra-order.dto.ts`**
- Inherits new fields from CreateOmraOrderDto via PartialType
- Add `reserve` to status enum validation

**File: `server/src/omra/omra.service.ts`**
- Update `findAllOrders` query builder to join `order.program`
- Add `omraType` filter support
- Update `byStatus` stats to include `reserve`

**File: `server/src/database/migrations/XXXXXXXXX-AddOmraTypeAndProgram.ts`**
- New migration creating the enum type, adding columns, and extending the status enum

### Frontend Changes

**File: `src/types/index.ts`**
- Add `OmraOrderType = 'groupe' | 'libre'`
- Add `'reserve'` to `OmraStatus` union
- Add `omraType`, `programId`, `program`, `inProgram` to `OmraOrder` interface
- Add `'reserve'` to `omraStatusLabels`

**File: `src/lib/api.ts`**
- Add `omraType`, `programId`, `inProgram` to `CreateOmraOrderDto`
- Update `OmraFilters` to support `omraType` filter

**File: `src/components/omra/OmraOrdersTab.tsx`**
- Add `omraType`, `programId`, `inProgram` to `formData` state (defaults: `'libre'`, `''`, `false`)
- Add ToggleGroup at the top of the form for Groupe/Libre selection
- When Omra Libre is selected, wrap Hotel, Period, Price, and Payment fields in a div with an accent border (`border-amber-300`)
- Add program Select dropdown before the financial summary (lists active hotels)
- When a program is selected, auto-set `inProgram` to `true`; when cleared, set to `false`
- Add `'reserve'` to the status dropdown in the table with purple badge styling
- Show "En Programme" badge in the client column when `order.inProgram` is true
- Add `omraType` filter option to AdvancedFilter config
- Update `handleOpenDialog` to populate new fields when editing
- Update `resetForm` to include new field defaults
- Update `handleSubmit` payload to include new fields

**File: `src/i18n/locales/fr/omra.json`**
- Add under `status`: `"reserve": "Réservé"`
- Add under `orders.form`: `"omraType": "Type d'Omra"`, `"omraGroupe": "Omra de Groupe"`, `"omraLibre": "Omra Libre"`, `"selectProgram": "Sélectionner un Programme"`, `"noProgram": "Sans programme"`, `"inProgram": "En Programme"`
- Add under `filters`: `"omraType": "Type d'Omra"`

**File: `src/i18n/locales/ar/omra.json`**
- Add under `status`: `"reserve": "محجوز"`
- Add under `orders.form`: `"omraType": "نوع العمرة"`, `"omraGroupe": "عمرة جماعية"`, `"omraLibre": "عمرة حرة"`, `"selectProgram": "اختر برنامجاً"`, `"noProgram": "بدون برنامج"`, `"inProgram": "في البرنامج"`
- Add under `filters`: `"omraType": "نوع العمرة"`

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `server/src/database/migrations/...AddOmraTypeAndProgram.ts` | Create | Migration for new columns and enum value |
| `server/src/omra/entities/omra-order.entity.ts` | Modify | Add OmraOrderType enum, new columns, new status |
| `server/src/omra/dto/create-omra-order.dto.ts` | Modify | Add omraType, programId, inProgram fields |
| `server/src/omra/dto/update-omra-order.dto.ts` | Modify | Inherits new fields |
| `server/src/omra/omra.service.ts` | Modify | Join program relation, add filter, update stats |
| `src/types/index.ts` | Modify | Add OmraOrderType, update OmraOrder/OmraStatus |
| `src/lib/api.ts` | Modify | Update DTOs and filters |
| `src/components/omra/OmraOrdersTab.tsx` | Modify | Form toggle, program selector, highlights, table badges |
| `src/i18n/locales/fr/omra.json` | Modify | French translations |
| `src/i18n/locales/ar/omra.json` | Modify | Arabic translations |

