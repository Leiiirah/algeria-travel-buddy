# Remove TVA, Montant Payé, and Reste à Payer from Invoice PDFs

## Overview

Remove three financial sections from all generated invoice PDFs (both proforma and finale): the TVA (tax) row, the "Montant payé" (paid amount) row, and the "Reste à payer" (remaining) row. The total will now show the amount directly without tax calculations.  
Make sure to not change the UI and design of the invoices 

## Changes

### `src/components/invoice/InvoiceTemplate.tsx`

**1. Remove TVA calculation variables (lines 111-112)**
Remove `tva` and `totalTTC` variables. The `amountWords` (line 126) will use `amount` instead of `totalTTC`.

**2. Simplify the finale financial table (lines 351-398)**
Replace the current finale block that shows Total HT, TVA (9%), Total TTC, Montant payé, and Reste à payer with a single highlighted TOTAL row showing just `amount`.

**3. Remove unused variables (lines 109-110)**
Remove `paid` and `rem` since they are no longer displayed.

**Result**: Both proforma and finale invoices will show a simple TOTAL row with the amount, no tax breakdown, no payment status rows.


| Section         | Before                                                       | After                      |
| --------------- | ------------------------------------------------------------ | -------------------------- |
| Finale table    | Total HT + TVA 9% + Total TTC + Montant payé + Reste à payer | Single TOTAL row           |
| Proforma table  | Single TOTAL row                                             | No change (already simple) |
| Amount in words | Based on totalTTC                                            | Based on amount (no tax)   |
