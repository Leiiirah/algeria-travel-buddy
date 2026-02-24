

# Add TVA to Proforma Invoices

## Summary

Currently, the 9% TVA (calculated on agency fees) only appears on Final invoices. This change makes it appear on Proforma invoices as well, using the same calculation and styling.

## Changes — Single File

**`src/components/invoice/InvoiceTemplate.tsx`** — 3 small edits:

### 1. TVA Calculation (line 111)

Remove the `!isProforma` guard so TVA is calculated for both invoice types:

```typescript
// BEFORE
const tva = !isProforma && fees > 0 ? Math.round(fees * 0.09 * 100) / 100 : 0;

// AFTER
const tva = fees > 0 ? Math.round(fees * 0.09 * 100) / 100 : 0;
```

### 2. TVA Row Display (line 348)

Remove the `!isProforma &&` condition so the TVA row renders for both types:

```tsx
// BEFORE
{!isProforma && tva > 0 && (

// AFTER
{tva > 0 && (
```

### 3. Total Row (line 369)

Use `totalTTC` for proforma invoices too when a breakdown exists:

```tsx
// BEFORE
{fmt(hasBreakdown && !isProforma ? totalTTC : amount)} DA

// AFTER
{fmt(hasBreakdown ? totalTTC : amount)} DA
```

### 4. Total Label (lines 364-366)

Update the proforma total label to also say "TOTAL TTC":

```tsx
// BEFORE
{isProforma
  ? (isArabic ? 'المجموع' : 'TOTAL')
  : (isArabic ? 'المجموع الشامل' : 'TOTAL TTC')}

// AFTER
{isArabic ? 'المجموع الشامل' : 'TOTAL TTC'}
```

## Result

Proforma invoices will now show the same TVA 9% line (on agency fees) and TOTAL TTC as Final invoices do. No backend or translation changes needed.
