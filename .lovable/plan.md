
# Plan: Add Translations to All Remaining Tabs

## Overview

The following pages still have hardcoded French text and need to be localized:

| Page | Hardcoded Strings | Translation File |
|------|-------------------|------------------|
| EmployeesPage.tsx | ~30 | employees.json (exists) |
| SuppliersPage.tsx | ~25 | suppliers.json (exists) |
| ExpensesPage.tsx | ~40 | expenses.json (exists) |
| ServicesPage.tsx | ~25 | NEW: services.json |
| EmployeeAccountingPage.tsx | ~45 | employees.json (exists) |
| SupplierAccountingPage.tsx | ~50 | suppliers.json (exists) |
| AccountingPage.tsx | ~45 | NEW: accounting.json |

---

## Files to Create

### 1. French Services Translation (`src/i18n/locales/fr/services.json`)

```json
{
  "title": "Configuration des services",
  "subtitle": "Gérez les types de services proposés par l'agence",
  "activeCount": "{{active}} services actifs sur {{total}}",
  "dialog": {
    "createTitle": "Créer un service",
    "editTitle": "Modifier le service",
    "createDesc": "Ajoutez un nouveau type de service à votre catalogue",
    "editDesc": "Modifiez les informations du service"
  },
  "form": {
    "name": "Nom du service",
    "namePlaceholder": "Ex: Visa Schengen France",
    "type": "Type de service",
    "selectType": "Sélectionner un type",
    "description": "Description",
    "descriptionPlaceholder": "Décrivez ce service...",
    "defaultSupplier": "Fournisseur par défaut",
    "selectSupplier": "Choisir...",
    "defaultCost": "Coût d'achat par défaut",
    "costPlaceholder": "Ex: 12000"
  },
  "types": {
    "visa": "Visa",
    "residence": "Résidence / Hôtel",
    "ticket": "Billetterie",
    "dossier": "Traitement de dossier"
  },
  "actions": {
    "newService": "Nouveau service",
    "create": "Créer le service",
    "edit": "Modifier",
    "saving": "Enregistrement..."
  },
  "card": {
    "createdAt": "Créé le {{date}}"
  },
  "empty": {
    "title": "Aucun service",
    "description": "Créez votre premier service"
  }
}
```

### 2. Arabic Services Translation (`src/i18n/locales/ar/services.json`)

```json
{
  "title": "إعدادات الخدمات",
  "subtitle": "إدارة أنواع الخدمات المقدمة من الوكالة",
  "activeCount": "{{active}} خدمة نشطة من أصل {{total}}",
  "dialog": {
    "createTitle": "إنشاء خدمة",
    "editTitle": "تعديل الخدمة",
    "createDesc": "أضف نوع خدمة جديد إلى الكتالوج",
    "editDesc": "عدّل معلومات الخدمة"
  },
  "form": {
    "name": "اسم الخدمة",
    "namePlaceholder": "مثال: تأشيرة شنغن فرنسا",
    "type": "نوع الخدمة",
    "selectType": "اختر نوعاً",
    "description": "الوصف",
    "descriptionPlaceholder": "صف هذه الخدمة...",
    "defaultSupplier": "المورد الافتراضي",
    "selectSupplier": "اختر...",
    "defaultCost": "تكلفة الشراء الافتراضية",
    "costPlaceholder": "مثال: 12000"
  },
  "types": {
    "visa": "تأشيرة",
    "residence": "إقامة / فندق",
    "ticket": "حجز تذاكر",
    "dossier": "معالجة ملف"
  },
  "actions": {
    "newService": "خدمة جديدة",
    "create": "إنشاء الخدمة",
    "edit": "تعديل",
    "saving": "جاري الحفظ..."
  },
  "card": {
    "createdAt": "أُنشئ في {{date}}"
  },
  "empty": {
    "title": "لا توجد خدمات",
    "description": "أنشئ أول خدمة لك"
  }
}
```

### 3. French Accounting Translation (`src/i18n/locales/fr/accounting.json`)

