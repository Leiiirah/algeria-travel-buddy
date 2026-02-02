
# Plan: Add Translations to Omra Tab

## Overview

The Omra module has extensive hardcoded French text across 4 files. Translation files already exist for both French (`fr/omra.json`) and Arabic (`ar/omra.json`) with partial coverage. We need to update the main page and all three tab components to use `react-i18next`, plus add missing translation keys.

---

## Current State

- ✅ Translation files exist with basic structure
- ❌ `OmraPage.tsx` - 10+ hardcoded strings
- ❌ `OmraOrdersTab.tsx` - 50+ hardcoded strings
- ❌ `OmraVisasTab.tsx` - 40+ hardcoded strings
- ❌ `OmraHotelsTab.tsx` - 25+ hardcoded strings
- ❌ Status/room type labels in `types/index.ts` are not translated dynamically

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/OmraPage.tsx` | Add translations for title, subtitle, stats cards, and tabs |
| `src/components/omra/OmraOrdersTab.tsx` | Add translations for table, form, dialog, filters, empty state |
| `src/components/omra/OmraVisasTab.tsx` | Add translations for table, form, dialog, filters, empty state |
| `src/components/omra/OmraHotelsTab.tsx` | Add translations for table, form, dialog, empty state |
| `src/i18n/locales/fr/omra.json` | Add missing translation keys |
| `src/i18n/locales/ar/omra.json` | Add missing translation keys |

---

## Detailed Changes

### 1. OmraPage.tsx

Add `useTranslation` hook and replace:

| Current | Translation Key |
|---------|-----------------|
| `"Omra"` | `t('title')` |
| `"Gestion des services Omra"` | `t('subtitle')` |
| `"Total Versements"` | `t('stats.totalPayments')` |
| `"Total Crédit (Reste)"` | `t('stats.totalCredit')` |
| `"Bénéfice Net"` | `t('stats.netProfit')` |
| `"Commandes"` | `t('tabs.orders')` |
| `"Visas"` | `t('tabs.visas')` |
| `"Hôtels"` | `t('tabs.hotels')` |

### 2. OmraOrdersTab.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Commandes Omra"` | `t('orders.title')` |
| `"X commandes au total"` | `t('orders.count', { count })` |
| `"Nouvelle Commande"` | `t('orders.dialog.createTitle')` |
| `"Modifier la commande"` | `t('orders.dialog.editTitle')` |
| `"Nom du client *"` | `t('orders.form.clientName')` |
| `"Téléphone"` | `t('orders.form.phone')` |
| `"Date commande"` | `t('orders.form.orderDate')` |
| `"Période du *"` | `t('orders.form.periodFrom')` |
| `"Au *"` | `t('orders.form.periodTo')` |
| `"Type de chambre"` | `t('orders.form.roomType')` |
| `"Prix de vente (DA)"` | `t('orders.form.sellingPrice')` |
| `"Versement (DA)"` | `t('orders.form.amountPaid')` |
| `"Prix d'achat (DA)"` | `t('orders.form.buyingPrice')` |
| `"Notes"` | `t('orders.form.notes')` |
| `"Reste à payer"` | `t('calculations.remaining')` |
| `"Bénéfice net"` | `t('calculations.profit')` |
| `"Aucune commande"` | `t('orders.empty.title')` |
| Table headers | `t('orders.table.*')` |
| Status labels | `t('status.*')` |
| Room type labels | `t('roomTypes.*')` |
| Filter labels | `t('filters.*')` |
| Actions | Using `common` namespace |

### 3. OmraVisasTab.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Visas Omra"` | `t('visas.title')` |
| `"X visas au total"` | `t('visas.count', { count })` |
| `"Nouveau Visa"` | `t('visas.dialog.createTitle')` |
| `"Modifier le visa"` | `t('visas.dialog.editTitle')` |
| `"Date du visa *"` | `t('visas.form.visaDate')` |
| `"Date d'entrée *"` | `t('visas.form.entryDate')` |
| Table headers | `t('visas.table.*')` |
| Empty state | `t('visas.empty.*')` |

### 4. OmraHotelsTab.tsx

| Current | Translation Key |
|---------|-----------------|
| `"Gestion des Hôtels"` | `t('hotels.title')` |
| `"X hôtels enregistrés"` | `t('hotels.count', { count })` |
| `"Nouvel Hôtel"` | `t('hotels.dialog.createTitle')` |
| `"Modifier l'hôtel"` | `t('hotels.dialog.editTitle')` |
| `"Nom de l'hôtel *"` | `t('hotels.form.hotelName')` |
| `"Localisation"` | `t('hotels.form.location')` |
| `"Actif"/"Inactif"` | `t('status.active')`/`t('status.inactive')` |
| Table headers | `t('hotels.table.*')` |
| Empty state | `t('hotels.empty.*')` |

