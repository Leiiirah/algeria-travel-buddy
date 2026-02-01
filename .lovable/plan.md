
# Plan: Multi-language Support (Arabic & French)

## Overview

This plan implements internationalization (i18n) using **react-i18next**, the industry-standard solution for React applications. The system will support:

- **French (fr)** - Current language (default)
- **Arabic (ar)** - With full RTL (right-to-left) support

Users will be able to switch languages via a dropdown in the header, and their preference will be saved in localStorage.

---

## Architecture

```text
src/
├── i18n/
│   ├── index.ts                 # i18n configuration
│   ├── locales/
│   │   ├── fr/
│   │   │   ├── common.json      # Common UI elements
│   │   │   ├── auth.json        # Login/auth strings
│   │   │   ├── dashboard.json   # Dashboard page
│   │   │   ├── commands.json    # Commands page
│   │   │   ├── suppliers.json   # Suppliers pages
│   │   │   ├── employees.json   # Employees pages
│   │   │   ├── omra.json        # Omra page
│   │   │   ├── documents.json   # Documents page
│   │   │   ├── expenses.json    # Expenses page
│   │   │   └── validation.json  # Form validation messages
│   │   └── ar/
│   │       └── ... (same structure)
│   └── LanguageContext.tsx      # Language state management
```

---

## Implementation Details

### 1. Dependencies

Install the required packages:
- `i18next` - Core i18n library
- `react-i18next` - React bindings
- `i18next-browser-languagedetector` - Auto-detect user language

### 2. i18n Configuration

Create `src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
// ... more imports

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
        auth: frAuth,
        // ...
      },
      ar: {
        common: arCommon,
        auth: arAuth,
        // ...
      },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### 3. RTL Support

Create `src/hooks/useDirection.ts` to manage text direction:

```typescript
export const useDirection = () => {
  const { i18n } = useTranslation();
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
  
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);
  
  return direction;
};
```

### 4. Language Switcher Component

Create `src/components/layout/LanguageSwitcher.tsx`:

```typescript
// Dropdown with French/Arabic options
// Shows current language with flag/icon
// Updates i18n.language and direction on change
```

### 5. Translation Files Structure

**French (`src/i18n/locales/fr/common.json`):**
```json
{
  "navigation": {
    "dashboard": "Tableau de bord",
    "commands": "Commandes",
    "omra": "Omra",
    "documents": "Documents",
    "employees": "Employés",
    "suppliers": "Fournisseurs",
    "supplierAccounting": "Situation Fournisseurs",
    "employeeAccounting": "Comptabilité Employés",
    "accounting": "Comptabilité",
    "services": "Services",
    "expenses": "Dépenses"
  },
  "actions": {
    "add": "Ajouter",
    "edit": "Modifier",
    "delete": "Supprimer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "search": "Rechercher",
    "filter": "Filtrer",
    "export": "Exporter",
    "refresh": "Actualiser"
  },
  "status": {
    "pending": "En attente",
    "inProgress": "En cours",
    "completed": "Terminé",
    "cancelled": "Annulé",
    "paid": "Payé",
    "partial": "Partiel",
    "unpaid": "Non payé"
  }
}
```

**Arabic (`src/i18n/locales/ar/common.json`):**
```json
{
  "navigation": {
    "dashboard": "لوحة التحكم",
    "commands": "الطلبات",
    "omra": "العمرة",
    "documents": "المستندات",
    "employees": "الموظفون",
    "suppliers": "الموردون",
    "supplierAccounting": "حالة الموردين",
    "employeeAccounting": "محاسبة الموظفين",
    "accounting": "المحاسبة",
    "services": "الخدمات",
    "expenses": "المصروفات"
  },
  "actions": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير",
    "refresh": "تحديث"
  },
  "status": {
    "pending": "قيد الانتظار",
    "inProgress": "قيد التنفيذ",
    "completed": "مكتمل",
    "cancelled": "ملغى",
    "paid": "مدفوع",
    "partial": "جزئي",
    "unpaid": "غير مدفوع"
  }
}
```

### 6. Component Updates

**Usage Example (Before):**
```tsx
<CardTitle>Tableau de bord</CardTitle>
<Button>Ajouter</Button>
```

**Usage Example (After):**
```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<CardTitle>{t('navigation.dashboard')}</CardTitle>
<Button>{t('actions.add')}</Button>
```

### 7. Utility Functions Update

Update `src/lib/utils.ts` to use translations:

```typescript
// Before
export const getCommandStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    // ...
  };
  return labels[status] || status;
};