```json
{
  "title": "Comptabilité",
  "subtitle": "Suivi financier et traçabilité des paiements",
  "stats": {
    "totalCollected": "Total encaissé",
    "todayPayments": "Encaissements du jour",
    "todayPaymentsDesc": "{{count}} paiement(s)",
    "unpaid": "Impayés",
    "unpaidDesc": "{{count}} commande(s)",
    "totalProfit": "Bénéfice total",
    "totalProfitDesc": "Sur toutes les commandes"
  },
  "tabs": {
    "payments": "Paiements",
    "unpaid": "Impayés",
    "reports": "Rapports"
  },
  "payments": {
    "title": "Historique des paiements",
    "subtitle": "Tous les paiements enregistrés",
    "table": {
      "date": "Date",
      "command": "Commande",
      "amount": "Montant",
      "method": "Mode",
      "recordedBy": "Enregistré par",
      "notes": "Notes"
    },
    "empty": {
      "title": "Aucun paiement",
      "description": "Les paiements apparaîtront ici"
    }
  },
  "unpaidCommands": {
    "title": "Commandes impayées",
    "subtitle": "Commandes en attente de paiement ou partiellement payées",
    "table": {
      "client": "Client",
      "service": "Service",
      "totalAmount": "Montant total",
      "paid": "Payé",
      "remaining": "Reste à payer",
      "status": "Statut",
      "action": "Action"
    },
    "empty": {
      "title": "Aucune commande impayée",
      "description": "Toutes les commandes sont réglées"
    },
    "addPayment": "Ajouter paiement"
  },
  "reports": {
    "title": "Rapports financiers",
    "chartTitle": "Revenus vs Dépenses",
    "chartSubtitle": "Évolution sur les 6 derniers mois",
    "months": {
      "jan": "Jan",
      "feb": "Fév",
      "mar": "Mar",
      "apr": "Avr",
      "may": "Mai",
      "jun": "Juin"
    },
    "revenues": "Revenus",
    "expenses": "Dépenses"
  },
  "dialog": {
    "title": "Nouveau paiement",
    "subtitle": "Enregistrez un paiement pour une commande",
    "form": {
      "command": "Commande",
      "selectCommand": "Sélectionner une commande",
      "noUnpaidCommands": "Aucune commande impayée",
      "addCommand": "Ajouter une commande",
      "amount": "Montant (DZD)",
      "method": "Mode de paiement",
      "notes": "Notes (optionnel)",
      "notesPlaceholder": "Notes sur ce paiement...",
      "remaining": "Reste"
    }
  },
  "actions": {
    "newPayment": "Enregistrer un paiement",
    "saving": "Enregistrement..."
  }
}
```

### 4. Arabic Accounting Translation (`src/i18n/locales/ar/accounting.json`)

```json
{
  "title": "المحاسبة",
  "subtitle": "المتابعة المالية وتتبع المدفوعات",
  "stats": {
    "totalCollected": "إجمالي المحصّل",
    "todayPayments": "تحصيلات اليوم",
    "todayPaymentsDesc": "{{count}} دفعة",
    "unpaid": "غير مدفوعة",
    "unpaidDesc": "{{count}} طلب",
    "totalProfit": "إجمالي الربح",
    "totalProfitDesc": "على جميع الطلبات"
  },
  "tabs": {
    "payments": "المدفوعات",
    "unpaid": "غير مدفوعة",
    "reports": "التقارير"
  },
  "payments": {
    "title": "سجل المدفوعات",
    "subtitle": "جميع المدفوعات المسجلة",
    "table": {
      "date": "التاريخ",
      "command": "الطلب",
      "amount": "المبلغ",
      "method": "الطريقة",
      "recordedBy": "سجّله",
      "notes": "ملاحظات"
    },
    "empty": {
      "title": "لا توجد مدفوعات",
      "description": "ستظهر المدفوعات هنا"
    }
  },
  "unpaidCommands": {
    "title": "الطلبات غير المدفوعة",
    "subtitle": "طلبات في انتظار الدفع أو مدفوعة جزئياً",
    "table": {
      "client": "العميل",
      "service": "الخدمة",
      "totalAmount": "المبلغ الإجمالي",
      "paid": "المدفوع",
      "remaining": "المتبقي",
      "status": "الحالة",
      "action": "إجراء"
    },
    "empty": {
      "title": "لا توجد طلبات غير مدفوعة",
      "description": "جميع الطلبات مسددة"
    },
    "addPayment": "إضافة دفعة"
  },
  "reports": {
    "title": "التقارير المالية",
    "chartTitle": "الإيرادات مقابل المصروفات",
    "chartSubtitle": "التطور خلال الأشهر الستة الماضية",
    "months": {
      "jan": "يناير",
      "feb": "فبراير",
      "mar": "مارس",
      "apr": "أبريل",
      "may": "مايو",
      "jun": "يونيو"
    },
    "revenues": "الإيرادات",
    "expenses": "المصروفات"
  },
  "dialog": {
    "title": "دفعة جديدة",
    "subtitle": "سجّل دفعة لطلب",
    "form": {
      "command": "الطلب",
      "selectCommand": "اختر طلباً",
      "noUnpaidCommands": "لا توجد طلبات غير مدفوعة",
      "addCommand": "إضافة طلب",
      "amount": "المبلغ (د.ج)",
      "method": "طريقة الدفع",
      "notes": "ملاحظات (اختياري)",
      "notesPlaceholder": "ملاحظات حول هذه الدفعة...",
      "remaining": "المتبقي"
    }
  },
  "actions": {
    "newPayment": "تسجيل دفعة",
    "saving": "جاري الحفظ..."
  }
}
```

