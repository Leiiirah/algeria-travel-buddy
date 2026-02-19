
# Invoice Template: 3 Improvements

## Summary of Changes

### 1. Remove "(Frais d'agence)" from the TVA row label

In `InvoiceTemplate.tsx`, line 349, the TVA row currently reads:
- FR: `TVA 9% (Frais d'agence)`
- AR: `ضريبة القيمة المضافة 9% (رسوم الوكالة)`

It will be simplified to:
- FR: `TVA 9%`
- AR: `ضريبة القيمة المضافة 9%`

---

### 2. Per-invoice Banque & Compte fields (admin only)

Currently, "Banque" and "Compte" in the PDF come exclusively from global agency settings. The user wants to be able to override these values per invoice when creating/editing a facture.

**Approach:**
- Add two new fields to `ClientInvoicePdfData` interface: `bankName?: string` and `bankAccount?: string` (separate from, but named the same as what's already in `AgencyInfoParam`)
- In `InvoiceTemplate.tsx`, the Règlement section already reads `info.bankName` and `info.bankAccount` (merged from agency settings). We will change it to prefer per-invoice values when present: `data.bankName || info.bankName`
- In `InvoicesPage.tsx` form dialog, add two new input fields (visible to all users, since any user can create invoices) for "Banque" and "Compte" — pre-populated with the agency settings values as defaults when the dialog opens
- Pass the values through `handleDownloadPdf` → `generateClientInvoicePdf` → `InvoiceTemplate`

No backend/database change is required — the bank override values are only needed at PDF generation time, not stored per invoice.

---

### 3. Add "Conditions générales" section to the PDF

Replace the current single-line "Billet émis et non remboursable" on finale invoices with a proper boxed "Conditions générales" block containing the 4 bullet points provided, placed between the payment/signature section and the spacer div (before the footer).

The conditions will appear on **finale invoices only** (proforma keeps its existing validity/warning block unchanged).

Content:
```
Conditions générales :
• Les billets émis ne sont ni remboursables ni modifiables après confirmation, sauf selon les conditions de la compagnie aérienne.
• Les frais de service restent non remboursables.
• Toute modification peut entraîner des frais supplémentaires.
• La responsabilité de l'agence se limite à l'émission du billet.
```

Styled as a light bordered box consistent with the existing conditions block on proforma invoices.

---

## Files to Change

### `src/components/invoice/InvoiceTemplate.tsx`

1. **Interface `ClientInvoicePdfData`**: Add `bankName?: string` and `bankAccount?: string` fields
2. **Règlement section** (~line 395-400): Change `info.bankName` → `data.bankName || info.bankName` and `info.bankAccount` → `data.bankAccount || info.bankAccount`
3. **TVA row label** (line 349): Remove "(Frais d'agence)" / "(رسوم الوكالة)"
4. **Conditions section for finale** (~line 483-489): Replace the simple "Billet émis et non remboursable" line with the full boxed conditions block

### `src/pages/InvoicesPage.tsx`

1. **`formData` state** (line 88-97): Add `bankName` and `bankAccount` to the initial state
2. **`openCreateDialog`** (line 120-133): Pre-populate `bankName` and `bankAccount` from `agencySettings` as defaults
3. **`openEditDialog`** (line 135-160): Include `bankName` and `bankAccount` in the edit form state
4. **`handleDownloadPdf`** (line 182-209): Pass `bankName` and `bankAccount` from the invoice data (or directly from the form — but since they're not stored per invoice in the DB, we'd pass from `agencySettings` for downloaded existing invoices, or store them in formData for new ones). 

> **Note on persistence**: Since `bankName`/`bankAccount` per invoice aren't stored in the database, for existing invoices the PDF will fall back to agency settings. For new invoices created through the form, the overridden values will be used at creation time to generate the PDF, but they won't persist on subsequent downloads. This is acceptable and matches the user's request ("when creating a facture").

5. **Form dialog** (~line 573-602): Add two new input fields under the PNR/Payment section for "Banque" and "Compte", visible when `formData.type === 'finale'` (since bank details are most relevant for final invoices)

### No backend/DB changes needed
All changes are frontend-only (PDF template + form UI). The bank override values are ephemeral at PDF-generation time.
