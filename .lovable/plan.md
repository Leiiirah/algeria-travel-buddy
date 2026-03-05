

# Fix: Revenue Not Showing in Reports Chart

## Root Cause

The chart calculates "revenus" from the `payments` table (individual payment records), but the agency has **no payment records** — the "Total encaissé" stat confirms 0 DZD. Meanwhile, there are 576,000 DZD in commands (selling prices) that aren't reflected.

The revenue source should be **command selling prices** (matching how "Bénéfice total" is calculated), not individual payment records. This is more meaningful for a "Revenus vs Dépenses" chart — it shows what the agency earned vs what it spent.

## Change — Single File

**`src/pages/AccountingPage.tsx`** — Update the `monthlyData` `useMemo` (lines 128-145):

Replace the revenue calculation from `allPayments` to `commands`, using each command's `sellingPrice` grouped by `commandDate` (or `createdAt`):

```typescript
const monthlyData = useMemo(() => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString(/*...*/);
    
    // Revenue from commands (selling prices) instead of payments
    const revenus = commands
      .filter(c => {
        const cd = new Date(c.commandDate || c.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      })
      .reduce((sum, c) => sum + Number(c.sellingPrice || 0), 0);
    
    // Expenses unchanged
    const depenses = allExpenses
      .filter(e => { ... })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    
    months.push({ mois: label, revenus, depenses });
  }
  return months;
}, [commands, allExpenses, i18n.language]);
```

This ensures the chart reflects the same revenue data as the dashboard stats. The `commands` array is already available (line 103).

