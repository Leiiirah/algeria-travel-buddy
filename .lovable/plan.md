

# Fix: Empty SelectItem Value Error

## Problem

The application is crashing with a blank page when trying to add a new command (Omra Orders, Omra Visas, or regular Commands) due to this error:

```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

This is because Radix UI's Select component reserves the empty string (`""`) for clearing the selection and showing the placeholder. You cannot use `value=""` for a SelectItem.

## Root Cause

The recently implemented "Assign To" dropdown feature uses `<SelectItem value="">` for the "Unassigned" option in four locations:

1. `src/pages/CommandsPage.tsx` (line 846)
2. `src/components/omra/OmraOrdersTab.tsx` (line 570)
3. `src/components/omra/OmraVisasTab.tsx` (line 467)
4. `src/components/suppliers/SupplierReceiptsTab.tsx` (line 270)

## Solution

Replace the empty string value with a special placeholder value `"__unassigned__"` (or similar), and handle this value appropriately:

1. In the form state management, convert `"__unassigned__"` to `undefined` when submitting
2. When loading/editing data, convert `undefined`/`null` back to `"__unassigned__"` for display

### Changes Required

**File: `src/pages/CommandsPage.tsx`**

Change the SelectItem and onValueChange handler:
```typescript
// Line 840 - Update onValueChange to convert placeholder to undefined
onValueChange={(value) => setFormData({ 
  ...formData, 
  assignedTo: value === '__unassigned__' ? '' : value 
})}

// Line 846 - Change empty value to placeholder
<SelectItem value="__unassigned__">{t('form.unassigned')}</SelectItem>

// Line 839 - Update value to show placeholder when empty
value={formData.assignedTo || '__unassigned__'}
```

**File: `src/components/omra/OmraOrdersTab.tsx`**

Same pattern:
```typescript
// Line 564 - Update onValueChange
onValueChange={(value) => setFormData({ 
  ...formData, 
  assignedTo: value === '__unassigned__' ? '' : value 
})}

// Line 563 - Update value
value={formData.assignedTo || '__unassigned__'}

// Line 570 - Change empty value to placeholder
<SelectItem value="__unassigned__">{t('orders.form.unassigned')}</SelectItem>
```

**File: `src/components/omra/OmraVisasTab.tsx`**

Same pattern:
```typescript
// Line 461 - Update onValueChange
onValueChange={(value) => setFormData({ 
  ...formData, 
  assignedTo: value === '__unassigned__' ? '' : value 
})}

// Line 460 - Update value
value={formData.assignedTo || '__unassigned__'}

// Line 467 - Change empty value to placeholder
<SelectItem value="__unassigned__">{t('visas.form.unassigned')}</SelectItem>
```

**File: `src/components/suppliers/SupplierReceiptsTab.tsx`**

Same pattern for the order select:
```typescript
// Line 263 - Update value
value={formData.orderId || '__none__'}

// Line 270 - Change empty value to placeholder
<SelectItem value="__none__">Aucune commande</SelectItem>

// Update handleOrderSelect to handle the placeholder value
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Modified | 4 |
| Lines Changed | ~12 per file |
| Risk Level | Low |
| Breaking Changes | None - API payloads remain unchanged |

The form submission logic already handles empty strings correctly by converting them to `undefined` before sending to the API, so only the UI-level Select component needs to be fixed.

## Alternative Approach

Instead of using a special placeholder value, we could also:
- Remove the "Unassigned" option entirely and rely on the placeholder
- Use `undefined` handling differently with controlled vs uncontrolled components

However, the placeholder value approach is the cleanest solution that maintains the current UX where users can explicitly select "Unassigned" to clear an assignment.

