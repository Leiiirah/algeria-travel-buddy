

# Add "Attribué à" Badge to Commands Table

## Current Status

| Location | Displays Assignee? |
|----------|-------------------|
| Dashboard (Recent Commands) | ✅ Yes |
| Omra Orders Tab | ✅ Yes |
| Omra Visas Tab | ✅ Yes |
| **Commands Tab** |  **yes , implement it here too ** |

## Solution

Add an "Attribué à" badge in the Commands table (similar to how it's already implemented in the other views). The badge will appear below the client name and phone number in each command row.

## Visual Preview

Each command row in the table will display:
```
┌─────────────────────────────────────┐
│ Client                              │
│ Ahmed Benali                        │
│ 0555 123 456                        │
│ [par Zoubir]  ← New badge           │
└─────────────────────────────────────┘
```

## Implementation Details

### File: `src/pages/CommandsPage.tsx`

**Location:** Client cell in the table body (around line 948-952)

**Current Code:**
```tsx
<TableCell>
  <div>
    <p className="font-medium">{command.data.clientFullName}</p>
    <p className="text-xs text-muted-foreground">{command.data.phone}</p>
  </div>
</TableCell>
```

**New Code:**
```tsx
<TableCell>
  <div>
    <p className="font-medium">{command.data.clientFullName}</p>
    <p className="text-xs text-muted-foreground">{command.data.phone}</p>
    {command.assignee && (
      <Badge 
        variant="outline" 
        className="text-xs mt-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      >
        {t('table.by')} {command.assignee.firstName}
      </Badge>
    )}
  </div>
</TableCell>
```

## Technical Summary

| Aspect | Details |
|--------|---------|
| Files Modified | 1 (`src/pages/CommandsPage.tsx`) |
| Lines Changed | ~5 lines added |
| Risk Level | Very Low |
| Breaking Changes | None |
| Translations Required | None (already exists: `table.by = "par"`) |

## Result

After implementation, the assigned employee will be visible on each command row in the Commands page, matching the styling used in:
- Dashboard recent commands
- Omra Orders table
- Omra Visas table