---

## Additional Translation Keys Needed

### Add to `fr/omra.json`:

```json
{
  "loading": "Chargement...",
  "calculations": {
    "remaining": "Reste à payer",
    "profit": "Bénéfice net"
  },
  "filters": {
    "status": "Statut",
    "hotel": "Hôtel"
  },
  "status": {
    "en_attente": "En attente",
    "confirme": "Confirmé",
    "termine": "Terminé",
    "annule": "Annulé",
    "active": "Actif",
    "inactive": "Inactif"
  },
  "roomTypes": {
    "chambre_1": "Chambre 1 personne",
    "chambre_2": "Chambre 2 personnes",
    "chambre_3": "Chambre 3 personnes",
    "chambre_4": "Chambre 4 personnes",
    "chambre_5": "Chambre 5 personnes",
    "suite": "Suite"
  },
  "orders": {
    "count": "{{count}} commandes au total",
    "empty": {
      "title": "Aucune commande",
      "description": "Commencez par créer une commande Omra"
    },
    "dialog": {
      "createDescription": "Créez une nouvelle commande pour le pèlerinage Omra",
      "editDescription": "Modifiez les informations de la commande"
    },
    "form": {
      "orderDate": "Date commande",
      "periodFrom": "Période du",
      "periodTo": "Au",
      "hotel": "Hôtel",
      "roomType": "Type de chambre",
      "noHotelAvailable": "Aucun hôtel disponible",
      "addHotel": "Ajouter un hôtel",
      "selectHotel": "Sélectionner un hôtel",
      "hotelPlaceholder": "Nom de l'hôtel"
    },
    "table": {
      "client": "Client",
      "period": "Période",
      "hotel": "Hôtel",
      "room": "Chambre",
      "price": "Prix",
      "status": "Statut",
      "actions": "Actions",
      "remaining": "Reste"
    },
    "confirm": {
      "delete": "Êtes-vous sûr de vouloir supprimer cette commande ?"
    }
  },
  "visas": {
    "count": "{{count}} visas au total",
    "empty": {
      "title": "Aucun visa",
      "description": "Commencez par créer un visa Omra"
    },
    "dialog": {
      "createDescription": "Créez un nouveau visa pour le pèlerinage Omra",
      "editDescription": "Modifiez les informations du visa"
    },
    "form": {
      "visaDate": "Date du visa",
      "entryDate": "Date d'entrée",
      "hotel": "Hôtel",
      "selectHotel": "Sélectionner un hôtel"
    },
    "table": {
      "client": "Client",
      "visaDate": "Date Visa",
      "entryDate": "Date Entrée",
      "hotel": "Hôtel",
      "price": "Prix",
      "status": "Statut",
      "actions": "Actions",
      "remaining": "Reste"
    },
    "confirm": {
      "delete": "Êtes-vous sûr de vouloir supprimer ce visa ?"
    }
  },
  "hotels": {
    "title": "Gestion des Hôtels",
    "count": "{{count}} hôtels enregistrés",
    "empty": {
      "title": "Aucun hôtel",
      "description": "Commencez par ajouter un hôtel pour vos services Omra"
    },
    "dialog": {
      "createTitle": "Nouvel hôtel",
      "editTitle": "Modifier l'hôtel",
      "createDescription": "Ajoutez un nouvel hôtel pour vos services Omra",
      "editDescription": "Modifiez les informations de l'hôtel"
    },
    "form": {
      "hotelName": "Nom de l'hôtel",
      "location": "Localisation",
      "hotelPlaceholder": "Ex: Hotel Makkah Towers",
      "locationPlaceholder": "Ex: La Mecque, Arabie Saoudite"
    },
    "table": {
      "name": "Nom",
      "location": "Localisation",
      "status": "Statut",
      "actions": "Actions"
    },
    "confirm": {
      "delete": "Êtes-vous sûr de vouloir supprimer cet hôtel ?"
    }
  },
  "actions": {
    "add": "Ajouter",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "create": "Créer",
    "edit": "Modifier",
    "delete": "Supprimer"
  }
}
```

### Add to `ar/omra.json`:

