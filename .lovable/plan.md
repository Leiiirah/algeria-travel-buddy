

# Caisse Reset & Settlement System for Employee Cash Registers

## Overview
Add a full "Reset and Adjustment" system to the Caisses tab in the Accounting module. This allows admins to settle employee cash registers by recording the current totals into a permanent audit log, then resetting the active balance window. The Caisses table will only show activity **since the last reset** for each employee, while preserving a complete history of all past settlements.

## What Changes

### 1. Caisse Settlement History (Backend)
A new `caisse_history` database table stores every settlement event with full audit details: the employee's totals at the time of reset, who performed it, and any notes. The Caisses calculation logic is updated to only sum records created **after** each employee's most recent reset date.

### 2. "Regler la Caisse" Button (Per Employee)
Each employee row in the Caisses table gets a "Settle" action button. Clicking it opens a dialog showing the employee's current Caisse, Impayes, and Benefices. The admin can input a "New Starting Balance" (defaults to 0) and add notes before confirming. On confirmation, the current totals are saved to the history table.

### 3. Settlement History Viewer
A "Historique" icon next to each employee name opens a modal displaying all past settlements in a chronological table: date, caisse amount at settlement, admin notes, and a running cumulative total.

### 4. Updated KPI Calculations
The Caisse column and Global Summary Row only reflect "active" totals -- amounts recorded since each employee's last reset. This ensures the dashboard always shows the current unsettled period.

---

## Technical Details

### Database Migration
New migration file: `server/src/database/migrations/1771000000000-AddCaisseHistory.ts`

Creates the `caisse_history` table:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid (PK) | auto | Primary key |
| employeeId | uuid (FK to users) | required | The employee whose caisse was settled |
| caisseAmount | decimal(12,2) | required | Caisse total at time of settlement |
| impayesAmount | decimal(12,2) | required | Impayes total at time of settlement |
| beneficesAmount | decimal(12,2) | required | Benefices total at time of settlement |
| commandCount | int | required | Number of commands at time of settlement |
| newBalance | decimal(12,2) | 0 | The new starting balance after reset |
| adminId | uuid (FK to users) | required | Admin who performed the settlement |
| notes | text (nullable) | null | Settlement notes |
| resetDate | timestamp | now() | When the settlement was performed |
| createdAt | timestamp | auto | Record creation timestamp |

### Backend Files

**New: `server/src/caisse-history/entities/caisse-history.entity.ts`**
- Entity class with all columns from the table above
- ManyToOne relations to User for both employeeId and adminId

**New: `server/src/caisse-history/dto/create-caisse-settlement.dto.ts`**
- Validation: employeeId (required UUID), newBalance (optional number, default 0), notes (optional string, max 500 chars)

**New: `server/src/caisse-history/caisse-history.service.ts`**
- `createSettlement(dto, adminId)`: Fetches current caisse stats for the employee (reusing analytics logic), saves a snapshot row, returns the created record
- `getSettlementsByEmployee(employeeId)`: Returns all settlements ordered by resetDate DESC
- `getLastResetDate(employeeId)`: Returns the most recent resetDate for an employee (or null if never reset)
- `getAllLastResetDates()`: Returns a map of employeeId to their last resetDate for bulk lookups

**New: `server/src/caisse-history/caisse-history.controller.ts`**
- `POST /caisse-history/settle` -- Create a settlement (admin only)
- `GET /caisse-history/employee/:id` -- Get settlement history for an employee (admin only)
- `GET /caisse-history/last-resets` -- Get all employees' last reset dates (admin only)

**New: `server/src/caisse-history/caisse-history.module.ts`**
- Register CaisseHistory entity, import User entity
- Import AnalyticsModule or directly inject the required repositories (Command, OmraOrder, OmraVisa)

**Modified: `server/src/app.module.ts`**
- Import CaisseHistoryModule

**Modified: `server/src/analytics/analytics.service.ts` > `getEmployeeCaisseStats()`**
- Accept an optional `lastResetDates: Record<string, Date>` parameter
- When calculating totals for each employee, filter commands/omraOrders/omraVisas to only include records with `createdAt > lastResetDate` for that employee
- If no reset date exists for an employee, include all their records (current behavior)
- The controller will fetch last reset dates from the caisse-history service and pass them in

**Modified: `server/src/analytics/analytics.module.ts`**
- Import CaisseHistory entity (or inject CaisseHistoryService)

**Modified: `server/src/analytics/analytics.controller.ts`**
- Inject CaisseHistoryService to fetch last reset dates before calling getEmployeeCaisseStats

### Frontend Files

**Modified: `src/lib/api.ts`**
- Add DTOs: `CreateCaisseSettlementDto` (employeeId, newBalance, notes)
- Add `CaisseSettlement` response type (id, employeeId, caisseAmount, impayesAmount, beneficesAmount, commandCount, newBalance, adminId, notes, resetDate)
- Add API methods:
  - `createCaisseSettlement(dto)`: POST /caisse-history/settle
  - `getCaisseSettlements(employeeId)`: GET /caisse-history/employee/:id
  - `getCaisseLastResets()`: GET /caisse-history/last-resets

**New: `src/hooks/useCaisseHistory.ts`**
- `useCaisseSettlements(employeeId)`: React Query hook for settlement history
- `useCreateCaisseSettlement()`: Mutation hook that invalidates both `['analytics', 'employee-caisses']` and `['caisse-history']` query keys
- `useCaisseLastResets()`: Hook for fetching all last reset dates

