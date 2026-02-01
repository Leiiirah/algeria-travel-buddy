
# Plan: Expenses Module (Dépenses)

## Overview

This plan adds a new **Expenses** module for tracking company purchases and expenses. This feature will be **admin-only** - only administrators can view, add, and delete expenses.

Examples of expenses:
- Office supplies (fournitures de bureau)
- Equipment purchases (matériel)
- Utilities (factures - électricité, internet)
- Travel expenses (frais de déplacement)
- Maintenance costs (entretien)
- Other operational costs

## Database Design

A new `expenses` table will store all company expenses:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category` | ENUM | Type of expense (see categories below) |
| `description` | VARCHAR | Description of the expense |
| `amount` | DECIMAL(10,2) | Expense amount in DZD |
| `date` | DATE | Date of the expense |
| `paymentMethod` | ENUM | How the expense was paid |
| `vendor` | VARCHAR | Supplier/vendor name (optional) |
| `receiptUrl` | VARCHAR | Path to receipt file (optional) |
| `note` | TEXT | Additional notes (optional) |
| `recordedBy` | UUID | Admin who recorded this |
| `createdAt` | TIMESTAMP | Auto-generated |

**Expense Categories:**
- `fournitures` - Office supplies
- `equipement` - Equipment
- `factures` - Bills (utilities)
- `transport` - Transportation
- `maintenance` - Maintenance
- `marketing` - Marketing/Advertising
- `autre` - Other

**Payment Methods:**
- `especes` - Cash
- `virement` - Bank transfer
- `cheque` - Check
- `carte` - Card

## Technical Implementation

### Backend (NestJS)

**New Module: `server/src/expenses/`**

| File | Purpose |
|------|---------|
| `entities/expense.entity.ts` | TypeORM entity with enums for category and payment method |
| `dto/create-expense.dto.ts` | Validation DTO for creating expenses |
| `dto/update-expense.dto.ts` | Validation DTO for updating expenses |
| `expenses.service.ts` | Business logic: CRUD operations + statistics |
| `expenses.controller.ts` | REST endpoints with admin-only guards |
| `expenses.module.ts` | Module definition |

**API Endpoints (all admin-only):**
- `GET /expenses` - List all expenses (with optional filters)
- `GET /expenses/stats` - Get expense statistics
- `GET /expenses/:id` - Get single expense
- `POST /expenses` - Create expense
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Frontend (React)

**New Page: `src/pages/ExpensesPage.tsx`**

Features:
- Header with title and "Nouvelle Dépense" button
- Summary cards showing:
  - Total expenses (this month)
  - Total expenses (this year)
  - Breakdown by category (top 3)
- Tabs:
  - **Liste** - Table of all expenses with filters
  - **Statistiques** - Charts showing expense breakdown
- Dialog form to add/edit expenses
- Filters: search, category, payment method, date range

**New Hook: `src/hooks/useExpenses.ts`**

React Query hooks for:
- `useExpenses(filters)` - Fetch all expenses
- `useExpenseStats()` - Fetch expense statistics
- `useCreateExpense()` - Create mutation
- `useUpdateExpense()` - Update mutation
- `useDeleteExpense()` - Delete mutation

**New Skeleton: `src/components/skeletons/ExpensesSkeleton.tsx`**

Loading state component matching the page structure.

**API Updates: `src/lib/api.ts`**

New types and methods for expense API calls.

**Type Updates: `src/types/index.ts`**

New types for expenses:
```typescript
export type ExpenseCategory = 'fournitures' | 'equipement' | 'factures' | 'transport' | 'maintenance' | 'marketing' | 'autre';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  note?: string;
  recordedBy: string;
  recorder?: User;
  createdAt: Date;
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  fournitures: 'Fournitures',
  equipement: 'Équipement',
  factures: 'Factures',
  transport: 'Transport',
  maintenance: 'Maintenance',
  marketing: 'Marketing',
  autre: 'Autre',
};
```

**Navigation Updates:**
- `src/components/layout/AppSidebar.tsx` - Add "Dépenses" menu item under Administration (admin-only section)
- `src/App.tsx` - Add route `/depenses` with `adminOnly` protection

## File Changes Summary

| File | Action |
|------|--------|
| `server/src/expenses/entities/expense.entity.ts` | Create |
| `server/src/expenses/dto/create-expense.dto.ts` | Create |
| `server/src/expenses/dto/update-expense.dto.ts` | Create |
| `server/src/expenses/expenses.service.ts` | Create |
| `server/src/expenses/expenses.controller.ts` | Create |
| `server/src/expenses/expenses.module.ts` | Create |
| `server/src/app.module.ts` | Modify (add ExpensesModule import) |
| `src/types/index.ts` | Modify (add expense types) |
| `src/lib/api.ts` | Modify (add expense API methods) |
| `src/hooks/useExpenses.ts` | Create |
| `src/pages/ExpensesPage.tsx` | Create |
| `src/components/skeletons/ExpensesSkeleton.tsx` | Create |
| `src/components/layout/AppSidebar.tsx` | Modify (add menu item) |
| `src/App.tsx` | Modify (add route) |

## Security

- **Backend**: All endpoints protected with `@Roles('admin')` decorator
- **Frontend**: Route protected with `<ProtectedRoute adminOnly>`
- **Sidebar**: Menu item only shown in the "Administration" section (already admin-only)

## User Interface Preview

```text
+----------------------------------------------------------+
| Dépenses                          [+ Nouvelle Dépense]   |
+----------------------------------------------------------+
| Ce Mois        | Cette Année      | Top Catégorie        |
| 45,000 DZD     | 520,000 DZD      | Fournitures: 35%     |
+----------------------------------------------------------+
| [Liste] [Statistiques]                                   |
+----------------------------------------------------------+
| [Search...] [Filtres]                                    |
+----------------------------------------------------------+
| Date       | Catégorie    | Description | Montant | ...  |
| 01/02/2026 | Fournitures  | Papier A4   | 5,000   | ...  |
| 28/01/2026 | Factures     | Électricité | 12,000  | ...  |
+----------------------------------------------------------+
```

## After Implementation

On your VPS, you'll need to:
1. Pull the latest code
2. Run `cd server && npm run build`
3. Restart the NestJS server (e.g., `pm2 restart all`)
4. The database table will be created automatically via TypeORM synchronize
