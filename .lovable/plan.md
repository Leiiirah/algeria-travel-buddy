
# Invoicing (Facturation) Module Implementation Plan

## Overview

This plan implements a dedicated client invoicing module for the El Hikma travel agency platform. The module allows employees to generate, manage, and track **Proforma** and **Final** invoices for clients, with full data isolation between employees and global visibility for administrators.

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (NestJS)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Database Migration     → Create 'client_invoices' table with enums    │
│  Entity                 → ClientInvoice with type/status enums         │
│  DTOs                   → Create/Update/Filter DTOs                    │
│  Service                → CRUD + stats + data isolation logic          │
│  Controller             → RESTful endpoints with role guards           │
│  Module                 → Register in AppModule                         │
├─────────────────────────────────────────────────────────────────────────┤
│                          FRONTEND (React)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Types                  → ClientInvoice type definitions               │
│  API Client             → API methods for invoices                     │
│  React Query Hooks      → useClientInvoices, mutations                 │
│  Page                   → InvoicesPage.tsx                             │
│  Sidebar                → Add "Factures" navigation item               │
│  Routes                 → /factures route (accessible to all users)    │
│  PDF Generator          → Enhanced for proforma/finale types           │
│  Translations           → French & Arabic translations                 │
│  Skeleton               → Loading state component                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `client_invoices`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary key |
| `invoiceNumber` | VARCHAR(50) | Auto-generated reference (e.g., PRO-20260204-001, FAC-20260204-001) |
| `type` | ENUM | `proforma` or `finale` |
| `status` | ENUM | `brouillon`, `envoyee`, `payee`, `annulee` |
| `commandId` | UUID (nullable, FK) | Optional link to Commands table |
| `clientName` | VARCHAR(255) | Client full name |
| `clientPhone` | VARCHAR(50) | Client phone number |
| `clientEmail` | VARCHAR(255) | Optional email |
| `serviceName` | VARCHAR(255) | Service description |
| `serviceType` | VARCHAR(50) | Type of service (visa, ticket, etc.) |
| `destination` | VARCHAR(255) | Travel destination |
| `totalAmount` | DECIMAL(10,2) | Invoice total (DZD) |
| `paidAmount` | DECIMAL(10,2) | Amount already paid |
| `invoiceDate` | DATE | Invoice issue date |
| `dueDate` | DATE | Payment due date (optional) |
| `notes` | TEXT | Additional notes |
| `createdBy` | UUID (FK) | Employee who created the invoice |
| `createdAt` | TIMESTAMP | Creation timestamp |
| `updatedAt` | TIMESTAMP | Last update timestamp |

### Enums
- `client_invoice_type_enum`: `proforma`, `finale`
- `client_invoice_status_enum`: `brouillon`, `envoyee`, `payee`, `annulee`

---

## Backend Implementation

### 1. Migration File
**File:** `server/src/database/migrations/1770300000000-AddClientInvoices.ts`

Creates the `client_invoices` table with enums, foreign keys to `commands` and `users`, and performance indexes.

### 2. Entity
**File:** `server/src/client-invoices/entities/client-invoice.entity.ts`

TypeORM entity with:
- Enum types for `type` and `status`
- ManyToOne relations to `User` (creator) and `Command` (optional)
- Decimal fields for financial amounts

### 3. DTOs
**Files:**
- `server/src/client-invoices/dto/create-client-invoice.dto.ts`
- `server/src/client-invoices/dto/update-client-invoice.dto.ts`

Validation decorators for all fields with class-validator.

### 4. Service
**File:** `server/src/client-invoices/client-invoices.service.ts`

Key methods:
- `findAll(user)`: Returns all invoices for admin, only own invoices for employees
- `findOne(id, user)`: With ownership check
- `create(dto, userId)`: Auto-generates invoice number based on type
- `update(id, dto, user)`: Ownership validation for employees
- `remove(id)`: Admin-only deletion
- `getStats(user)`: Role-aware statistics
- `findByCommand(commandId, user)`: Get invoices linked to a command

### 5. Controller
**File:** `server/src/client-invoices/client-invoices.controller.ts`