// After - Move labels to translation files
// The component will use t('status.pending') directly
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/i18n/index.ts` | i18n configuration |
| `src/i18n/locales/fr/common.json` | French common translations |
| `src/i18n/locales/fr/auth.json` | French auth translations |
| `src/i18n/locales/fr/dashboard.json` | French dashboard translations |
| `src/i18n/locales/fr/commands.json` | French commands translations |
| `src/i18n/locales/fr/suppliers.json` | French suppliers translations |
| `src/i18n/locales/fr/employees.json` | French employees translations |
| `src/i18n/locales/fr/omra.json` | French Omra translations |
| `src/i18n/locales/fr/documents.json` | French documents translations |
| `src/i18n/locales/fr/expenses.json` | French expenses translations |
| `src/i18n/locales/fr/validation.json` | French validation messages |
| `src/i18n/locales/ar/common.json` | Arabic common translations |
| `src/i18n/locales/ar/auth.json` | Arabic auth translations |
| `src/i18n/locales/ar/dashboard.json` | Arabic dashboard translations |
| `src/i18n/locales/ar/commands.json` | Arabic commands translations |
| `src/i18n/locales/ar/suppliers.json` | Arabic suppliers translations |
| `src/i18n/locales/ar/employees.json` | Arabic employees translations |
| `src/i18n/locales/ar/omra.json` | Arabic Omra translations |
| `src/i18n/locales/ar/documents.json` | Arabic documents translations |
| `src/i18n/locales/ar/expenses.json` | Arabic expenses translations |
| `src/i18n/locales/ar/validation.json` | Arabic validation messages |
| `src/hooks/useDirection.ts` | RTL direction hook |
| `src/components/layout/LanguageSwitcher.tsx` | Language dropdown component |

---

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add i18next dependencies |
| `src/main.tsx` | Import i18n configuration |
| `src/App.tsx` | Add direction management |
| `src/index.css` | Enhance RTL styles |
| `src/components/layout/AppHeader.tsx` | Add LanguageSwitcher |
| `src/components/layout/AppSidebar.tsx` | Use translations |
| `src/pages/LoginPage.tsx` | Use translations |
| `src/pages/DashboardPage.tsx` | Use translations |
| `src/pages/CommandsPage.tsx` | Use translations |
| `src/pages/SuppliersPage.tsx` | Use translations |
| `src/pages/SupplierAccountingPage.tsx` | Use translations |
| `src/pages/EmployeesPage.tsx` | Use translations |
| `src/pages/EmployeeAccountingPage.tsx` | Use translations |
| `src/pages/OmraPage.tsx` | Use translations |
| `src/pages/DocumentsPage.tsx` | Use translations |
| `src/pages/ExpensesPage.tsx` | Use translations |
| `src/pages/ServicesPage.tsx` | Use translations |
| `src/pages/AccountingPage.tsx` | Use translations |
| `src/pages/NotFound.tsx` | Use translations |
| `src/lib/utils.ts` | Update label functions to use i18n |
| `src/contexts/AuthContext.tsx` | Use translations for error messages |
| `src/components/ui/empty-state.tsx` | Use translations |
| `src/components/ui/error-state.tsx` | Use translations |
| `src/components/search/GlobalSearch.tsx` | Use translations |
| `src/components/search/AdvancedFilter.tsx` | Use translations |

---

## RTL Styling Enhancements

Add to `src/index.css`:

```css
/* RTL-specific adjustments */
[dir="rtl"] .sidebar {
  border-left: 1px solid var(--sidebar-border);
  border-right: none;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .space-x-4 > * + * {
  margin-right: 1rem;
  margin-left: 0;
}

/* RTL icon flipping */
[dir="rtl"] .icon-directional {
  transform: scaleX(-1);
}
```

---

## Language Switcher UI

The language switcher will be added to the header, showing:

```text
+----------------------------------------------------------+
| [Sidebar] Tableau de bord              [FR/ع] [Bell] ... |
+----------------------------------------------------------+
```

Dropdown options:
- French flag + "Français"
- Arabic flag + "العربية"

---

## Key Features

1. **Automatic Language Detection** - Detects browser language preference
2. **Persistent Selection** - Saves language choice in localStorage
3. **RTL Support** - Full right-to-left layout for Arabic
4. **Namespace Organization** - Translations split by feature/page
5. **Fallback** - Falls back to French if translation missing
6. **Type Safety** - TypeScript support for translation keys

---

## Implementation Order

1. Install dependencies and create i18n configuration
2. Create all French translation files (extracting existing strings)
3. Create Arabic translation files
4. Add LanguageSwitcher component
5. Add useDirection hook for RTL management
6. Update main.tsx and App.tsx
7. Update layout components (Header, Sidebar)
8. Update pages one by one
9. Update utility functions
10. Enhance RTL CSS styles
11. Test both languages thoroughly

---

## Translation Scope

The following text will be translated:

- Navigation menu items
- Page titles and subtitles
- Button labels (Add, Edit, Delete, Save, Cancel)
- Table headers
- Form labels and placeholders
- Status labels (En attente, En cours, Terminé, etc.)
- Payment status (Payé, Partiel, Non payé)
- Error messages and validation messages
- Empty states and loading messages
- Notification messages (toast)
- Date/number formatting (locale-aware)

---

## Notes

- The Tajawal font already supports Arabic characters
- Currency formatting (DZD) remains the same for both languages
- Dates will be formatted according to locale preferences
- Numbers use locale-appropriate separators
