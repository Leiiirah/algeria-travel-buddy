
# Plan: Supplier Orders, Receipts & Invoices in Situation Fournisseurs

## Overview

This plan adds three new tabs to the **Situation Fournisseurs** page (`/comptabilite-fournisseurs`) for comprehensive supplier purchase management:

1. **Commandes** - Bulk purchases from suppliers (e.g., "10 tickets from Turkish Airlines")
2. **Reçus** - What the agency actually received/bought from suppliers
3. **Factures** - Invoices received from suppliers

The existing tabs (Situation Fournisseurs, Historique Transactions) will remain unchanged.

---

## Updated Tab Structure

```text
+----------------------------------------------------------+
| Situation Fournisseurs                                    |
+----------------------------------------------------------+
| [Situation] [Historique] [Commandes] [Reçus] [Factures]  |
+----------------------------------------------------------+
```

---

## Data Model

### 1. Supplier Orders (supplier_orders)

Tracks bulk purchases made from suppliers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplierId` | UUID | Foreign key to supplier |
| `orderNumber` | VARCHAR | Auto-generated: SO-YYYYMMDD-XXX |
| `description` | TEXT | What was ordered |
| `quantity` | INTEGER | Number of items ordered |
| `unitPrice` | DECIMAL | Price per unit |
| `totalAmount` | DECIMAL | quantity × unitPrice |
| `orderDate` | DATE | Date of the order |
| `status` | ENUM | `en_attente`, `livre`, `partiel`, `annule` |
| `deliveredQuantity` | INTEGER | Items received so far |
| `notes` | TEXT | Additional notes |
| `createdBy` | UUID | User who created |
| `createdAt` | TIMESTAMP | Auto-generated |

### 2. Receipts (supplier_receipts)

Tracks what the agency actually received from suppliers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplierId` | UUID | Foreign key to supplier |
| `orderId` | UUID | Optional link to supplier order |
| `receiptNumber` | VARCHAR | Auto-generated: REC-YYYYMMDD-XXX |
| `description` | TEXT | What was received |
| `quantity` | INTEGER | Number of items received |
| `unitPrice` | DECIMAL | Price per unit |
| `totalAmount` | DECIMAL | quantity × unitPrice |
| `receiptDate` | DATE | Date of receipt |
| `notes` | TEXT | Additional notes |
| `createdBy` | UUID | User who recorded |
| `createdAt` | TIMESTAMP | Auto-generated |

### 3. Invoices (supplier_invoices)

Tracks invoices received from suppliers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `supplierId` | UUID | Foreign key to supplier |
| `invoiceNumber` | VARCHAR | Invoice number from supplier |
| `internalRef` | VARCHAR | Auto-generated: INV-YYYYMMDD-XXX |
| `description` | TEXT | Invoice description |
| `amount` | DECIMAL | Invoice amount |
| `invoiceDate` | DATE | Date on the invoice |
| `dueDate` | DATE | Payment due date |
| `status` | ENUM | `non_paye`, `partiel`, `paye` |
| `paidAmount` | DECIMAL | Amount already paid |
| `fileUrl` | VARCHAR | Path to uploaded file |
| `notes` | TEXT | Additional notes |
| `createdBy` | UUID | User who recorded |
| `createdAt` | TIMESTAMP | Auto-generated |

---

## Status Enums

**Order Status:**
- `en_attente` - Pending
- `livre` - Fully delivered
- `partiel` - Partially delivered
- `annule` - Cancelled

**Invoice Status:**
- `non_paye` - Not paid
- `partiel` - Partially paid
- `paye` - Fully paid

---

## Backend Implementation (NestJS)

### New Modules

```text
server/src/
├── supplier-orders/
│   ├── entities/supplier-order.entity.ts
│   ├── dto/create-supplier-order.dto.ts
│   ├── dto/update-supplier-order.dto.ts
│   ├── supplier-orders.service.ts
│   ├── supplier-orders.controller.ts
│   └── supplier-orders.module.ts
├── supplier-receipts/
│   ├── entities/supplier-receipt.entity.ts
│   ├── dto/create-supplier-receipt.dto.ts
│   ├── supplier-receipts.service.ts
│   ├── supplier-receipts.controller.ts
│   └── supplier-receipts.module.ts
└── supplier-invoices/
    ├── entities/supplier-invoice.entity.ts
    ├── dto/create-supplier-invoice.dto.ts
    ├── dto/update-supplier-invoice.dto.ts
    ├── supplier-invoices.service.ts
    ├── supplier-invoices.controller.ts
    └── supplier-invoices.module.ts
```

### API Endpoints

**Supplier Orders:**
- `GET /supplier-orders` - List all (with optional supplierId filter)
- `GET /supplier-orders/:id` - Get single order
- `POST /supplier-orders` - Create new order
- `PATCH /supplier-orders/:id` - Update order
- `DELETE /supplier-orders/:id` - Delete order

**Supplier Receipts:**
- `GET /supplier-receipts` - List all (with filters)
- `GET /supplier-receipts/:id` - Get single receipt
- `POST /supplier-receipts` - Create receipt (auto-updates linked order)
- `DELETE /supplier-receipts/:id` - Delete receipt

**Supplier Invoices:**
- `GET /supplier-invoices` - List all (with filters)
- `GET /supplier-invoices/:id` - Get single invoice
- `POST /supplier-invoices` - Create invoice
- `PATCH /supplier-invoices/:id` - Update invoice
- `DELETE /supplier-invoices/:id` - Delete invoice

---

## Frontend Implementation

### Updated SupplierAccountingPage

The page will be restructured to include 5 tabs:

