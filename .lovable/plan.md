

# Replace "Nouveau solde" with Individual Reset Fields

## What Changes

Currently when settling an employee's caisse, the admin sees a single "Nouveau solde" (new balance) input field. This will be replaced with three editable fields pre-filled with current values, allowing the admin to set new starting values for each metric independently:

- **Caisse** (amount collected)
- **Impayes** (unpaid amount)
- **Benefices** (profits)

The current read-only stat cards showing these values will become editable input fields instead.

## Files to Change

### 1. Frontend -- `src/components/accounting/CaisseSettleDialog.tsx`

- Remove the single `newBalance` state, replace with three states: `newCaisse`, `newImpayes`, `newBenefices` -- each pre-filled with the employee's current values when the dialog opens
- Replace the read-only stat cards with editable Input fields for Caisse, Impayes, and Benefices
- Keep the "Dossiers" (commands count) card as read-only since it cannot be manually set
- Send `newCaisse`, `newImpayes`, `newBenefices` instead of `newBalance` in the mutation payload

### 2. Frontend -- `src/hooks/useCaisseHistory.ts`

- Update the mutation type to send `{ employeeId, newCaisse, newImpayes, newBenefices, notes }` instead of `{ employeeId, newBalance, notes }`

### 3. Frontend -- `src/lib/api.ts`

- Update `createCaisseSettlement` method signature to accept the three new fields instead of `newBalance`

### 4. Frontend -- `src/types/index.ts`

- Update `CaisseSettlement` type: replace `newBalance` with `newCaisse`, `newImpayes`, `newBenefices`

### 5. Frontend -- `src/components/accounting/CaisseHistoryDialog.tsx`

- Update history table to show the three new columns instead of the single "Nouveau solde" column

### 6. Frontend -- Translation files (`fr/accounting.json`, `ar/accounting.json`)

- Add labels for the new fields: `newCaisse`, `newImpayes`, `newBenefices`
- Remove or keep `newBalance` label for backwards display

### 7. Backend -- `server/src/caisse-history/dto/create-caisse-settlement.dto.ts`

- Replace `newBalance` with three optional numeric fields: `newCaisse`, `newImpayes`, `newBenefices`

### 8. Backend -- `server/src/caisse-history/entities/caisse-history.entity.ts`

- Replace `newBalance` column with three new decimal columns: `newCaisse`, `newImpayes`, `newBenefices`

### 9. Backend -- `server/src/caisse-history/caisse-history.service.ts`

- Update `createSettlement` to save the three new fields instead of `newBalance`
- Update `getAllLastResetDates` to return `newCaisse`, `newImpayes`, `newBenefices` instead of `newBalance`

### 10. Backend -- New migration file

- Add migration to:
  - Add columns `newCaisse`, `newImpayes`, `newBenefices` (decimal 12,2, default 0)
  - Migrate existing `newBalance` data into `newCaisse` (for backwards compatibility)
  - Drop `newBalance` column

### 11. Backend -- Analytics service adjustment

- If `getAllLastResetDates` result is used to offset displayed stats, update the consumer to use the three separate values instead of a single `newBalance`

