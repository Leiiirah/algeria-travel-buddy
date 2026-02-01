

# Plan: Add Filters to Employee Accounting Page

## Overview

This plan adds comprehensive filtering capabilities to the `/comptabilite-employes` page, following the same patterns used in other pages like AccountingPage and SupplierAccountingPage.

## Filters to Add

| Filter | Type | Purpose |
|--------|------|---------|
| Search | Text input | Search by employee name or note content |
| Employee | Select dropdown | Filter transactions by specific employee |
| Transaction Type | Select dropdown | Filter by avance, credit, or salaire |
| Date From | Date picker | Show transactions from this date |
| Date To | Date picker | Show transactions until this date |

## Technical Implementation

### Frontend Changes

**File: `src/pages/EmployeeAccountingPage.tsx`**

1. **Add state for filters:**
   - `searchQuery` for text search
   - `filters` object containing: `employeeId`, `type`, `fromDate`, `toDate`

2. **Import AdvancedFilter component** from `@/components/search/AdvancedFilter`

3. **Add useDebounce hook** for search input optimization

4. **Configure filter options:**
   ```typescript
   const filterConfig = [
     {
       key: 'employeeId',
       label: 'Employe',
       type: 'select',
       options: employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))
     },
     {
       key: 'type',
       label: 'Type',
       type: 'select',
       options: [
         { value: 'avance', label: 'Avance' },
         { value: 'credit', label: 'Credit' },
         { value: 'salaire', label: 'Salaire' }
       ]
     },
     {
       key: 'fromDate',
       label: 'Date debut',
       type: 'date-range'
     },
     {
       key: 'toDate',
       label: 'Date fin',
       type: 'date-range'
     }
   ];
   ```

5. **Add filtering logic** using `useMemo` to filter transactions based on:
   - Search query (matches employee name or note)
   - Selected employee ID
   - Transaction type
   - Date range (from/to)

6. **Add AdvancedFilter component** above the History tab table with appropriate placeholder text

7. **Update totals calculation** to use filtered transactions for the summary cards (optional - could keep global totals)

### Filter Logic

The filtering will be applied client-side since all transactions are already loaded:

```typescript
const filteredTransactions = useMemo(() => {
  if (!transactions) return [];
  
  return transactions.filter(t => {
    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const employeeName = `${t.employee?.firstName} ${t.employee?.lastName}`.toLowerCase();
      const noteMatch = t.note?.toLowerCase().includes(searchLower);
      if (!employeeName.includes(searchLower) && !noteMatch) return false;
    }
    
    // Employee filter
    if (filters.employeeId && t.employeeId !== filters.employeeId) return false;
    
    // Type filter
    if (filters.type && t.type !== filters.type) return false;
    
    // Date range filter
    if (filters.fromDate && new Date(t.date) < new Date(filters.fromDate)) return false;
    if (filters.toDate && new Date(t.date) > new Date(filters.toDate)) return false;
    
    return true;
  });
}, [transactions, debouncedSearch, filters]);
```

## UI Layout

The filter bar will be placed in the "Historique" tab content, above the transactions table:

```
+--------------------------------------------------+
| Historique Tab                                    |
+--------------------------------------------------+
| [Search input...] [Filtres (badge count)]        |
|                                                   |
| Filter popover contains:                          |
|   - Employe (dropdown)                            |
|   - Type (dropdown)                               |
|   - Date debut (date picker)                      |
|   - Date fin (date picker)                        |
+--------------------------------------------------+
| Table: Date | Employe | Type | Montant | Note    |
+--------------------------------------------------+
```

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/EmployeeAccountingPage.tsx` | Add filter state, AdvancedFilter component, and filtering logic |

## Summary Card Behavior

The summary cards (Total Avances, Total Credits, Total Salaires) will continue to show **global totals** regardless of filters applied. This is consistent with how other accounting pages work - the cards show the overall situation while the table can be filtered.

