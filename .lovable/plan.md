
# Plan: Add New Service Types

## Overview

Add three new service types to the "Type de service" dropdown: **Billet Bateau**, **Billet Tilex**, and **Billets**. This requires updating both frontend and backend code.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add new types to `ServiceType` union |
| `server/src/services/entities/service.entity.ts` | Add new enum values to `ServiceType` |
| `src/pages/ServicesPage.tsx` | Add new SelectItems and icons for new types |
| `src/i18n/locales/fr/services.json` | Add French translations for new types |
| `src/i18n/locales/ar/services.json` | Add Arabic translations for new types |

---

## Detailed Changes

### 1. Update Frontend Types (`src/types/index.ts`)

**Line 15** - Add new types to the union:

```typescript
// Before
export type ServiceType = 'visa' | 'residence' | 'ticket' | 'dossier';

// After
export type ServiceType = 'visa' | 'residence' | 'ticket' | 'dossier' | 'billet_bateau' | 'billet_tilex' | 'billets';
```

### 2. Update Backend Entity (`server/src/services/entities/service.entity.ts`)

**Lines 11-16** - Add new enum values:

```typescript
export enum ServiceType {
  VISA = 'visa',
  RESIDENCE = 'residence',
  TICKET = 'ticket',
  DOSSIER = 'dossier',
  BILLET_BATEAU = 'billet_bateau',
  BILLET_TILEX = 'billet_tilex',
  BILLETS = 'billets',
}
```

### 3. Update ServicesPage.tsx

**Lines 71-84** - Add icons for new types in `getServiceIcon`:

```typescript
const getServiceIcon = (type: ServiceType) => {
  switch (type) {
    case 'visa':
      return FileText;
    case 'residence':
      return Hotel;
    case 'ticket':
      return Plane;
    case 'dossier':
      return Folder;
    case 'billet_bateau':
      return Ship;       // New icon for boat
    case 'billet_tilex':
      return Bus;        // New icon for bus/tilex
    case 'billets':
      return Ticket;     // New icon for general tickets
    default:
      return FileText;
  }
};
```

**Line 27** - Import new icons:

```typescript
import { Plus, Settings, FileText, Plane, Hotel, Folder, Ship, Bus, Ticket } from 'lucide-react';
```

**Lines 229-232** - Add new SelectItems in the dropdown:

```tsx
<SelectContent className="bg-popover">
  <SelectItem value="visa">{t('types.visa')}</SelectItem>
  <SelectItem value="residence">{t('types.residence')}</SelectItem>
  <SelectItem value="ticket">{t('types.ticket')}</SelectItem>
  <SelectItem value="dossier">{t('types.dossier')}</SelectItem>
  <SelectItem value="billet_bateau">{t('types.billet_bateau')}</SelectItem>
  <SelectItem value="billet_tilex">{t('types.billet_tilex')}</SelectItem>
  <SelectItem value="billets">{t('types.billets')}</SelectItem>
</SelectContent>
```

### 4. Update French Translations (`src/i18n/locales/fr/services.json`)

Add new type labels:

```json
"types": {
  "visa": "Visa",
  "residence": "Résidence / Hôtel",
  "ticket": "Billetterie Avion",
  "dossier": "Traitement de dossier",
  "billet_bateau": "Billet Bateau",
  "billet_tilex": "Billet Tilex",
  "billets": "Billets"
}
```

### 5. Update Arabic Translations (`src/i18n/locales/ar/services.json`)

Add new type labels:

```json
"types": {
  "visa": "تأشيرة",
  "residence": "إقامة / فندق",
  "ticket": "تذاكر طيران",
  "dossier": "معالجة ملف",
  "billet_bateau": "تذكرة باخرة",
  "billet_tilex": "تذكرة تيلكس",
  "billets": "تذاكر"
}
```

---

## Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add 3 new types to ServiceType union |
| `server/src/services/entities/service.entity.ts` | Add 3 new enum values |
| `src/pages/ServicesPage.tsx` | Add new icons + SelectItems |
| `src/i18n/locales/fr/services.json` | Add French translations |
| `src/i18n/locales/ar/services.json` | Add Arabic translations |

This will add **Billet Bateau**, **Billet Tilex**, and **Billets** as selectable service types with proper icons and bilingual translations.
