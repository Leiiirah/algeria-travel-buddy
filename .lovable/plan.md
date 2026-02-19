
# Fix: Banque & Compte PDF Fields Showing Wrong Values

## Root Cause Analysis

There are two compounding problems:

### Problem 1 — Missing keys in the database (primary cause)

The migration that seeds agency settings (`1770700000000-AddAgencySettings.ts`) only seeds 7 keys: `legalName`, `address`, `phone`, `email`, `nif`, `nis`, `rc`. It does **not** seed `bankName` or `bankAccount`.

So when `agencySettings` is fetched from the API, it returns a map with no `bankName` or `bankAccount` entries. When passed to `mergeAgencyInfo` as `agencyInfo`, `param?.bankName` is `undefined`, so it falls back to the hardcoded `AGENCY_INFO.bankName = 'ccp'` and `AGENCY_INFO.bankAccount = '00799999001499040728'` — the wrong hardcoded values.

### Problem 2 — Form bank fields pre-populate from unloaded data

In `openCreateDialog` and `openEditDialog`, the code does:
```ts
setPdfBankName(agencySettings?.bankName || '');
```
If `agencySettings` hasn't returned `bankName` from the API (because it was never seeded), this sets the form field to `''`. Users see empty inputs and may not know what to put there.

### Problem 3 — Direct download bypasses form bank overrides

The download icon button in the invoices table calls:
```ts
onClick={() => handleDownloadPdf(invoice)
```
— with no bank override arguments. The `pdfBankName`/`pdfBankAccount` state only flows to the PDF when clicking "Télécharger PDF" from inside the **edit dialog**. The table-row download always falls back to `agencySettings`.

---

## Fix Plan

### Fix 1 — Add `bankName` and `bankAccount` to the database via a new migration (backend)

Create a new migration that inserts `bankName` and `bankAccount` into `agency_settings` if they don't already exist. This ensures the Contact settings page shows these fields with correct defaults, and the API returns them properly.

**File: `server/src/database/migrations/1771600000000-AddBankFieldsToAgencySettings.ts`**

```sql
INSERT INTO agency_settings (id, key, value)
SELECT uuid_generate_v4(), 'bankName', 'CCP'
WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'bankName');

INSERT INTO agency_settings (id, key, value)
SELECT uuid_generate_v4(), 'bankAccount', ''
WHERE NOT EXISTS (SELECT 1 FROM agency_settings WHERE key = 'bankAccount');
```

This is safe (uses `WHERE NOT EXISTS`) and idempotent.

### Fix 2 — Fall back to `AGENCY_INFO` constants when form fields are pre-populated (frontend)

In `InvoicesPage.tsx`, change the pre-population logic to always provide a non-empty default even when the API hasn't returned a value for `bankName`/`bankAccount`:

```ts
// openCreateDialog and openEditDialog:
setPdfBankName(agencySettings?.bankName || AGENCY_INFO.bankName);
setPdfBankAccount(agencySettings?.bankAccount || AGENCY_INFO.bankAccount);
```

This ensures the form inputs show the right values (from constants as fallback) so the user can see and edit them.

### Fix 3 — Table row download button should also use the agency settings bank values

In `InvoicesPage.tsx`, the table-row download button currently calls `handleDownloadPdf(invoice)` with no overrides, which is correct behavior — it should use agency settings. The actual fix is Fix 1 (ensuring the DB has the right values). But we also want the direct download to use the same `pdfBankName`/`pdfBankAccount` state that the user can configure. 

The simplest fix: pass `agencySettings?.bankName` and `agencySettings?.bankAccount` explicitly as the overrides when there's no user-provided value, removing the ambiguity entirely. We do this by changing `handleDownloadPdf` to always use the current `pdfBankName`/`pdfBankAccount` state as the source of truth, with proper fallback to constants.

---

## Files to Change

### 1. `server/src/database/migrations/1771600000000-AddBankFieldsToAgencySettings.ts` (new file)

Adds `bankName` and `bankAccount` rows to `agency_settings` safely (no-op if already present).

### 2. `src/pages/InvoicesPage.tsx`

- **Lines 134–135** (`openCreateDialog`): Change `agencySettings?.bankName || ''` → `agencySettings?.bankName || AGENCY_INFO.bankName` and same for bankAccount
- **Lines 163–164** (`openEditDialog`): Same change
- **Line 396** (table download button): Pass `pdfBankName || agencySettings?.bankName || AGENCY_INFO.bankName` and same for account so the direct download also benefits from the correct values
- Add `import { AGENCY_INFO } from '@/constants/agency'` at the top if not already present (it's not currently imported in InvoicesPage)

### 3. `src/components/invoice/InvoiceTemplate.tsx`

No changes needed — the template logic at lines 397–402 (`data.bankName || info.bankName`) is already correct. The fix just ensures the data flowing into it is correct.

---

## Summary

The PDF shows wrong bank values because `bankName`/`bankAccount` were never seeded into the database, causing the API to return nothing for these keys, which forces a fallback to the old hardcoded constants (`'ccp'`). The fix seeds these values into the DB and ensures the frontend form always shows correct defaults.
