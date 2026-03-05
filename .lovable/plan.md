

# Fix Status Filter Mismatch in Commands Page

## Problem
The status filter dropdown in the Commands page uses wrong status values:
- **Filter shows**: `en_attente`, `en_cours`, `termine`, `annule` (generic statuses from Omra)
- **Actual command statuses**: `dossier_incomplet`, `depose`, `en_traitement`, `accepte`, `refuse`, `visa_delivre`, `retire`

This means the filter never matches any commands since the values don't exist in the data.

## Solution

**File: `src/pages/CommandsPage.tsx` (lines 785-790)**

Replace the hardcoded wrong filter options with the correct `statusOptions` array that is already defined on lines 406-414. Simply reuse that array by mapping it to the filter format:

```typescript
options: statusOptions.map(s => ({ label: s.label, value: s.value })),
```

This single change aligns the filter dropdown with the actual command statuses used throughout the application.

### Files Changed

| File | Change |
|---|---|
| `src/pages/CommandsPage.tsx` | Replace incorrect filter status options with the correct command status values |