Endpoints:
- `GET /client-invoices` - List with filters
- `GET /client-invoices/stats` - Dashboard statistics
- `GET /client-invoices/:id` - Single invoice
- `GET /client-invoices/command/:commandId` - Invoices by command
- `POST /client-invoices` - Create new invoice
- `POST /client-invoices/from-command/:commandId` - Create from command data
- `PATCH /client-invoices/:id` - Update invoice
- `DELETE /client-invoices/:id` - Delete (admin only)

### 6. Module
**File:** `server/src/client-invoices/client-invoices.module.ts`

Registers entity, controller, service, and imports User/Command entities for relations.

### 7. App Module Update
**File:** `server/src/app.module.ts`

Import `ClientInvoicesModule`.

---

## Frontend Implementation

### 1. Types
**File:** `src/types/index.ts` (additions)

```typescript
export type ClientInvoiceType = 'proforma' | 'finale';
export type ClientInvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'annulee';

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  type: ClientInvoiceType;
  status: ClientInvoiceStatus;
  commandId?: string;
  command?: Command;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  serviceType?: string;
  destination?: string;
  totalAmount: number;
  paidAmount: number;
  invoiceDate: Date;
  dueDate?: Date;
  notes?: string;
  createdBy: string;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. API Client
**File:** `src/lib/api.ts` (additions)

New DTOs and methods:
- `CreateClientInvoiceDto`, `UpdateClientInvoiceDto`, `ClientInvoiceFilters`
- `getClientInvoices(filters?)`, `getClientInvoice(id)`, `getClientInvoiceStats()`
- `createClientInvoice(dto)`, `createClientInvoiceFromCommand(commandId, type)`
- `updateClientInvoice(id, dto)`, `deleteClientInvoice(id)`

### 3. React Query Hooks
**File:** `src/hooks/useClientInvoices.ts`

Hooks with toast notifications:
- `useClientInvoices(filters?)` - List invoices
- `useClientInvoice(id)` - Single invoice
- `useClientInvoiceStats(enabled?)` - Statistics (admin-conditional)
- `useCreateClientInvoice()` - Create mutation
- `useCreateClientInvoiceFromCommand()` - Create from command
- `useUpdateClientInvoice()` - Update mutation
- `useDeleteClientInvoice()` - Delete mutation

### 4. Invoices Page
**File:** `src/pages/InvoicesPage.tsx`

Full-featured page with:
- Stats cards (total invoices, pending, paid amounts)
- Filter bar (type, status, date range, search)
- Invoices table with color-coded statuses
- Create/Edit dialog with form validation
- Quick "Generate from Command" flow
- PDF download action
- Delete confirmation (admin only)
- Bilingual support (FR/AR)

### 5. Enhanced Invoice Generator
**File:** `src/utils/invoiceGenerator.ts` (modifications)

Add:
- `invoiceType: 'proforma' | 'finale'` parameter
- Different header titles: "FACTURE PROFORMA" vs "FACTURE"
- Proforma watermark/notice: "Ceci est un devis, pas une facture officielle"
- Conditional footer based on type

### 6. Sidebar Navigation
**File:** `src/components/layout/AppSidebar.tsx`

Add to `mainMenuItems`:
```typescript
{
  titleKey: 'navigation.invoices',
  url: '/factures',
  icon: Receipt, // or FileText
}
```

### 7. Route Registration
**File:** `src/App.tsx`

Add protected route:
```typescript
<Route
  path="/factures"
  element={
    <ProtectedRoute>
      <InvoicesPage />
    </ProtectedRoute>
  }
