

# Plan: Replace Departure/Return Dates with Company Field for Ticket Commands

## Overview

Modify the "billet d'avion" and "billet bateau" ticket forms to:
1. **Remove** the departure date and return date fields
2. **Add** a new "company" field where users can enter the transport company name (e.g., "Air Algérie", "Algérie Ferries")

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Update `TicketCommand` interface: remove `departureDate`/`returnDate`, add `company` |
| `src/pages/CommandsPage.tsx` | Update form state, form rendering, and data handling |
| `src/utils/invoiceGenerator.ts` | Update invoice to show company instead of dates in itinerary |
| `src/i18n/locales/fr/commands.json` | Add `company` translation, keep existing for backward compatibility |
| `src/i18n/locales/ar/commands.json` | Add `company` Arabic translation |

---

## Implementation Details

### 1. Update TypeScript Types

**File**: `src/types/index.ts`

```typescript
// Before
export interface TicketCommand extends BaseCommandData {
  type: 'ticket';
  departureDate: string;
  returnDate?: string;
}

// After
export interface TicketCommand extends BaseCommandData {
  type: 'ticket';
  company: string; // Transport company name (e.g., "Air Algérie", "Algérie Ferries")
}
```

### 2. Update CommandsPage Form

**File**: `src/pages/CommandsPage.tsx`

Update form state initialization:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  company: '',        // NEW
  // departureDate: '',  // REMOVE
  // returnDate: '',     // REMOVE
});
```

Update form reset:
```typescript
const resetForm = () => {
  setFormData({
    // ... existing fields
    company: '',
    // No more departureDate/returnDate
  });
};
```

Update data building for 'ticket' type:
```typescript
case 'ticket':
  data = {
    ...baseData,
    type: 'ticket',
    company: formData.company,
  };
  break;
```

Update edit command handler:
```typescript
} else if (command.data.type === 'ticket') {
  formUpdates.company = command.data.company || '';
}
```

Update form rendering for 'ticket' case:
```tsx
case 'ticket':
  return (
    <>
      <div className="space-y-2">
        <Label>{t('form.clientFullName')}</Label>
        <Input
          value={formData.clientFullName}
          onChange={(e) => setFormData({ ...formData, clientFullName: e.target.value })}
          placeholder={t('form.clientFullName')}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('form.company')}</Label>
        <Input
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder={t('form.companyPlaceholder')}
        />
      </div>
    </>
  );
```

### 3. Update Invoice Generator

**File**: `src/utils/invoiceGenerator.ts`

Update interface:
```typescript
interface InvoiceData {
  // ... existing fields
  company?: string;        // NEW
  // departureDate?: string;  // REMOVE
  // returnDate?: string;     // REMOVE
}
```

Update itinerary table to show company instead of dates:
```typescript
// Before: showed departure/return dates
// After: can show company name in the order details or itinerary section
```

### 4. Update French Translations

**File**: `src/i18n/locales/fr/commands.json`

```json
{
  "form": {
    // ... existing
    "company": "Compagnie",
    "companyPlaceholder": "Ex: Air Algérie, Algérie Ferries"
  }
}
```

### 5. Update Arabic Translations

**File**: `src/i18n/locales/ar/commands.json`

```json
{
  "form": {
    // ... existing
    "company": "الشركة",
    "companyPlaceholder": "مثال: الخطوط الجوية الجزائرية، الجزائر للعبارات"
  }
}
```

---

## Visual Comparison

### Before (Current Form)
```
┌──────────────────────────────────────────────┐
│ Ticket Form                                  │
├──────────────────────────────────────────────┤
│ Nom complet du client: [_______________]     │
│                                              │
│ ┌─────────────────┐ ┌─────────────────┐     │
│ │ Date de départ  │ │ Date de retour  │     │
│ │ [  📅  ]       │ │ [  📅  ]       │     │
│ └─────────────────┘ └─────────────────┘     │
└──────────────────────────────────────────────┘
```

### After (New Form)
```
┌──────────────────────────────────────────────┐
│ Ticket Form                                  │
├──────────────────────────────────────────────┤
│ Nom complet du client: [_______________]     │
│                                              │
│ Compagnie: [Ex: Air Algérie, Algérie Ferries]│
└──────────────────────────────────────────────┘
```

---

## Backward Compatibility Note

Existing commands with `departureDate`/`returnDate` data will still be stored in the JSONB `data` column. The changes only affect:
- New command creation
- Command editing (will show empty company field for old commands)
- Invoice generation (will gracefully handle missing company field)

No database migration is needed since the `data` column is JSONB and flexible.

---

## Summary

| Category | Count |
|----------|-------|
| TypeScript types | 1 |
| Frontend pages | 1 |
| Utility files | 1 |
| Translation files | 2 |
| **Total** | 5 files |

