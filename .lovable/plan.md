

# Fix: Add Client Full Name Field for "Billet Bateau" Service Type

## Problem

When creating a new command and selecting "Billet Bateau" (boat ticket) service, no client name field is displayed. This happens because the service uses a custom service type code (e.g., `billet_bateau`) that doesn't match any of the hardcoded cases in the `renderServiceSpecificFields()` function, which only handles: `visa`, `residence`, `ticket`, and `dossier`.

## Root Cause

In `src/pages/CommandsPage.tsx`, the `renderServiceSpecificFields()` function (lines 427-542) uses a `switch` statement to determine which fields to render based on the service type. Any service type that doesn't match the four hardcoded cases falls through to `default: return null`, rendering no fields at all.

```typescript
// Current logic
const renderServiceSpecificFields = () => {
  const serviceType = getServiceType(selectedService);
  
  switch (serviceType) {
    case 'visa': ...
    case 'residence': ...
    case 'ticket': ...
    case 'dossier': ...
    default: return null; // Billet Bateau falls here!
  }
};
```

## Solution

Modify the `default` case to render a generic "Client Full Name" field for any unhandled service types. This ensures that all services, including custom ones like "Billet Bateau", will at minimum display a client name field.

### Changes Required

**File: `src/pages/CommandsPage.tsx`**

Update the `default` case in `renderServiceSpecificFields()` (around line 540):

```typescript
default:
  // Generic fallback for any other service types
  return (
    <div className="space-y-2">
      <Label>{t('form.clientFullName')}</Label>
      <Input
        value={formData.clientFullName}
        onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
        placeholder={t('form.clientFullName')}
      />
    </div>
  );
```

Also update the data payload construction for these generic types (around line 213):

```typescript
default:
  // Generic fallback - just include clientFullName
  data = {
    ...baseData,
    type: serviceType,
  };
  break;
```

And update the `handleEditCommand` function to handle generic types (around line 297):

```typescript
// After existing type checks, add fallback to load clientFullName
if (!['visa', 'residence', 'ticket', 'dossier'].includes(command.data.type)) {
  formUpdates.clientFullName = command.data.clientFullName || '';
}
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Modified | 1 (`src/pages/CommandsPage.tsx`) |
| Lines Changed | ~15 lines |
| Risk Level | Low |
| Breaking Changes | None - existing types continue to work |

## Behavior After Fix

| Service Type Code | Fields Displayed |
|-------------------|------------------|
| `visa` | First Name, Last Name, Passport Upload |
| `residence` | Client Full Name, Hotel Name |
| `ticket` | Client Full Name, Company |
| `dossier` | Client Full Name, Description |
| `billet_bateau` (NEW) | Client Full Name |
| Any other custom type | Client Full Name |