```json
{
  "loading": "جاري التحميل...",
  "calculations": {
    "remaining": "المتبقي للدفع",
    "profit": "صافي الربح"
  },
  "filters": {
    "status": "الحالة",
    "hotel": "الفندق"
  },
  "status": {
    "en_attente": "قيد الانتظار",
    "confirme": "مؤكد",
    "termine": "منتهي",
    "annule": "ملغى",
    "active": "نشط",
    "inactive": "غير نشط"
  },
  "roomTypes": {
    "chambre_1": "غرفة لشخص واحد",
    "chambre_2": "غرفة لشخصين",
    "chambre_3": "غرفة لثلاثة أشخاص",
    "chambre_4": "غرفة لأربعة أشخاص",
    "chambre_5": "غرفة لخمسة أشخاص",
    "suite": "جناح"
  },
  "orders": {
    "count": "{{count}} طلب إجمالاً",
    "empty": {
      "title": "لا توجد طلبات",
      "description": "ابدأ بإنشاء طلب عمرة"
    },
    "dialog": {
      "createDescription": "أنشئ طلباً جديداً لرحلة العمرة",
      "editDescription": "عدّل معلومات الطلب"
    },
    "form": {
      "orderDate": "تاريخ الطلب",
      "periodFrom": "الفترة من",
      "periodTo": "إلى",
      "hotel": "الفندق",
      "roomType": "نوع الغرفة",
      "noHotelAvailable": "لا توجد فنادق متاحة",
      "addHotel": "إضافة فندق",
      "selectHotel": "اختر فندقاً",
      "hotelPlaceholder": "اسم الفندق"
    },
    "table": {
      "client": "العميل",
      "period": "الفترة",
      "hotel": "الفندق",
      "room": "الغرفة",
      "price": "السعر",
      "status": "الحالة",
      "actions": "الإجراءات",
      "remaining": "المتبقي"
    },
    "confirm": {
      "delete": "هل أنت متأكد من حذف هذا الطلب؟"
    }
  },
  "visas": {
    "count": "{{count}} تأشيرة إجمالاً",
    "empty": {
      "title": "لا توجد تأشيرات",
      "description": "ابدأ بإنشاء تأشيرة عمرة"
    },
    "dialog": {
      "createDescription": "أنشئ تأشيرة جديدة لرحلة العمرة",
      "editDescription": "عدّل معلومات التأشيرة"
    },
    "form": {
      "visaDate": "تاريخ التأشيرة",
      "entryDate": "تاريخ الدخول",
      "hotel": "الفندق",
      "selectHotel": "اختر فندقاً"
    },
    "table": {
      "client": "العميل",
      "visaDate": "تاريخ التأشيرة",
      "entryDate": "تاريخ الدخول",
      "hotel": "الفندق",
      "price": "السعر",
      "status": "الحالة",
      "actions": "الإجراءات",
      "remaining": "المتبقي"
    },
    "confirm": {
      "delete": "هل أنت متأكد من حذف هذه التأشيرة؟"
    }
  },
  "hotels": {
    "title": "إدارة الفنادق",
    "count": "{{count}} فندق مسجل",
    "empty": {
      "title": "لا توجد فنادق",
      "description": "ابدأ بإضافة فندق لخدمات العمرة"
    },
    "dialog": {
      "createTitle": "فندق جديد",
      "editTitle": "تعديل الفندق",
      "createDescription": "أضف فندقاً جديداً لخدمات العمرة",
      "editDescription": "عدّل معلومات الفندق"
    },
    "form": {
      "hotelName": "اسم الفندق",
      "location": "الموقع",
      "hotelPlaceholder": "مثال: أبراج مكة",
      "locationPlaceholder": "مثال: مكة المكرمة، المملكة العربية السعودية"
    },
    "table": {
      "name": "الاسم",
      "location": "الموقع",
      "status": "الحالة",
      "actions": "الإجراءات"
    },
    "confirm": {
      "delete": "هل أنت متأكد من حذف هذا الفندق؟"
    }
  },
  "actions": {
    "add": "إضافة",
    "cancel": "إلغاء",
    "save": "حفظ",
    "create": "إنشاء",
    "edit": "تعديل",
    "delete": "حذف"
  }
}
```

---

## RTL Considerations

All icon margins will be updated to use RTL-aware classes:
- `mr-2` → `ltr:mr-2 rtl:ml-2`

Date formatting will be locale-aware using `i18n.language`.

---

## Summary

| File | Action |
|------|--------|
| `src/pages/OmraPage.tsx` | Add translations (~10 strings) |
| `src/components/omra/OmraOrdersTab.tsx` | Add translations (~50 strings) |
| `src/components/omra/OmraVisasTab.tsx` | Add translations (~40 strings) |
| `src/components/omra/OmraHotelsTab.tsx` | Add translations (~25 strings) |
| `src/i18n/locales/fr/omra.json` | Add extensive missing keys |
| `src/i18n/locales/ar/omra.json` | Add extensive missing keys |

This will make the entire Omra module fully bilingual with proper RTL support for Arabic.
