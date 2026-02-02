

# Plan: Enhanced Supplier Information Fields

## Overview

Update the Supplier entity with comprehensive business information fields based on the user's requirements. This replaces the current simple supplier model with a more detailed one suitable for managing airline, hotel, and visa partners.

---

## Current vs New Supplier Fields

| Current Field | Status | New Field |
|---------------|--------|-----------|
| `name` | Keep | `name` (Nom société) |
| `contact` | Keep | `contact` |
| `phone` | Keep | `phone` (Téléphone) |
| `email` | Keep | `email` |
| `serviceTypes` | **Replace** | `type` (single supplier type) |
| - | **Add** | `country` (Pays) |
| - | **Add** | `city` (Ville) |
| - | **Add** | `currency` (Devise) |
| - | **Add** | `bankAccount` (IBAN / CCP) |
| `isActive` | Keep | `isActive` |
| `createdAt` | Keep | `createdAt` |

---

## New Supplier Type Options

Based on the travel agency context, supplier types will include:

| Code | French | Arabic |
|------|--------|--------|
| `airline` | Compagnie aérienne | شركة طيران |
| `hotel` | Hôtel | فندق |
| `visa` | Visa | تأشيرة |
| `transport` | Transport | نقل |
| `insurance` | Assurance | تأمين |
| `other` | Autre | أخرى |

---

## Files to Create

| File | Purpose |
|------|---------|
| `server/src/database/migrations/TIMESTAMP-AddSupplierFields.ts` | Database migration for new columns |

---

## Files to Modify

### Backend (6 files)

| File | Changes |
|------|---------|
| `server/src/suppliers/entities/supplier.entity.ts` | Add new columns, replace `serviceTypes[]` with `type` |
| `server/src/suppliers/dto/create-supplier.dto.ts` | Add new field validators |
| `server/src/suppliers/dto/update-supplier.dto.ts` | Add optional new fields |
| `server/typeorm.config.ts` | Already configured (no changes needed) |

### Frontend (5 files)

| File | Changes |
|------|---------|
| `src/types/index.ts` | Update `Supplier` interface |
| `src/lib/api.ts` | Update `CreateSupplierDto` and `UpdateSupplierDto` |
| `src/pages/SuppliersPage.tsx` | Update form fields and table columns |
| `src/i18n/locales/fr/suppliers.json` | Add French translations |
| `src/i18n/locales/ar/suppliers.json` | Add Arabic translations |

---

## Implementation Details

### 1. Database Migration

```sql
-- Add new columns to suppliers table
ALTER TABLE "suppliers" 
  ADD COLUMN "type" character varying DEFAULT 'other',
  ADD COLUMN "country" character varying,
  ADD COLUMN "city" character varying,
  ADD COLUMN "currency" character varying DEFAULT 'DZD',
  ADD COLUMN "bankAccount" character varying;

-- Migrate existing serviceTypes data to new type column
-- Take the first service type as the main type
UPDATE "suppliers" SET "type" = 
  CASE 
    WHEN "serviceTypes" LIKE 'visa%' THEN 'visa'
    WHEN "serviceTypes" LIKE 'ticket%' THEN 'airline'
    WHEN "serviceTypes" LIKE 'residence%' THEN 'hotel'
    ELSE 'other'
  END;

-- Drop the old serviceTypes column
ALTER TABLE "suppliers" DROP COLUMN "serviceTypes";
```

### 2. Updated Supplier Entity

