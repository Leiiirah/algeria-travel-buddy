
# Allow Admins to Edit Commands at Any Time

## Root Cause

There are two issues in `src/pages/CommandsPage.tsx`:

1. **`canEdit` is computed the same way for everyone** (line 1178):
   ```typescript
   const canEdit = user ? isCommandEditable(command, user.id) : false;
   ```
   `isCommandEditable` checks ownership AND the 24-hour window — admins are subject to the same lock as employees.

2. **The Edit menu item is gated on `canEdit`** (line 1278):
   ```tsx
   {canEdit && (
     <DropdownMenuItem onClick={() => handleEditCommand(command)}>
   ```
   So after 24 hours, the Edit option is hidden for admins too.

3. **The lock icon** (lines 1251–1258) always shows a lock for admins after 24h, which is misleading.

## Fix — Two Lines Changed

### Change 1 — `canEdit` logic (line 1178)

```typescript
// BEFORE
const canEdit = user ? isCommandEditable(command, user.id) : false;

// AFTER
const canEdit = user?.role === 'admin' || (user ? isCommandEditable(command, user.id) : false);
```

Admins always get `canEdit = true`. Employees still follow the 24h rule.

### Change 2 — Lock icon display (lines 1251–1258)

The lock/unlock indicator below the status badge should show unlock for admins unconditionally:

```tsx
// BEFORE
{canEdit ? (
  <> <Unlock ... /> <span>{getTimeRemaining(...)}</span> </>
) : (
  <Lock ... />
)}

// AFTER
{canEdit ? (
  <>
    <Unlock ... />
    {user?.role !== 'admin' && <span>{getTimeRemaining(...)}</span>}
  </>
) : (
  <Lock ... />
)}
```

This hides the "Xh restantes" countdown for admins (since they're always unlocked, the countdown is irrelevant to them), but still shows the unlock icon clearly.

## Files Changed

| File | Change |
|---|---|
| `src/pages/CommandsPage.tsx` | 2 targeted edits: fix `canEdit` logic + clean up lock icon for admins |

## No Other Changes Needed

- `canDelete` already handles admins correctly: `const canDelete = user?.role === 'admin' || canEdit;`
- The backend `CommandsService.remove()` already bypasses the 24h check for admins (the 24h check is frontend-only)
- `handleEditCommand` and `handleDeleteCommand` already work for admins — they just never got called because the menu item was hidden