/>
```

### 8. Skeleton Component
**File:** `src/components/skeletons/InvoicesSkeleton.tsx`

Loading state with stats cards and table skeleton.

### 9. Translation Files

**French (`src/i18n/locales/fr/invoices.json`):**
```json
{
  "title": "Factures Clients",
  "add": "Ajouter Facture",
  "history": "Historique",
  "type": {
    "proforma": "Proforma",
    "finale": "Finale"
  },
  "status": {
    "brouillon": "Brouillon",
    "envoyee": "Envoyée",
    "payee": "Payée",
    "annulee": "Annulée"
  },
  "form": {
    "invoiceType": "Type de facture",
    "clientName": "Nom du client",
    "totalAmount": "Montant total",
    "paidAmount": "Montant payé",
    "remaining": "Reste à payer"
  },
  "stats": {
    "total": "Total Factures",
    "pending": "En attente",
    "paid": "Payées",
    "totalRevenue": "Revenu Total"
  },
  "actions": {
    "download": "Télécharger PDF",
    "generateFromCommand": "Générer depuis commande"
  }
}
```

**Arabic (`src/i18n/locales/ar/invoices.json`):**
```json
{
  "title": "فواتير العملاء",
  "add": "إضافة فاتورة",
  "history": "السجل",
  "type": {
    "proforma": "فاتورة مبدئية",
    "finale": "فاتورة نهائية"
  },
  "status": {
    "brouillon": "مسودة",
    "envoyee": "مرسلة",
    "payee": "مدفوعة",
    "annulee": "ملغاة"
  }
}
```

**Common translations update:**
Add `"invoices": "Factures"` to navigation in both FR and AR files.

### 10. Commands Page Integration
**File:** `src/pages/CommandsPage.tsx` (modifications)

Add "Generate Invoice" action to command dropdown menu:
- Opens dialog to select invoice type (Proforma/Finale)
- Creates invoice pre-filled with command data
- Redirects to invoice detail or stays on page with success toast

---

## Data Isolation & Access Control

| Action | Admin | Employee |
|--------|-------|----------|
| View all invoices | ✅ | ❌ (own only) |
| Create invoice | ✅ | ✅ |
| Edit any invoice | ✅ | ❌ |
| Edit own invoice | ✅ | ✅ |
| Delete invoice | ✅ | ❌ |
| View stats (global) | ✅ | ❌ |
| View stats (personal) | ✅ | ✅ |

---

## UI/UX Design

### Color Scheme (matching client sketch)
- **Add Invoice button**: Green (`bg-green-600`)
- **History tab/button**: Light green (`bg-green-100`)
- **Proforma badge**: Blue (`bg-blue-100 text-blue-800`)
- **Finale badge**: Purple (`bg-purple-100 text-purple-800`)
- **Status badges**: Yellow (pending), Green (paid), Red (cancelled)

### Invoice Table Columns
1. N° Facture (invoiceNumber)
2. Type (proforma/finale badge)
3. Client
4. Service
5. Montant
6. Payé
7. Reste (color-coded: red if > 0, green if 0)
8. Date
9. Statut
10. Actions (view, edit, download PDF, delete)

---

## Files to Create/Modify

### New Files (14)
1. `server/src/database/migrations/1770300000000-AddClientInvoices.ts`
2. `server/src/client-invoices/client-invoices.module.ts`
3. `server/src/client-invoices/client-invoices.controller.ts`
4. `server/src/client-invoices/client-invoices.service.ts`
5. `server/src/client-invoices/entities/client-invoice.entity.ts`
6. `server/src/client-invoices/dto/create-client-invoice.dto.ts`
7. `server/src/client-invoices/dto/update-client-invoice.dto.ts`
8. `src/hooks/useClientInvoices.ts`
9. `src/pages/InvoicesPage.tsx`
10. `src/components/skeletons/InvoicesSkeleton.tsx`
11. `src/i18n/locales/fr/invoices.json`
12. `src/i18n/locales/ar/invoices.json`

### Modified Files (7)
1. `server/src/app.module.ts` - Import ClientInvoicesModule
2. `src/types/index.ts` - Add ClientInvoice types
3. `src/lib/api.ts` - Add API methods
4. `src/App.tsx` - Add /factures route
5. `src/components/layout/AppSidebar.tsx` - Add navigation item
6. `src/utils/invoiceGenerator.ts` - Enhance for dual types
7. `src/i18n/index.ts` - Register invoices namespace
8. `src/i18n/locales/fr/common.json` - Add navigation.invoices
9. `src/i18n/locales/ar/common.json` - Add navigation.invoices

---

## Implementation Order

1. **Backend First**
   - Migration → Entity → DTOs → Service → Controller → Module → App integration
   
2. **Frontend Core**
   - Types → API Client → Hooks → Page → Skeleton
   
3. **Integration**
   - Sidebar → Routes → Translations → PDF Generator enhancements

4. **Polish**
   - Commands page integration → Testing → RTL layout verification
