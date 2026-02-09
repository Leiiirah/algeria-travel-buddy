

# Fix Commands Page Responsive Design

## Issues Found

1. **Table has 11 columns** -- even with `overflow-x-auto`, the table is very wide and hard to use on mobile. Some columns should be hidden on small screens.
2. **Details dialog** (line 1158) uses `max-w-2xl` without mobile override -- should be `max-w-[95vw] sm:max-w-2xl`.
3. **Visa-specific fields in details** (line 1199) still uses `grid-cols-2` without responsive prefix.
4. **Destination/Supplier grid in details** (line 1236) still uses `grid-cols-2` without responsive prefix.
5. **Financial summary in details** (line 1305) uses `grid-cols-2 md:grid-cols-4` -- OK but could use `grid-cols-1 sm:grid-cols-2`.
6. **Stats card text** -- `text-2xl` amounts can overflow on very small screens.
7. **Status dropdown** in table has fixed `w-[160px]` which takes too much space on mobile.
8. **Create dialog** (line 788) uses `max-w-lg` without mobile viewport override.

## Changes

### `src/pages/CommandsPage.tsx`

| Line | Current | Change |
|------|---------|--------|
| 788 | `max-w-lg max-h-[90vh]` | `max-w-[95vw] sm:max-w-lg max-h-[90vh]` |
| 1017-1029 | All 11 table headers visible | Hide `destination`, `buyingPrice`, `profit`, `supplier` columns on small screens with `hidden md:table-cell` |
| 1058, 1066-1068, 1070 | Corresponding table cells always visible | Same `hidden md:table-cell` classes |
| 1078 | Status SelectTrigger `w-[160px]` | `w-[120px] sm:w-[160px]` |
| 1158 | Details dialog `max-w-2xl` | `max-w-[95vw] sm:max-w-2xl` |
| 1199 | `grid-cols-2 gap-4` | `grid-cols-1 sm:grid-cols-2 gap-4` |
| 1236 | `grid-cols-2 gap-4` | `grid-cols-1 sm:grid-cols-2 gap-4` |
| 1305 | `grid-cols-2 md:grid-cols-4` | `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` |

This keeps the table usable on mobile by showing the most important columns (service, client, price, payment, remaining, status, actions) and hiding secondary ones (destination, buying price, profit, supplier) below the `md` breakpoint.

