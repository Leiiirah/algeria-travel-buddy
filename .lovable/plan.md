

# Plan: Add Employee Command History to Historique Tab

## Problem

Currently, the "Historique" (History) tab in the Employee Accounting page only shows manual transactions (advances, credits, salaries) entered by the admin. The employee cannot see the details of the commands they created - their actual sales activity.

The employee wants to see:
- A list of all commands they created
- Client information, service type, amounts (selling price, amount paid, profit)
- Payment status for each command

## Solution

Enhance the "Historique" tab with a new sub-section showing the employee's **Command History** - a detailed table of all commands they've created with financial details.

For **non-admin users**, the Historique tab will show:
1. **My Commands** section - Table with all their commands and financial details
2. **My Transactions** section - Existing table of advances/credits/salaries (read-only)

For **admin users**, behavior remains unchanged.

---

## Current vs Proposed Layout

| Tab | Current (Employee) | Proposed (Employee) |
|-----|-------------------|---------------------|
| Historique | Transactions only (avances, crédits, salaires) | **My Commands** (with client, service, prices, profit) + Transactions |

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/commands/commands.service.ts` | Add method to get employee commands with full details |
| `src/lib/api.ts` | Add `getMyCommands()` API function |
| `src/hooks/useCommands.ts` | Add `useMyCommands()` hook |
| `src/pages/EmployeeAccountingPage.tsx` | Add "My Commands" table in Historique tab for employees |
| `src/i18n/locales/fr/employees.json` | Add translation keys for command history |
| `src/i18n/locales/ar/employees.json` | Add Arabic translations |

---

## Implementation Details

### 1. Backend - Use Existing Commands Endpoint

The `/commands` endpoint already filters by `createdBy` for non-admin users (line 23-30 in commands.controller.ts). We can use the existing API - no backend changes needed!

### 2. Frontend - API and Hook

We can reuse the existing `useCommands()` hook since it already returns only the employee's commands for non-admin users.

### 3. Update EmployeeAccountingPage

Add a new section in the "Historique" tab showing commands with the following columns:

| Column | Description |
|--------|-------------|
| Date | Command creation date |
| Client | Client name (from command data) |
| Service | Service type |
| Selling Price | Total amount charged to client |
| Amount Paid | How much client has paid |
| Remaining | Unpaid balance |
| Profit | Selling price - buying price |
| Status | Command status |

---

## Visual Layout for Employees

```text
┌──────────────────────────────────────────────────────────────────┐
│ Tabs: [Situation Employés] [Historique]                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Historique Tab Content:                                          │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ MES COMMANDES                                               │   │
│ ├────────────────────────────────────────────────────────────┤   │
│ │ Date       │ Client  │ Service │ Prix │ Payé │ Reste │Gain │   │
│ ├────────────────────────────────────────────────────────────┤   │
│ │ 15 Jan     │ Ahmed   │ Visa    │ 50k  │ 30k  │ 20k   │ 10k │   │
│ │ 12 Jan     │ Sara    │ Ticket  │ 80k  │ 80k  │ 0     │ 15k │   │
│ │ ...        │ ...     │ ...     │ ...  │ ...  │ ...   │ ... │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ MES TRANSACTIONS (Avances, Crédits, Salaires)               │   │
│ ├────────────────────────────────────────────────────────────┤   │
│ │ Date       │ Type    │ Montant │ Note                      │   │
│ ├────────────────────────────────────────────────────────────┤   │
│ │ 10 Jan     │ Avance  │ 5,000   │ Avance sur salaire        │   │
│ │ ...        │ ...     │ ...     │ ...                       │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Translation Keys to Add

**French (employees.json)**:
```json
{
  "accounting": {
    "commandHistory": {
      "title": "Mes Commandes",
      "client": "Client",
      "service": "Service",
      "sellingPrice": "Prix de Vente",
      "amountPaid": "Montant Payé",
      "remaining": "Reste à Payer",
      "profit": "Bénéfice",
      "status": "Statut"
    },
    "transactionHistory": {
      "title": "Mes Transactions"
    }
  }
}
```

**Arabic (employees.json)**:
```json
{
  "accounting": {
    "commandHistory": {
      "title": "طلباتي",
      "client": "العميل",
      "service": "الخدمة",
      "sellingPrice": "سعر البيع",
      "amountPaid": "المبلغ المدفوع",
      "remaining": "المتبقي",
      "profit": "الربح",
      "status": "الحالة"
    },
    "transactionHistory": {
      "title": "معاملاتي"
    }
  }
}
```

---

## Command Status Mapping

| Backend Status | French Display |
|---------------|----------------|
| dossier_incomplet | Dossier Incomplet |
| depose | Déposé |
| en_traitement | En Traitement |
| accepte | Accepté |
| refuse | Refusé |
| visa_delivre | Visa Délivré |
| retire | Retiré |

---

## Access Control

| Content | Admin | Employee |
|---------|-------|----------|
| All employee balances | Yes | Only own |
| All transactions history | Yes | Only own |
| **Command history** | All commands | **Only own commands** |

The commands API already enforces this restriction (line 27-29 in commands.controller.ts).

---

## Technical Notes

1. Reuse existing `useCommands()` hook - no new API endpoint needed
2. Extract client name from `command.data.nomPrenom` or `command.data.clientName` 
3. Calculate remaining = sellingPrice - amountPaid
4. Calculate profit = sellingPrice - buyingPrice
5. Show appropriate status badge colors

---

## Summary

| Category | Count |
|----------|-------|
| Backend files | 0 (reusing existing endpoint) |
| Frontend files | 3 |
| Translation files | 2 |
| **Total** | 5 files |

This implementation allows employees to see:
- All commands they created with full financial details
- Their profit on each command
- Outstanding payments from clients
- Existing salary/advance/credit transactions

