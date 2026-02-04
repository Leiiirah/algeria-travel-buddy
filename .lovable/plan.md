

# Fix: Limit "Assign To" Feature to VISA Commands Only

## Problem

The "Assign To" employee assignment feature is currently available for all service types in the Commands page (VISA, Billets, Residence, Dossiers, etc.). According to your requirement, this feature should **only** be available for:

1. **VISA commands** (in the Commands page)
2. **OMRA orders and visas** (already correctly implemented in OmraOrdersTab and OmraVisasTab)

## Solution

Modify the condition for displaying the "Assign To" dropdown in `CommandsPage.tsx` to check if the selected service type is 'visa' before rendering the assignment dropdown.

### Current Code (Line 834-855 in CommandsPage.tsx)

```typescript
{/* Assign To - Admin Only */}
{user?.role === 'admin' && (
  <div className="space-y-2 mt-4">
    <Label>{t('form.assignTo')}</Label>
    <Select...>
```

### New Code

```typescript
{/* Assign To - Admin Only for VISA services */}
{user?.role === 'admin' && selectedService && getServiceType(selectedService) === 'visa' && (
  <div className="space-y-2 mt-4">
    <Label>{t('form.assignTo')}</Label>
    <Select...>
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Modified | 1 (`src/pages/CommandsPage.tsx`) |
| Lines Changed | 1 line condition update |
| Risk Level | Very Low |
| Breaking Changes | None |

## Behavior After Fix

| Service Type | "Assign To" Dropdown Visible (Admin) |
|--------------|--------------------------------------|
| VISA | ✅ Yes |
| Billets (Tickets) | ❌ No |
| Residence | ❌ No |
| Dossiers | ❌ No |
| Other services | ❌ No |

## Note

The OMRA module (`OmraOrdersTab.tsx` and `OmraVisasTab.tsx`) already has the "Assign To" feature correctly implemented and will remain unchanged, as OMRA orders and visas should support employee assignment.

