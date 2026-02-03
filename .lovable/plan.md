

# Plan: Admin View for Employee Activity (Commands & Sales)

## Overview

Add functionality for admins to view detailed activity for any employee, including:
- All commands/sales they created
- Performance summary (revenue, profit, pending amounts)
- Full transaction history

This mirrors the "My Commands" section that employees see for themselves, but allows admins to view any employee's data.

---

## Current State Analysis

| Feature | Employee View | Admin View |
|---------|---------------|------------|
| Performance Stats | Yes (My Performance) | No |
| Commands History | Yes (My Commands table) | No |
| Transactions (avance/credit/salaire) | Yes (via detail dialog) | Yes (via detail dialog) |

---

## Solution

Enhance the existing employee detail dialog to include:
1. **Performance Summary Cards** - Commands count, revenue, profit, pending
2. **Tabs for viewing data**:
   - **Sales Tab** - All commands created by the employee (like "My Commands")
   - **Transactions Tab** - Existing transactions view (advances, credits, salaries)

---

## Backend Changes

### 1. New Endpoint: Get Commands by Employee ID (Admin Only)

**File**: `server/src/commands/commands.controller.ts`

Add a new endpoint that returns all commands created by a specific employee:

```typescript
@Get('by-employee/:employeeId')
@Roles('admin')
findByEmployee(@Param('employeeId') employeeId: string) {
  return this.commandsService.findAll({ createdBy: employeeId, limit: 1000 });
}
```

### 2. New Endpoint: Get Employee Performance Stats (Admin Only)

**File**: `server/src/analytics/analytics.controller.ts`

Add endpoint to get specific employee stats:

```typescript
@Get('employee-stats/:id')
@Roles('admin')
getEmployeeStatsById(@Param('id') id: string) {
  return this.analyticsService.getEmployeeCommandStats(id);
}
```

---

## Frontend Changes

### 1. API Client Updates

**File**: `src/lib/api.ts`

Add new methods:
```typescript
// Get commands by specific employee (admin only)
getCommandsByEmployee = (employeeId: string): Promise<PaginatedResponse<Command>> =>
  this.request(`/commands/by-employee/${employeeId}`);

// Get specific employee stats (admin only)
getEmployeeStatsById = (employeeId: string): Promise<EmployeeStats> =>
  this.request(`/analytics/employee-stats/${employeeId}`);
```

### 2. New Hooks

**File**: `src/hooks/useEmployeeTransactions.ts`

Add new hooks:
```typescript
export function useEmployeeCommands(employeeId: string) {
  return useQuery({
    queryKey: ['employee-commands', employeeId],
    queryFn: () => api.getCommandsByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useEmployeeStatsById(employeeId: string) {
  return useQuery({
    queryKey: ['employee-stats', employeeId],
    queryFn: () => api.getEmployeeStatsById(employeeId),
    enabled: !!employeeId,
  });
}
```

### 3. Enhanced Employee Detail Dialog

**File**: `src/pages/EmployeeAccountingPage.tsx`

Transform the existing employee detail dialog into a comprehensive activity view:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sarah Meziane                                                          [X] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Commandes   │  │ CA Total    │  │ Bénéfice    │  │ Impayés     │        │
│  │    45       │  │ 850,000 DZD │  │ 125,000 DZD │  │  45,000 DZD │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  [Ventes]        [Transactions]                                      │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                      │  │
│  │  Date        Client           Service   Prix     Payé     Reste     │  │
│  │  ─────────────────────────────────────────────────────────────────  │  │
│  │  15 Jan      Ahmed Mansouri   Visa FR   85,000   25,000   60,000   │  │
│  │  14 Jan      Fatima Khelifi   Ticket    45,000   45,000        0   │  │
│  │  13 Jan      Mohamed Ali      Visa ES   75,000   30,000   45,000   │  │
│  │  ...                                                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Add performance summary cards at the top
- Add tabs: "Ventes" (Sales/Commands) and "Transactions" (existing functionality)
- Sales tab shows commands table similar to "My Commands" but for selected employee
- Keep existing transactions view in second tab

### 4. Translation Updates

**Files**: `src/i18n/locales/fr/employees.json`, `src/i18n/locales/ar/employees.json`

Add new translation keys:
```json
{
  "accounting": {
    "employeeDetails": {
      "title": "Activité de l'employé",
      "tabs": {
        "sales": "Ventes",
        "transactions": "Transactions"
      },
      "stats": {
        "commands": "Commandes",
        "revenue": "Chiffre d'Affaires",
        "profit": "Bénéfice",
        "pending": "Impayés Clients"
      },
      "noSales": "Aucune vente enregistrée"
    }
  }
}
```

---

## Implementation Details

### Dialog State Management

```typescript
// New state for employee details dialog
const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<'sales' | 'transactions'>('sales');

// Fetch data when employee is selected
const { data: employeeCommands, isLoading: loadingCommands } = useEmployeeCommands(selectedEmployeeId || '');
const { data: employeeStats, isLoading: loadingStats } = useEmployeeStatsById(selectedEmployeeId || '');
```

### Commands Table Component

Reuse the same table structure from "My Commands" section:
- Date, Client, Service, Selling Price, Amount Paid, Remaining, Profit, Status
- Proper formatting with locale-aware numbers
- Status badges

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/commands/commands.controller.ts` | Add `@Get('by-employee/:employeeId')` endpoint |
| `server/src/analytics/analytics.controller.ts` | Add `@Get('employee-stats/:id')` endpoint |
| `src/lib/api.ts` | Add `getCommandsByEmployee` and `getEmployeeStatsById` methods |
| `src/hooks/useEmployeeTransactions.ts` | Add `useEmployeeCommands` and `useEmployeeStatsById` hooks |
| `src/pages/EmployeeAccountingPage.tsx` | Enhance employee detail dialog with tabs, stats, and sales table |
| `src/i18n/locales/fr/employees.json` | Add new translation keys |
| `src/i18n/locales/ar/employees.json` | Add Arabic translations |

---

## Summary

| Category | Count |
|----------|-------|
| Backend endpoints | 2 new |
| API methods | 2 new |
| React hooks | 2 new |
| Pages modified | 1 |
| Translation files | 2 |
| **Total** | 7 files |

This enhancement gives admins complete visibility into employee sales activity, matching the self-service view employees have while maintaining proper role-based access control.

