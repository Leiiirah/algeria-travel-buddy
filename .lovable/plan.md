
# Plan: Add Employee Command Statistics to Personal Accounting

## Problem

When an employee creates a command, their personal accounting page (`/comptabilite-employes`) doesn't reflect this. Currently, this page only shows manually-entered transactions (advances, credits, salaries) by the admin.

Employees expect to see statistics about the commands they've created - their personal performance metrics.

---

## Solution

Enhance the employee's personal accounting view to include a **"My Performance"** section that displays statistics from their own commands:

- Total revenue (from their commands)
- Total profit (selling price - buying price)
- Pending amounts (unpaid balances from clients)
- Number of commands by status

---

## Current vs Proposed View

| Section | Current (Employee View) | Proposed (Employee View) |
|---------|------------------------|--------------------------|
| My Performance | Not shown | NEW: Revenue, Profit, Pending, Command Stats |
| Transactions | Advances, Credits, Salaries | Unchanged |
| Balance | Salary balance only | Unchanged |

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/analytics/analytics.service.ts` | Add new method `getEmployeeCommandStats(userId)` |
| `server/src/analytics/analytics.controller.ts` | Add new endpoint `GET /analytics/employee-stats` |
| `src/lib/api.ts` | Add `getEmployeeStats()` API function |
| `src/hooks/useAnalytics.ts` | Add `useEmployeeStats()` hook |
| `src/pages/EmployeeAccountingPage.tsx` | Add "My Performance" cards for employees |
| `src/i18n/locales/fr/employees.json` | Add translation keys for new stats |
| `src/i18n/locales/ar/employees.json` | Add Arabic translations |

---

## Implementation Details

### 1. Backend - Add Employee Stats Endpoint

**analytics.service.ts** - New method:
```typescript
async getEmployeeCommandStats(userId: string) {
  const commands = await this.commandsRepo.find({
    where: { createdBy: userId },
    relations: ['service'],
  });

  const totalRevenue = commands.reduce(
    (sum, c) => sum + Number(c.sellingPrice || 0), 0
  );
  const totalProfit = commands.reduce(
    (sum, c) => sum + (Number(c.sellingPrice || 0) - Number(c.buyingPrice || 0)), 0
  );
  const pendingAmount = commands.reduce(
    (sum, c) => sum + Math.max(0, Number(c.sellingPrice || 0) - Number(c.amountPaid || 0)), 0
  );

  return {
    totalCommands: commands.length,
    totalRevenue,
    totalProfit,
    pendingAmount,
    byStatus: {
      en_attente: commands.filter(c => c.status === 'dossier_incomplet').length,
      en_cours: commands.filter(c => c.status === 'en_traitement').length,
      termine: commands.filter(c => c.status === 'retire').length,
    },
  };
}
```

**analytics.controller.ts** - New endpoint:
```typescript
@Get('employee-stats')
getEmployeeStats(@Request() req: any) {
  return this.analyticsService.getEmployeeCommandStats(req.user.id);
}
```

### 2. Frontend - API and Hook

**api.ts**:
```typescript
async getEmployeeStats() {
  const response = await this.client.get('/analytics/employee-stats');
  return response.data;
}
```

**useAnalytics.ts**:
```typescript
export function useEmployeeStats() {
  return useQuery({
    queryKey: ['employee-stats'],
    queryFn: () => api.getEmployeeStats(),
  });
}
```

### 3. Frontend - Update Employee Accounting Page

For employees (non-admin), add a new section at the top with 4 cards:

| Card | Description |
|------|-------------|
| Mes Commandes | Total number of commands created |
| Mon Chiffre d'Affaires | Total revenue from their commands |
| Mon Bénéfice | Total profit (selling - buying price) |
| Impayés Clients | Total pending amounts from clients |

The existing transactions section (advances/credits/salaries) will remain below.

---

## Visual Layout for Employees

```text
┌──────────────────────────────────────────────────────────┐
│  Ma Comptabilité Personnelle                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │ Mes         │ │ Mon CA      │ │ Mon         │ │ Impayés     │
│  │ Commandes   │ │ 250,000 DZD │ │ Bénéfice    │ │ 45,000 DZD  │
│  │ 15          │ │             │ │ 75,000 DZD  │ │             │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  Mes Transactions (Avances, Crédits, Salaires)           │
│  ... existing table ...                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Translation Keys

**French (employees.json)**:
```json
{
  "accounting": {
    "myPerformance": {
      "title": "Ma Performance",
      "myCommands": "Mes Commandes",
      "myRevenue": "Mon Chiffre d'Affaires",
      "myProfit": "Mon Bénéfice",
      "clientPending": "Impayés Clients"
    }
  }
}
```

**Arabic (employees.json)**:
```json
{
  "accounting": {
    "myPerformance": {
      "title": "أدائي",
      "myCommands": "طلباتي",
      "myRevenue": "إيراداتي",
      "myProfit": "أرباحي",
      "clientPending": "مستحقات العملاء"
    }
  }
}
```

---

## Access Control

| Endpoint | Admin | Employee |
|----------|-------|----------|
| `GET /analytics/employee-stats` | Returns own stats | Returns own stats |

The endpoint always returns stats for the currently authenticated user based on their ID from the JWT token.

---

## Summary

| Category | Count |
|----------|-------|
| Backend files | 2 |
| Frontend files | 4 |
| Translation files | 2 |
| **Total** | 8 files |

This implementation ensures that when an employee creates a command, they will immediately see updated statistics in their personal accounting page, reflecting their contribution to the company.