---

## Files to Modify

### 1. EmployeesPage.tsx

Add `useTranslation` and replace all hardcoded strings:

| Current | Translation Key |
|---------|-----------------|
| `"Employés"` | `t('title')` |
| `"Gestion des comptes utilisateurs"` | `t('subtitle')` |
| `"Annuaire des employés"` | `t('directory.title')` |
| `"X employés enregistrés"` | `t('directory.count', { count })` |
| `"Rôle"`, `"Statut"` | `t('filters.role')`, `t('filters.status')` |
| Form labels | `t('form.*')` |
| Table headers | `t('table.*')` |
| Status badges | `t('status.active')`, `t('status.inactive')` |
| Role labels | `t('roles.admin')`, `t('roles.employee')` |

### 2. SuppliersPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Fournisseurs"` | `t('title')` |
| `"Gestion des partenaires..."` | `t('subtitle')` |
| `"Base de données fournisseurs"` | `t('database.title')` |
| `"X fournisseurs actifs"` | `t('database.activeCount', { count })` |
| Form labels | `t('form.*')` |
| Service type labels | Using `common` namespace |

### 3. ExpensesPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Dépenses"` | `t('title')` |
| `"Gestion des dépenses..."` | `t('subtitle')` |
| `"Ce Mois"`, `"Cette Année"`, `"Total Global"` | `t('stats.*')` |
| `"Liste"`, `"Statistiques"` | `t('tabs.*')` |
| Category labels | `t('categories.*')` |
| Form labels | `t('form.*')` |
| Table headers | `t('table.*')` |

### 4. ServicesPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Configuration des services"` | `t('title')` |
| `"Gérez les types de services..."` | `t('subtitle')` |
| `"X services actifs sur Y"` | `t('activeCount', { active, total })` |
| Form labels | `t('form.*')` |
| Service type labels | `t('types.*')` |
| Card date | `t('card.createdAt', { date })` |

### 5. EmployeeAccountingPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Comptabilité Employés"` | `t('accounting.title')` |
| `"Gestion des avances, crédits..."` | `t('accounting.subtitle')` |
| `"Total Avances"`, `"Total Crédits"`, `"Total Salaires"` | `t('accounting.stats.*')` |
| `"Situation Employés"`, `"Historique"` | `t('accounting.tabs.*')` |
| Form labels | `t('accounting.dialog.*')` |
| Table headers | `t('accounting.table.*')` |
| Transaction types | `t('accounting.transactionTypes.*')` |

### 6. SupplierAccountingPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Situation Fournisseurs"` | `t('accounting.title')` |
| `"Suivi des paiements..."` | `t('accounting.subtitle')` |
| `"Total Achats"`, `"Total Versé"`, `"Reste à Payer"` | `t('accounting.balance.*')` |
| Tab names | `t('accounting.tabs.*')` |
| Transaction types | `t('accounting.transaction.*')` |
| All sub-tab content | Using existing keys in suppliers.json |

### 7. AccountingPage.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Comptabilité"` | `t('title')` |
| `"Suivi financier..."` | `t('subtitle')` |
| Stats cards | `t('stats.*')` |
| Tab names | `t('tabs.*')` |
| Table headers | `t('payments.table.*')` |
| Form labels | `t('dialog.form.*')` |

---

## RTL Considerations

All icon margins will use RTL-aware classes:
- `mr-2` becomes `ltr:mr-2 rtl:ml-2`

Date formatting will be locale-aware:
```typescript
new Date(date).toLocaleDateString(
  i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
  { day: '2-digit', month: 'short', year: 'numeric' }
)
```

---

## Summary

| File | Action |
|------|--------|
| `src/i18n/locales/fr/services.json` | CREATE - New translation file |
| `src/i18n/locales/ar/services.json` | CREATE - New translation file |
| `src/i18n/locales/fr/accounting.json` | CREATE - New translation file |
| `src/i18n/locales/ar/accounting.json` | CREATE - New translation file |
| `src/pages/EmployeesPage.tsx` | MODIFY - Add ~30 translations |
| `src/pages/SuppliersPage.tsx` | MODIFY - Add ~25 translations |
| `src/pages/ExpensesPage.tsx` | MODIFY - Add ~40 translations |
| `src/pages/ServicesPage.tsx` | MODIFY - Add ~25 translations |
| `src/pages/EmployeeAccountingPage.tsx` | MODIFY - Add ~45 translations |
| `src/pages/SupplierAccountingPage.tsx` | MODIFY - Add ~50 translations |
| `src/pages/AccountingPage.tsx` | MODIFY - Add ~45 translations |
| `src/i18n/index.ts` | MODIFY - Register new translation namespaces |

This will make all remaining pages fully bilingual with proper RTL support for Arabic.
