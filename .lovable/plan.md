
# Add "Created by" Badge on Command Items

## Problem
When an employee creates a command, the admin cannot see which employee created it in the commands table. Currently only the "assignee" badge is shown.

## Solution
Add a "par [creator name]" badge next to the client name in the commands table, similar to the existing assignee badge. This badge will show the creator's name so admins can track who created each command.

## Technical Changes

### File: `src/pages/CommandsPage.tsx` (around line 1186)

Add a creator badge right after the client info, before the existing assignee badge:

```typescript
{command.creator && (
  <Badge 
    variant="outline" 
    className="text-xs mt-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  >
    {t('table.by')} {command.creator.firstName}
  </Badge>
)}
```

This will appear with a green style to differentiate it from the blue assignee badge. Both badges will be visible when a command has a different creator and assignee.

| File | Change |
|------|--------|
| `src/pages/CommandsPage.tsx` | Add creator badge ("par [name]") next to client name in commands table |
