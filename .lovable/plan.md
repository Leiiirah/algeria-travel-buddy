

# Fix TVA String Concatenation Bug in Invoice PDFs

## Problem

The `totalAmount`, `ticketPrice`, `agencyFees`, `paidAmount`, and `remaining` values arrive from the API as **strings** (e.g., `"100000.00"`), not numbers. When JavaScript evaluates `data.totalAmount + Math.round(data.totalAmount * 0.09)`, it performs string concatenation instead of numeric addition, producing `"100000.009000"` instead of `109000`.

## Solution

Wrap all numeric data fields with `Number()` at the point of use in `src/components/invoice/InvoiceTemplate.tsx`. This ensures arithmetic operations work correctly.

## File to Modify

### `src/components/invoice/InvoiceTemplate.tsx`

Add a normalization block near the top of the component (after props destructuring) that converts all financial fields to numbers:

```typescript
const amount = Number(data.totalAmount) || 0;
const ticket = Number(data.ticketPrice) || 0;
const fees = Number(data.agencyFees) || 0;
const paid = Number(data.paidAmount) || 0;
const rem = Number(data.remaining) || 0;
const tva = Math.round(amount * 0.09);
const totalTTC = amount + tva;
```

Then replace all occurrences throughout the template:
- `fmt(data.ticketPrice)` becomes `fmt(ticket)`
- `fmt(data.agencyFees)` becomes `fmt(fees)`
- `fmt(data.totalAmount)` becomes `fmt(amount)`
- `fmt(Math.round(data.totalAmount * 0.09))` becomes `fmt(tva)`
- `fmt(data.totalAmount + Math.round(data.totalAmount * 0.09))` becomes `fmt(totalTTC)`
- `fmt(data.paidAmount)` becomes `fmt(paid)`
- `fmt(data.remaining)` becomes `fmt(rem)`
- `data.remaining > 0` becomes `rem > 0`
- `numberToWords(data.totalAmount)` becomes `numberToWords(totalTTC)`

This is a single-file fix affecting around 10 lines.

