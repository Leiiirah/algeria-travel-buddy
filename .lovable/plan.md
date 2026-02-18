
# Add TVA (9%) on Agency Fees for Final Invoices

## What the feature does

For **Factures Définitives** (finale invoices) only, a TVA line of 9% is calculated exclusively on the `Frais d'agence` amount and displayed in the financial table. The proforma invoice remains unchanged.

---

## Logic

```
TVA = agencyFees × 9%
Total TTC = ticketPrice + agencyFees + TVA
```

- TVA is shown **only** when `invoiceType === 'finale'` AND `agencyFees > 0`
- The existing `TOTAL` row becomes **TOTAL TTC** for final invoices
- The `totalAmount` field on the data object still drives the amount-in-words sentence in the payment section (so no backend change is needed)

---

## Files to change

### 1. `src/components/invoice/InvoiceTemplate.tsx`

This is the only file that needs to change — the PDF template itself.

**In the financial calculations block (lines ~105-118):**
- Compute `tva = !isProforma ? Math.round(fees * 0.09 * 100) / 100 : 0`

**In the financial table (lines ~330-360):**

Current table rows (when breakdown exists):
```
Prix du billet    | ticketPrice
Frais d'agence    | fees
TOTAL             | amount
```

New table rows for **finale** invoices (when breakdown exists):
```
Prix du billet    | ticketPrice
Frais d'agence HT | fees
TVA 9% (Frais)    | tva        ← new row, finale only
TOTAL TTC         | ticketPrice + fees + tva
```

For **proforma** invoices (unchanged):
```
Prix du billet    | ticketPrice
Frais d'agence    | fees
TOTAL             | amount
```

The `TOTAL` label becomes `TOTAL TTC` on finale invoices to clearly signal the tax-inclusive total.

---

## Technical Details

- TVA row is only rendered when `!isProforma && fees > 0`
- All arithmetic uses `Number()` casts — already done in the existing code — to avoid string bugs
- The bilingual labels:
  - FR: `TVA 9% (Frais d'agence)`
  - AR: `ضريبة القيمة المضافة 9% (رسوم الوكالة)`
- TOTAL label changes:
  - FR: `TOTAL TTC` (finale) / `TOTAL` (proforma)
  - AR: `المجموع الشامل` (finale) / `المجموع` (proforma)
- The `amountWords` in the payment section already reads from `data.totalAmount` — this doesn't change since the `totalAmount` stored in the DB is already the agreed final total. The TVA breakdown is purely informational on the PDF.

No backend changes, no database changes, no i18n file changes, no API changes required.
