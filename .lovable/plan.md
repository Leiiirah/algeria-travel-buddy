
# Plan: Add Translations to Documents Page

## Overview

The Documents page has hardcoded French text, but the translation files already exist with complete coverage for both French (`fr/documents.json`) and Arabic (`ar/documents.json`). We just need to update `DocumentsPage.tsx` to use `react-i18next`.

---

## Current State

- ✅ Translation files exist with full coverage
- ❌ `DocumentsPage.tsx` uses ~25+ hardcoded French strings

---

## File to Modify

**`src/pages/DocumentsPage.tsx`**

---

## Changes Required

### 1. Add Imports

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Initialize Translation Hook

```typescript
const { t, i18n } = useTranslation('documents');
const { t: tCommon } = useTranslation('common');
```

### 3. Replace All Hardcoded Strings

| Location | Current (French) | Translation Key |
|----------|------------------|-----------------|
| DashboardLayout title | `"Bibliothèque de documents"` | `t('title')` |
| DashboardLayout subtitle | `"Gestion électronique des documents (GED)"` | `t('subtitle')` |
| Categories array | `"Tous"`, `"Assurance"`, etc. | `t('categories.all')`, `t('categories.assurance')`, etc. |
| CardTitle | `"Documents"` | `t('list.title')` |
| CardDescription | `"X document(s) trouvé(s)"` | `t('list.count', { count })` |
| Upload button | `"Téléverser"` | `t('actions.upload')` |
| DialogTitle | `"Téléverser un document"` | `t('dialog.uploadTitle')` |
| DialogDescription | `"Ajoutez un nouveau document..."` | `t('dialog.uploadDesc')` |
| Form label | `"Nom du document"` | `t('form.name')` |
| Form placeholder | `"Ex: Attestation Assurance 2025"` | `t('form.namePlaceholder')` |
| Form label | `"Catégorie"` | `t('form.category')` |
| Select placeholder | `"Sélectionner une catégorie"` | `t('form.selectCategory')` |
| Form label | `"Fichier PDF"` | `t('form.file')` |
| Dropzone text | `"Glissez-déposez..."` | `t('form.dropzone')` |
| Cancel button | `"Annuler"` | `tCommon('actions.cancel')` |
| Upload button (pending) | `"Téléversement..."` | `t('actions.uploading')` |
| Download button | `"Télécharger"` | `t('actions.download')` |
| Empty state title | `"Aucun document trouvé"` | `t('empty.title')` |
| Empty state description | `"Téléversez un document..."` | `t('empty.description')` |
| Updated at text | `"Mis à jour le..."` | `t('table.updatedAt', { date })` |
| Filter labels | `"Catégorie"`, `"Date début"`, `"Date fin"` | `t('filters.category')`, `t('filters.fromDate')`, `t('filters.toDate')` |

### 4. Update Categories Array to Use Translations

```typescript
const categories = [
  { value: 'all', label: t('categories.all'), icon: FolderOpen },
  { value: 'assurance', label: t('categories.assurance'), icon: Shield },
  { value: 'cnas', label: t('categories.cnas'), icon: Building },
  { value: 'casnos', label: t('categories.casnos'), icon: Building },
  { value: 'autre', label: t('categories.autre'), icon: HelpCircle },
];
```

### 5. Update Select Items in Dialog

```tsx
<SelectItem value="assurance">{t('categories.assurance')}</SelectItem>
<SelectItem value="cnas">{t('categories.cnas')}</SelectItem>
<SelectItem value="casnos">{t('categories.casnos')}</SelectItem>
<SelectItem value="autre">{t('categories.autre')}</SelectItem>
```

### 6. Update Filter Configuration

```typescript
filterConfig={[
  {
    key: 'category',
    label: t('filters.category'),
    type: 'select',
    options: categories.slice(1).map(c => ({ label: c.label, value: c.value })),
  },
  {
    key: 'fromDate',
    label: t('filters.fromDate'),
    type: 'date-range',
  },
  {
    key: 'toDate',
    label: t('filters.toDate'),
    type: 'date-range',
  },
]}
```

### 7. Update Date Formatting to Be Locale-Aware

```typescript
new Date(doc.updatedAt).toLocaleDateString(
  i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
  { day: '2-digit', month: 'short', year: 'numeric' }
)
```

### 8. Apply RTL-Aware Icon Margins

```tsx
// Before
<Upload className="mr-2 h-4 w-4" />
<Download className="mr-2 h-4 w-4" />

// After
<Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
<Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
```

---

## Summary

| File | Action |
|------|--------|
| `src/pages/DocumentsPage.tsx` | Modify - Replace ~25 hardcoded strings with translation keys |

The translation files already have all the necessary keys in both French and Arabic, so no changes are needed to the JSON files.