1. **Situation** (existing) - Supplier balances
2. **Historique** (existing) - Transaction history
3. **Commandes** (new) - Bulk orders to suppliers
4. **Reçus** (new) - Items received from suppliers
5. **Factures** (new) - Supplier invoices

### New Components

| Component | Description |
|-----------|-------------|
| `SupplierOrdersTab.tsx` | Orders list with filters, create/edit dialog |
| `SupplierReceiptsTab.tsx` | Receipts list with filters, create dialog |
| `SupplierInvoicesTab.tsx` | Invoices list with filters, payment tracking |

### New Hooks

| Hook | Purpose |
|------|---------|
| `useSupplierOrders.ts` | CRUD operations for orders |
| `useSupplierReceipts.ts` | CRUD operations for receipts |
| `useSupplierInvoices.ts` | CRUD operations for invoices |

---

## UI Mockups

### Commandes Tab
```text
+----------------------------------------------------------+
| [+ Nouvelle Commande]                                    |
+----------------------------------------------------------+
| En Attente     | Livrées        | Valeur Totale          |
| 3 commandes    | 12 commandes   | 1,250,000 DZD          |
+----------------------------------------------------------+
| [Search...] [Filtres]                                    |
+----------------------------------------------------------+
| N° Commande | Fournisseur | Description      | Statut   |
| SO-20260201 | Turkish Air | 10 billets IST   | En att.  |
| SO-20260128 | VFS Global  | 5 RDV visa       | Livré    |
+----------------------------------------------------------+
```

### Reçus Tab
```text
+----------------------------------------------------------+
| [+ Nouveau Reçu]                                         |
+----------------------------------------------------------+
| Total Reçus    | Ce Mois         | Valeur Totale         |
| 45 reçus       | 8 reçus         | 3,200,000 DZD         |
+----------------------------------------------------------+
| [Search...] [Filtres]                                    |
+----------------------------------------------------------+
| N° Reçu     | Fournisseur | Description      | Montant  |
| REC-20260201| Turkish Air | 5 billets IST    | 160,000  |
+----------------------------------------------------------+
```

### Factures Tab
```text
+----------------------------------------------------------+
| [+ Nouvelle Facture]                                     |
+----------------------------------------------------------+
| Non Payées     | En Retard       | Total Dû              |
| 5 factures     | 2 factures      | 450,000 DZD           |
+----------------------------------------------------------+
| [Search...] [Filtres]                                    |
+----------------------------------------------------------+
| N° Facture  | Fournisseur | Montant  | Échéance | Statut |
| INV-001     | VFS Global  | 150,000  | 15/02    | Non payé|
+----------------------------------------------------------+
```

---

## Workflow Examples

### Order → Receipt Flow
1. Create order: "10 billets Turkish Airlines @ 32,000 DZD"
2. Order status: `en_attente`
3. When 5 tickets received, create receipt linked to order
4. Order auto-updates: status = `partiel`, deliveredQuantity = 5
5. Remaining 5 received → create receipt → status = `livre`

### Invoice Payment Flow
1. Receive invoice from supplier
2. Create invoice entry with amount and due date
3. Partial payment → update paidAmount
4. Status auto-updates: `non_paye` → `partiel` → `paye`

---

## Files Summary

| File | Action |
|------|--------|
| **Backend - Orders** | |
| `server/src/supplier-orders/entities/supplier-order.entity.ts` | Create |
| `server/src/supplier-orders/dto/create-supplier-order.dto.ts` | Create |
| `server/src/supplier-orders/dto/update-supplier-order.dto.ts` | Create |
| `server/src/supplier-orders/supplier-orders.service.ts` | Create |
| `server/src/supplier-orders/supplier-orders.controller.ts` | Create |
| `server/src/supplier-orders/supplier-orders.module.ts` | Create |
| **Backend - Receipts** | |
| `server/src/supplier-receipts/entities/supplier-receipt.entity.ts` | Create |
| `server/src/supplier-receipts/dto/create-supplier-receipt.dto.ts` | Create |
| `server/src/supplier-receipts/supplier-receipts.service.ts` | Create |
| `server/src/supplier-receipts/supplier-receipts.controller.ts` | Create |
| `server/src/supplier-receipts/supplier-receipts.module.ts` | Create |
| **Backend - Invoices** | |
| `server/src/supplier-invoices/entities/supplier-invoice.entity.ts` | Create |
| `server/src/supplier-invoices/dto/create-supplier-invoice.dto.ts` | Create |
| `server/src/supplier-invoices/dto/update-supplier-invoice.dto.ts` | Create |
| `server/src/supplier-invoices/supplier-invoices.service.ts` | Create |
| `server/src/supplier-invoices/supplier-invoices.controller.ts` | Create |
| `server/src/supplier-invoices/supplier-invoices.module.ts` | Create |
| `server/src/app.module.ts` | Modify (add 3 modules) |
| **Frontend** | |
| `src/types/index.ts` | Modify (add new types) |
| `src/lib/api.ts` | Modify (add new API methods) |
| `src/hooks/useSupplierOrders.ts` | Create |
| `src/hooks/useSupplierReceipts.ts` | Create |
| `src/hooks/useSupplierInvoices.ts` | Create |
| `src/components/suppliers/SupplierOrdersTab.tsx` | Create |
| `src/components/suppliers/SupplierReceiptsTab.tsx` | Create |
| `src/components/suppliers/SupplierInvoicesTab.tsx` | Create |
| `src/pages/SupplierAccountingPage.tsx` | Modify (add 3 tabs) |

---

## After Implementation

On your VPS, run:
```bash
cd server && npm run build
pm2 restart all
```

The new database tables will be created automatically via TypeORM synchronize.