```typescript
@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'other' })
  type: string;  // airline, hotel, visa, transport, insurance, other

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ default: 'DZD' })
  currency: string;

  @Column({ nullable: true })
  bankAccount: string;  // IBAN / CCP

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. Updated Form UI (SuppliersPage)

The form will be reorganized into logical sections:

```text
+------------------------------------------+
| INFORMATIONS GÉNÉRALES                    |
| +----------------+  +------------------+  |
| | Nom société *  |  | Type *           |  |
| +----------------+  +------------------+  |
|                                          |
| LOCALISATION                             |
| +----------------+  +------------------+  |
| | Pays           |  | Ville            |  |
| +----------------+  +------------------+  |
|                                          |
| COORDONNÉES                              |
| +----------------+  +------------------+  |
| | Téléphone      |  | Email            |  |
| +----------------+  +------------------+  |
| +--------------------------------------+ |
| | Contact (personne)                   | |
| +--------------------------------------+ |
|                                          |
| INFORMATIONS BANCAIRES                   |
| +----------------+  +------------------+  |
| | Devise         |  | IBAN / CCP       |  |
| +----------------+  +------------------+  |
+------------------------------------------+
```

### 4. Updated Table Display

| Column | Content |
|--------|---------|
| Fournisseur | Name + Type badge |
| Localisation | Country, City |
| Coordonnées | Phone, Email |
| Contact | Contact person name |
| Devise | Currency code |
| Statut | Active/Inactive badge |
| Actions | Edit, Delete buttons |

---

## Translations

### French (`suppliers.json`)

```json
{
  "form": {
    "companyName": "Nom société",
    "type": "Type",
    "country": "Pays",
    "countryPlaceholder": "Algérie",
    "city": "Ville",
    "cityPlaceholder": "Alger",
    "phone": "Téléphone",
    "email": "Email",
    "contactPerson": "Contact",
    "currency": "Devise",
    "currencyPlaceholder": "DZD",
    "bankAccount": "IBAN / CCP",
    "bankAccountPlaceholder": "00799999000123456789"
  },
  "types": {
    "airline": "Compagnie aérienne",
    "hotel": "Hôtel",
    "visa": "Visa",
    "transport": "Transport",
    "insurance": "Assurance",
    "other": "Autre"
  },
  "table": {
    "supplier": "Fournisseur",
    "location": "Localisation",
    "coordinates": "Coordonnées",
    "contact": "Contact",
    "currency": "Devise",
    "status": "Statut",
    "actions": "Actions"
  }
}
```

### Arabic (`suppliers.json`)

```json
{
  "form": {
    "companyName": "اسم الشركة",
    "type": "النوع",
    "country": "البلد",
    "countryPlaceholder": "الجزائر",
    "city": "المدينة",
    "cityPlaceholder": "الجزائر العاصمة",
    "phone": "الهاتف",
    "email": "البريد الإلكتروني",
    "contactPerson": "جهة الاتصال",
    "currency": "العملة",
    "currencyPlaceholder": "DZD",
    "bankAccount": "IBAN / CCP",
    "bankAccountPlaceholder": "00799999000123456789"
  },
  "types": {
    "airline": "شركة طيران",
    "hotel": "فندق",
    "visa": "تأشيرة",
    "transport": "نقل",
    "insurance": "تأمين",
    "other": "أخرى"
  },
  "table": {
    "supplier": "المورد",
    "location": "الموقع",
    "coordinates": "بيانات الاتصال",
    "contact": "جهة الاتصال",
    "currency": "العملة",
    "status": "الحالة",
    "actions": "الإجراءات"
  }
}
```

---

## Currency Options

Common currencies for travel agencies:

| Code | Label |
|------|-------|
| `DZD` | Dinar algérien |
| `EUR` | Euro |
| `USD` | Dollar US |
| `SAR` | Riyal saoudien |
| `AED` | Dirham émirati |
| `TRY` | Lire turque |
| `GBP` | Livre sterling |

---

## Impact on Other Components

### Supplier Accounting Page

The `SupplierAccountingPage` will benefit from showing:
- Currency in financial summaries
- Bank account for payment references

### Commands Page

When selecting a supplier for a command, the dropdown can now show:
- Supplier name + type badge
- Location info for context

---

## Migration Strategy

Since this is using the new TypeORM migration workflow:

1. **Create migration file**: `server/src/database/migrations/TIMESTAMP-AddSupplierFields.ts`
2. **Run migration**: `npm run migration:run`
3. **Existing data**: Old `serviceTypes` array will be mapped to the new single `type` field

---

## File Summary

| Category | Count |
|----------|-------|
| **Migration file** | 1 (new) |
| **Backend files** | 3 (modified) |
| **Frontend files** | 4 (modified) |
| **Translation files** | 2 (modified) |
| **Total** | 10 files |

