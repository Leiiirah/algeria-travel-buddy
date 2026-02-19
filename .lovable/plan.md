
# Fix: Persist bankName & bankAccount in the Database

## Root Cause (Confirmed)

Looking at the POST request body the user shared, `bankName` and `bankAccount` are **completely absent** from the payload. This is a 3-layer problem:

1. **Backend entity** (`client-invoice.entity.ts`): No `bankName` or `bankAccount` columns exist on the `client_invoices` table
2. **Backend DTOs** (`create-client-invoice.dto.ts`, `update-client-invoice.dto.ts`): No `bankName` or `bankAccount` fields — so even if the frontend sent them, the backend would strip/ignore them
3. **Frontend** (`InvoicesPage.tsx`): `pdfBankName`/`pdfBankAccount` are separate state variables, never included in the `formData` sent to the API — so they are never persisted

The previous approach of treating them as "ephemeral PDF-only fields" does not work because there is no mechanism to persist them between sessions.

---

## Solution: Add bankName & bankAccount to the database

### 1. Backend Entity — Add two new columns

**File: `server/src/client-invoices/entities/client-invoice.entity.ts`**

Add after `validityHours`:
```typescript
@Column({ type: 'varchar', length: 100, nullable: true })
bankName: string | null;

@Column({ type: 'varchar', length: 100, nullable: true })
bankAccount: string | null;
```

### 2. Backend DTOs — Accept the new fields

**File: `server/src/client-invoices/dto/create-client-invoice.dto.ts`**

Add:
```typescript
@IsOptional()
@IsString()
@MaxLength(100)
bankName?: string;

@IsOptional()
@IsString()
@MaxLength(100)
bankAccount?: string;
```

**File: `server/src/client-invoices/dto/update-client-invoice.dto.ts`**

Same optional fields added.

### 3. Database Migration — Add the two columns

**File: `server/src/database/migrations/1771700000000-AddBankFieldsToClientInvoices.ts`** (new file)

```sql
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS "bankName" varchar(100) DEFAULT NULL;
ALTER TABLE client_invoices ADD COLUMN IF NOT EXISTS "bankAccount" varchar(100) DEFAULT NULL;
```

### 4. Frontend — Include bankName/bankAccount in formData (not separate state)

**File: `src/pages/InvoicesPage.tsx`**

- Remove the separate `pdfBankName` / `pdfBankAccount` state variables entirely
- Add `bankName` and `bankAccount` directly into `formData` (they are part of `CreateClientInvoiceDto`/`UpdateClientInvoiceDto` now)
- In `openCreateDialog`: pre-populate `formData.bankName = agencySettings?.bankName || AGENCY_INFO.bankName`
- In `openEditDialog`: pre-populate from `invoice.bankName` (or fall back to agency settings)
- In `handleSubmit`: `bankName`/`bankAccount` are already in `formData`, sent to the API automatically
- In `handleDownloadPdf`: read `invoice.bankName` / `invoice.bankAccount` directly from the stored invoice — no override needed
- Form inputs bind to `formData.bankName` / `formData.bankAccount` via `setFormData`

### 5. Also update the TypeScript frontend type

**File: `src/types/index.ts`**

Add `bankName` and `bankAccount` fields to the `ClientInvoice` type:
```typescript
bankName: string | null;
bankAccount: string | null;
```

And add them to `CreateClientInvoiceDto` / `UpdateClientInvoiceDto` in `src/lib/api.ts`.

---

## Files to Change

| File | Change |
|---|---|
| `server/src/client-invoices/entities/client-invoice.entity.ts` | Add `bankName` and `bankAccount` columns |
| `server/src/client-invoices/dto/create-client-invoice.dto.ts` | Add optional `bankName` and `bankAccount` fields |
| `server/src/client-invoices/dto/update-client-invoice.dto.ts` | Add optional `bankName` and `bankAccount` fields |
| `server/src/database/migrations/1771700000000-AddBankFieldsToClientInvoices.ts` | New migration: ALTER TABLE to add the two columns |
| `src/types/index.ts` | Add `bankName` and `bankAccount` to `ClientInvoice` type |
| `src/lib/api.ts` | Add fields to `CreateClientInvoiceDto` and `UpdateClientInvoiceDto` |
| `src/pages/InvoicesPage.tsx` | Remove separate state vars, merge into `formData`, read from `invoice` in download |

## Result

- When creating/editing an invoice, the user sets Banque & Compte in the form
- These values are sent in the POST/PUT request body and persisted in the database
- When downloading a PDF from the table row, `invoice.bankName` and `invoice.bankAccount` are read directly from the saved invoice — no fallback to defaults unless the fields are null
- Null values still fall back to agency settings → `AGENCY_INFO` constants as before
