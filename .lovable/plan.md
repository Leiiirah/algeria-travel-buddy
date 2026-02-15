

# Add Pagination to Commands Table

## Problem
The commands page doesn't pass `page` or `limit` to the API, so the backend defaults to `limit=20`. Commands beyond the first 20 are invisible.

## Changes

### 1. Add pagination state (`src/pages/CommandsPage.tsx`)
Add a `currentPage` state variable (default: 1) and pass `page` and `limit` into the `useCommands` filters.

### 2. Reset page on filter/search change (`src/pages/CommandsPage.tsx`)
When `filters` or `debouncedSearch` change, reset `currentPage` to 1 so the user always sees the first page of new results.

### 3. Add pagination UI after the table (`src/pages/CommandsPage.tsx`)
After the `</Table>` closing tag (around line 1302), add a pagination bar showing:
- Previous / Next buttons
- Page number indicators (e.g., "Page 2 of 5")
- Total commands count

Uses the existing `Pagination` components from `src/components/ui/pagination.tsx`.

### 4. Increase default limit
Set `limit: 50` for a reasonable page size (instead of the backend default of 20).

## Technical Details

| File | Change |
|------|--------|
| `src/pages/CommandsPage.tsx` (line ~72) | Add `const [currentPage, setCurrentPage] = useState(1)` |
| `src/pages/CommandsPage.tsx` (line ~112) | Pass `page: currentPage, limit: 50` to `useCommands` |
| `src/pages/CommandsPage.tsx` (line ~72) | Reset `currentPage` to 1 when filters/search change (useEffect) |
| `src/pages/CommandsPage.tsx` (after line 1302) | Add pagination controls using total/totalPages from API response |
| `src/i18n/locales/fr/commands.json` | Add pagination labels: `"page"`, `"of"`, `"total"`, `"previous"`, `"next"` |
| `src/i18n/locales/ar/commands.json` | Add Arabic pagination labels |

