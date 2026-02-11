
# Make Reports Chart Dynamic with Real Data

## Overview
Replace the hardcoded dummy data in the "Revenus vs Depenses" chart on the Rapports tab with real data computed from existing payments (revenue) and expenses (depenses), grouped by month for the last 6 months.

## Changes

### 1. Fetch Expenses Data in AccountingPage

**File:** `src/pages/AccountingPage.tsx`
- Import `useExpenses` from `@/hooks/useExpenses`
- Call `useExpenses()` to fetch all expenses alongside existing payments and commands data

### 2. Replace Hardcoded `monthlyData` with Dynamic Computation

**File:** `src/pages/AccountingPage.tsx`
- Remove the static `monthlyData` array (lines 125-132)
- Add a `useMemo` that computes monthly data for the last 6 months:
  - Loop over the last 6 months (including current month)
  - For each month, sum payment amounts from `allPayments` where `createdAt` falls in that month (this is the "revenus" / revenue)
  - For each month, sum expense amounts from `expenses` where the expense date falls in that month (this is the "depenses" / expenses)
  - Format month names using the current i18n locale (French or Arabic month abbreviations)
- The result is an array like `[{ mois: "Sep", revenus: 50000, depenses: 12000 }, ...]`

### Technical Details

| Area | File | Change |
|------|------|--------|
| Import | `AccountingPage.tsx` | Add `useExpenses`, `useMemo` imports |
| Data fetch | `AccountingPage.tsx` | Call `useExpenses()` hook |
| Chart data | `AccountingPage.tsx` | Replace static array with dynamic `useMemo` computation |

The chart component itself (`BarChart`, `Bar`, etc.) remains unchanged -- only its `data` prop switches from static to dynamic.
