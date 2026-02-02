
# Plan: Add Translations to Commands/Orders Page

## Overview

The Commands page (orders tab) has extensive hardcoded French text. Translation files already exist for both French (`commands.json`) and Arabic (`commands.json`). We need to update `CommandsPage.tsx` to use `react-i18next`.

---

## Current State

- ✅ Translation files exist: `fr/commands.json` and `ar/commands.json`
- ❌ `CommandsPage.tsx` uses ~50+ hardcoded French strings

---

## Changes Required

### File to Modify

**`src/pages/CommandsPage.tsx`**

### Modifications

1. **Add import for `useTranslation`**
   ```typescript
   import { useTranslation } from 'react-i18next';
   ```

2. **Initialize translation hook**
   ```typescript
   const { t } = useTranslation('commands');
   ```

3. **Replace all hardcoded strings:**

   | Location | Current (French) | Translation Key |
   |----------|------------------|-----------------|
   | DashboardLayout title | `"Commandes"` | `t('title')` |
   | DashboardLayout subtitle | `"Gestion des commandes clients"` | `t('subtitle')` |
   | Stats card 1 | `"Total Versements"` | `t('stats.totalPayments')` |
   | Stats card 2 | `"Total Crédit (Reste)"` | `t('stats.totalCredit')` |
   | Stats card 3 | `"Total Bénéfice Net"` | `t('stats.totalProfit')` |
   | Card title | `"Liste des commandes"` | `t('list.title')` |
   | Card description | `"X commandes au total"` | `t('list.count', { count: ... })` |
   | Button | `"Nouvelle commande"` | `t('dialog.createTitle')` |
   | Dialog title (create) | `"Créer une commande"` | `t('dialog.createTitle')` |
   | Dialog title (edit) | `"Modifier la commande"` | `t('dialog.editTitle')` |
   | Dialog description | `"Sélectionnez un service..."` | `t('dialog.selectServiceDesc')` |
   | Form labels | Various | `t('form.*')` |
   | Filter labels | `"Statut"`, `"Service"`, `"Fournisseur"` | `t('filters.*')` |
   | Status options | `"En attente"`, `"En cours"`, etc. | `t('status.*')` |
   | Table headers | All columns | `t('table.*')` |
   | Empty state | `"Aucune commande"` | `t('empty')` |
   | Time remaining | `"Verrouillé"`, `"Xh restantes"` | `t('time.*')` |
   | Actions | `"Voir détails"`, `"Modifier"`, `"Supprimer"` | Using `common` namespace |
   | Buttons | `"Annuler"`, `"Créer"`, `"Modifier"` | Using `common` namespace |

4. **Update `getTimeRemaining` function to use translations:**
   ```typescript
   const getTimeRemaining = (createdAt: Date | string): string => {
     const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
     const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
     if (hoursSinceCreation >= 24) return t('time.locked');
     const remaining = 24 - hoursSinceCreation;
     if (remaining < 1) return t('time.minutesRemaining', { minutes: Math.round(remaining * 60) });
     return t('time.hoursRemaining', { hours: Math.round(remaining) });
   };
   ```

5. **Update filter configuration to use translations:**
   ```typescript
   filterConfig={[
     {
       key: 'status',
       label: t('filters.status'),
       type: 'select',
       options: [
         { label: t('status.en_attente'), value: 'en_attente' },
         { label: t('status.en_cours'), value: 'en_cours' },
         { label: t('status.termine'), value: 'termine' },
         { label: t('status.annule'), value: 'annule' },
       ],
     },
     // ... more filters
   ]}
   ```

6. **Update form field labels in `renderServiceSpecificFields`:**
   - Replace all `<Label>Prénom</Label>` → `<Label>{t('form.firstName')}</Label>`
   - Replace all placeholders with translations

7. **Update table headers:**
   ```tsx
   <TableHead>{t('table.service')}</TableHead>
   <TableHead>{t('table.client')}</TableHead>
   <TableHead>{t('table.destination')}</TableHead>
   // ... etc
   ```

8. **Update action menu items using common namespace:**
   ```tsx
   const { t: tCommon } = useTranslation('common');
   
   <DropdownMenuItem>
     <Eye className="mr-2 h-4 w-4" />
     {tCommon('actions.view')}
   </DropdownMenuItem>
   ```

---

## Translation Keys Used

### From `commands` namespace:
- `title`, `subtitle`
- `stats.totalPayments`, `stats.totalCredit`, `stats.totalProfit`
- `list.title`, `list.count`
- `dialog.createTitle`, `dialog.editTitle`, `dialog.selectService`, `dialog.selectServiceDesc`
- `form.service`, `form.firstName`, `form.lastName`, `form.clientFullName`, `form.phone`, `form.destination`, `form.hotelName`, `form.departureDate`, `form.returnDate`, `form.description`, `form.sellingPrice`, `form.amountPaid`, `form.buyingPrice`, `form.supplier`, `form.selectSupplier`
- `calculations.remaining`, `calculations.profit`
- `status.en_attente`, `status.en_cours`, `status.termine`, `status.annule`
- `time.locked`, `time.hoursRemaining`, `time.minutesRemaining`
- `filters.status`, `filters.service`, `filters.supplier`
- `table.service`, `table.client`, `table.destination`, `table.sellingPrice`, `table.buyingPrice`, `table.remaining`, `table.profit`, `table.supplier`, `table.status`, `table.actions`
- `empty`

### From `common` namespace:
- `actions.view`, `actions.edit`, `actions.delete`, `actions.cancel`, `actions.save`

---

## Additional Translations Needed

I'll need to add a few missing keys to the translation files:

**Add to `fr/commands.json`:**
```json
{
  "form": {
    "accountingInfo": "Informations comptables",
    "payment": "Versement (DZD)",
    "noServiceAvailable": "Aucun service disponible",
    "addService": "Ajouter un service",
    "noSupplierAvailable": "Aucun fournisseur disponible",
    "addSupplier": "Ajouter un fournisseur",
    "netProfit": "Bénéfice net"
  },
  "actions": {
    "saving": "Enregistrement...",
    "create": "Créer",
    "edit": "Modifier"
  },
  "empty": {
    "title": "Aucune commande",
    "description": "Commencez par créer votre première commande"
  }
}
```

**Add to `ar/commands.json`:**
```json
{
  "form": {
    "accountingInfo": "معلومات المحاسبة",
    "payment": "الدفعة (د.ج)",
    "noServiceAvailable": "لا توجد خدمات متاحة",
    "addService": "إضافة خدمة",
    "noSupplierAvailable": "لا يوجد موردون متاحون",
    "addSupplier": "إضافة مورد",
    "netProfit": "صافي الربح"
  },
  "actions": {
    "saving": "جاري الحفظ...",
    "create": "إنشاء",
    "edit": "تعديل"
  },
  "empty": {
    "title": "لا توجد طلبات",
    "description": "ابدأ بإنشاء أول طلب لك"
  }
}
```

---

## Summary

| File | Action |
|------|--------|
| `src/pages/CommandsPage.tsx` | Modify - Replace ~50+ hardcoded strings with translation keys |
| `src/i18n/locales/fr/commands.json` | Modify - Add missing keys |
| `src/i18n/locales/ar/commands.json` | Modify - Add missing keys |

This will make the entire Commands/Orders page fully bilingual with proper RTL support for Arabic.
