

# Plan: Employee Accounting Module (Comptabilite Employes)

## Overview

This plan adds a new module for tracking financial transactions between the admin and employees, including:
- **Avances (Salary Advances)**: Money given to employees before payday
- **Credits (Debts)**: Money owed by employees  
- **Salaires (Salaries)**: Monthly salary payments

Only admins can add transactions. Both admins and employees can view the data.

## Database Design

A new `employee_transactions` table will store all financial interactions:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `employeeId` | UUID | References user being paid/credited |
| `type` | ENUM | `avance`, `credit`, `salaire` |
| `amount` | DECIMAL(10,2) | Transaction amount |
| `date` | DATE | Transaction date |
| `month` | VARCHAR | For salaries: "2026-01" format |
| `note` | TEXT | Optional description |
| `recordedBy` | UUID | Admin who recorded this |
| `createdAt` | TIMESTAMP | Auto-generated |

## Technical Implementation

### Backend (NestJS)

**New Module: `server/src/employee-transactions/`**

| File | Purpose |
|------|---------|
| `entities/employee-transaction.entity.ts` | TypeORM entity with enum for transaction types |
| `dto/create-employee-transaction.dto.ts` | Validation DTO for creating transactions |
| `employee-transactions.service.ts` | Business logic: CRUD + balance calculations |
| `employee-transactions.controller.ts` | REST endpoints with admin-only guards on mutations |
| `employee-transactions.module.ts` | Module definition |

**API Endpoints:**
- `GET /employee-transactions` - List all transactions (admin only)
- `GET /employee-transactions/employee/:id` - Get transactions for specific employee
- `GET /employee-transactions/employee/:id/balance` - Get employee's current balance
- `POST /employee-transactions` - Create transaction (admin only)
- `DELETE /employee-transactions/:id` - Delete transaction (admin only)

### Frontend (React)

**New Page: `src/pages/EmployeeAccountingPage.tsx`**

Features:
- Summary cards showing total advances, credits, and salaries paid
- Tabs: "Situation Employes" (balances per employee) and "Historique" (all transactions)
- Dialog form to add new transactions (admin only)
- Employee detail dialog showing their transaction history
- Balance calculation: `Total Avances + Total Credits - Total Salaires`

**New Hook: `src/hooks/useEmployeeTransactions.ts`**

React Query hooks for:
- `useEmployeeTransactions()` - Fetch all transactions
- `useEmployeeTransactionsByEmployee(id)` - Fetch by employee
- `useCreateEmployeeTransaction()` - Create mutation
- `useDeleteEmployeeTransaction()` - Delete mutation

**API Updates: `src/lib/api.ts`**

New types and methods for employee transactions API calls.

**Type Updates: `src/types/index.ts`**

New types for employee transactions.

**Navigation Updates:**
- `src/components/layout/AppSidebar.tsx` - Add menu item under "Gestion"
- `src/App.tsx` - Add route `/comptabilite-employes`

**New Skeleton: `src/components/skeletons/EmployeeAccountingSkeleton.tsx`**

Loading state component matching the page structure.

## File Changes Summary

| File | Action |
|------|--------|
| `server/src/employee-transactions/entities/employee-transaction.entity.ts` | Create |
| `server/src/employee-transactions/dto/create-employee-transaction.dto.ts` | Create |
| `server/src/employee-transactions/employee-transactions.service.ts` | Create |
| `server/src/employee-transactions/employee-transactions.controller.ts` | Create |
| `server/src/employee-transactions/employee-transactions.module.ts` | Create |
| `server/src/app.module.ts` | Modify (add module import) |
| `src/types/index.ts` | Modify (add types) |
| `src/lib/api.ts` | Modify (add API methods) |
| `src/hooks/useEmployeeTransactions.ts` | Create |
| `src/pages/EmployeeAccountingPage.tsx` | Create |
| `src/components/skeletons/EmployeeAccountingSkeleton.tsx` | Create |
| `src/components/layout/AppSidebar.tsx` | Modify (add menu item) |
| `src/App.tsx` | Modify (add route) |

## Security

- Backend: `@Roles('admin')` decorator on POST and DELETE endpoints
- Frontend: Conditionally render "Add Transaction" button based on `isAdmin`
- All GET endpoints accessible to authenticated users (employees can see their own data)

## User Interface Preview

The page will have:
1. Header with title and "Nouvelle Transaction" button (admin only)
2. Three summary cards: Total Avances, Total Credits, Total Salaires
3. Tabbed interface:
   - **Situation Employes**: Table with employee name, total avances, total credits, total salaires, balance
   - **Historique**: Chronological list of all transactions with filters

## After Implementation

On your VPS, you'll need to:
1. Pull the latest code
2. Run `cd server && npm run build`
3. Restart the NestJS server (e.g., `pm2 restart all`)
4. The database table will be created automatically via TypeORM synchronize

