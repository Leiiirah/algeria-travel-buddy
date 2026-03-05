

# Fix Revenue Display in Reports Chart

## Problem
The chart currently calculates "Revenus" from payment records (`allPayments`), which are filtered by the search/filter state at the top of the payments tab. This means the chart data is affected by active filters and may show 0 when filters exclude payments. Additionally, revenue should reflect command selling prices grouped by month, not individual payment amounts.

## Solution
Change the revenue calculation in the `monthlyData` memo to use `commands` (selling prices) grouped by their `commandDate` or `createdAt`, instead of using `allPayments`. This matches how the stats cards calculate total revenue and ensures the chart always shows complete data regardless of payment filters.

### File: `src/pages/AccountingPage.tsx`

**Change in `monthlyData` useMemo (lines 128-145):**
- Replace the `revenus` calculation from filtering `allPayments` to filtering `commands` by their date (`commandDate ?? createdAt`) and summing `sellingPrice`
- Update the dependency array to include `commands` instead of `allPayments`

```typescript
const revenus = commands
  .filter((cmd) => {
    const cd = new Date(cmd.commandDate ?? cmd.createdAt);
    return cd.getFullYear() === year && cd.getMonth() === month;
  })
  .reduce((sum, cmd) => sum + Number(cmd.sellingPrice || 0), 0);
```

### Files Changed

| File | Change |
|---|---|
| `src/pages/AccountingPage.tsx` | Use command selling prices for revenue in chart instead of filtered payments |