**Modified: `src/components/accounting/EmployeeCaisseTable.tsx`**
Major changes:
- Add a new "Actions" column header to the table
- Per employee row: Add two icon buttons:
  - **Settle button** (Banknote icon): Opens the settlement dialog
  - **History button** (History icon): Opens the history modal
- **Settlement Dialog** (new inline component or separate):
  - Shows current employee name, Caisse (green), Impayes (red), Benefices (blue)
  - Input for "Nouveau solde" (New Balance) defaulting to 0
  - Textarea for notes (placeholder: "Caisse reglée pour fevrier 2026...")
  - Confirm/Cancel buttons
  - On confirm: calls createCaisseSettlement mutation
- **History Modal** (new inline component or separate):
  - Table with columns: Date, Caisse (green), Impayes (red), Benefices (blue), Dossiers, Notes
  - Shows all past settlements for the selected employee
  - Bottom row shows cumulative totals across all settlements
  - Empty state if no history exists

**Modified: `src/i18n/locales/fr/accounting.json`**
Add under `caisses`:
```
"actions": "Actions",
"settle": "Régler la caisse",
"history": "Historique des règlements",
"settleDialog": {
  "title": "Règlement de caisse",
  "subtitle": "Enregistrer un règlement pour {{name}}",
  "currentCaisse": "Caisse actuelle",
  "currentImpayes": "Impayés actuels",
  "currentBenefices": "Bénéfices actuels",
  "newBalance": "Nouveau solde",
  "notes": "Notes",
  "notesPlaceholder": "Caisse réglée pour...",
  "confirm": "Confirmer le règlement",
  "saving": "Enregistrement..."
},
"historyDialog": {
  "title": "Historique des règlements",
  "subtitle": "Tous les règlements passés pour {{name}}",
  "table": {
    "date": "Date",
    "caisse": "Caisse",
    "impayes": "Impayés",
    "benefices": "Bénéfices",
    "commands": "Dossiers",
    "notes": "Notes"
  },
  "cumulative": "Total cumulé",
  "empty": {
    "title": "Aucun règlement",
    "description": "Aucun règlement n'a été effectué pour cet employé"
  }
}
```

**Modified: `src/i18n/locales/ar/accounting.json`**
Arabic equivalents for all new keys:
```
"actions": "إجراءات",
"settle": "تسوية الصندوق",
"history": "سجل التسويات",
"settleDialog": {
  "title": "تسوية الصندوق",
  "subtitle": "تسجيل تسوية لـ {{name}}",
  "currentCaisse": "الصندوق الحالي",
  "currentImpayes": "غير المدفوع الحالي",
  "currentBenefices": "الأرباح الحالية",
  "newBalance": "الرصيد الجديد",
  "notes": "ملاحظات",
  "notesPlaceholder": "تسوية الصندوق لشهر...",
  "confirm": "تأكيد التسوية",
  "saving": "جاري الحفظ..."
},
"historyDialog": {
  "title": "سجل التسويات",
  "subtitle": "جميع التسويات السابقة لـ {{name}}",
  "table": {
    "date": "التاريخ",
    "caisse": "الصندوق",
    "impayes": "غير المدفوع",
    "benefices": "الأرباح",
    "commands": "الملفات",
    "notes": "ملاحظات"
  },
  "cumulative": "الإجمالي التراكمي",
  "empty": {
    "title": "لا توجد تسويات",
    "description": "لم يتم إجراء أي تسوية لهذا الموظف"
  }
}
```

### Key Logic: Active Balance Calculation

The core change to `getEmployeeCaisseStats()` in the backend service:

```text
For each employee:
  1. Look up their last reset date from caisse_history
  2. If a reset date exists:
     - Only sum commands/omraOrders/omraVisas where createdAt > lastResetDate
     - Add the "newBalance" from the last settlement as a starting offset
  3. If no reset date exists:
     - Sum all records (current behavior, no change)
```

This ensures the Caisse column always shows the "active" unsettled period, while the history modal preserves the full audit trail.

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `server/src/database/migrations/1771000000000-AddCaisseHistory.ts` | Create | Migration for caisse_history table |
| `server/src/caisse-history/entities/caisse-history.entity.ts` | Create | CaisseHistory entity |
| `server/src/caisse-history/dto/create-caisse-settlement.dto.ts` | Create | Settlement DTO with validation |
| `server/src/caisse-history/caisse-history.service.ts` | Create | Settlement CRUD + last reset date logic |
| `server/src/caisse-history/caisse-history.controller.ts` | Create | REST endpoints (admin only) |
| `server/src/caisse-history/caisse-history.module.ts` | Create | Module registration |
| `server/src/app.module.ts` | Modify | Import CaisseHistoryModule |
| `server/src/analytics/analytics.service.ts` | Modify | Filter records by last reset date |
| `server/src/analytics/analytics.module.ts` | Modify | Import CaisseHistory dependencies |
| `server/src/analytics/analytics.controller.ts` | Modify | Inject CaisseHistoryService for reset dates |
| `src/lib/api.ts` | Modify | Add settlement DTOs and API methods |
| `src/hooks/useCaisseHistory.ts` | Create | React Query hooks for settlements |
| `src/components/accounting/EmployeeCaisseTable.tsx` | Modify | Add Actions column, settle dialog, history modal |
| `src/i18n/locales/fr/accounting.json` | Modify | French translations for settlement UI |
| `src/i18n/locales/ar/accounting.json` | Modify | Arabic translations for settlement UI |

