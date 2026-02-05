

# Financial Management View: Employee Cash Register (Caisse par employé)

## Overview

This feature adds a new "Caisse par employé" (Employee Cash Register) tab within the existing Accounting Page that provides administrators with a detailed breakdown of revenue, unpaid balances, and profits categorized by assigned employee.

## Data Sources

The feature will aggregate financial data from three sources where `assignedTo` is set:
1. **Commands** (`commands` table) - Visa commands with `assignedTo` field
2. **Omra Orders** (`omra_orders` table) - with `assignedTo` field
3. **Omra Visas** (`omra_visas` table) - with `assignedTo` field

## Architecture

```text
+---------------------+     +------------------------+     +------------------+
| AccountingPage.tsx  | --> | useEmployeeCaisseStats | --> | API: /analytics/ |
| (New Tab: Caisses)  |     | (New Hook)             |     | employee-caisses |
+---------------------+     +------------------------+     +------------------+
                                                                   |
                                                                   v
                                                        +------------------+
                                                        | AnalyticsService |
                                                        | (Backend)        |
                                                        +------------------+
```

## Implementation Details

### 1. Backend: New Analytics Endpoint

**File:** `server/src/analytics/analytics.service.ts`

Add a new method `getEmployeeCaisseStats()` that:
- Injects the `OmraOrder` and `OmraVisa` repositories (requires updating the module)
- Fetches all active employees
- For each employee, aggregates:
  - **Caisse (Amount Paid)**: Sum of `amountPaid` from assigned commands + omra_orders + omra_visas
  - **Impayés (Unpaid)**: Sum of (`sellingPrice` - `amountPaid`) from assigned items
  - **Bénéfices (Profit)**: Sum of (`sellingPrice` - `buyingPrice`) from assigned items
- Returns global totals and per-employee breakdown

**File:** `server/src/analytics/analytics.module.ts`

Update to import `OmraOrder` and `OmraVisa` entities.

**File:** `server/src/analytics/analytics.controller.ts`

Add new endpoint: `GET /analytics/employee-caisses`

### 2. Frontend: API and Hook

**File:** `src/lib/api.ts`

Add new API method:
```typescript
getEmployeeCaisseStats = (): Promise<EmployeeCaisseStats> =>
  this.request('/analytics/employee-caisses');
```

**File:** `src/hooks/useAnalytics.ts`

Add new hook:
```typescript
export const useEmployeeCaisseStats = () => {
  return useQuery({
    queryKey: ['analytics', 'employee-caisses'],
    queryFn: () => api.getEmployeeCaisseStats(),
  });
};
```

### 3. Type Definitions

**File:** `src/lib/api.ts` (or `src/types/index.ts`)

```typescript
export interface EmployeeCaisse {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalCaisse: number;      // Total amount paid (collected)
  totalImpayes: number;     // Total unpaid balance
  totalBenefices: number;   // Total profit
  commandCount: number;     // Number of assigned commands
}

export interface EmployeeCaisseStats {
  employees: EmployeeCaisse[];
  global: {
    totalCaisse: number;
    totalImpayes: number;
    totalBenefices: number;
    totalCommands: number;
  };
}
```

### 4. UI: New Tab in AccountingPage

**File:** `src/pages/AccountingPage.tsx`

Add a fourth tab "Caisses" to the existing Tabs component:
```typescript
<TabsTrigger value="caisses">{t('tabs.caisses')}</TabsTrigger>
```

Add new TabsContent:
```typescript
<TabsContent value="caisses" className="mt-4">
  <EmployeeCaisseTable />
</TabsContent>
```

### 5. UI Component: EmployeeCaisseTable

**File:** `src/components/accounting/EmployeeCaisseTable.tsx` (new file)

A clean table component with:
- **Header Row**: Employee | Caisse | Impayés | Bénéfices
- **Employee Rows**: One row per active employee with color-coded badges
- **Global Summary Row**: Highlighted row at the bottom with totals
- Color coding:
  - Caisse (paid): Green text
  - Impayés (unpaid): Red/Warning text
  - Bénéfices (profit): Blue/Info text
- Employee avatar with initials + full name

### 6. Translations

**File:** `src/i18n/locales/fr/accounting.json`

Add:
```json
{
  "tabs": {
    "caisses": "Caisses"
  },
  "caisses": {
    "title": "Caisse par employé",
    "subtitle": "Répartition financière par employé assigné",
    "table": {
      "employee": "Employé",
      "caisse": "Caisse",
      "impayes": "Impayés",
      "benefices": "Bénéfices",
      "commands": "Dossiers"
    },
    "global": {
      "title": "Total Agence",
      "description": "Somme de toutes les caisses employés"
    },
    "empty": {
      "title": "Aucune donnée",
      "description": "Aucune commande assignée aux employés"
    }
  }
}
```

**File:** `src/i18n/locales/ar/accounting.json`

Add Arabic translations:
```json
{
  "tabs": {
    "caisses": "الصناديق"
  },
  "caisses": {
    "title": "صندوق كل موظف",
    "subtitle": "التوزيع المالي حسب الموظف المعين",
    "table": {
      "employee": "الموظف",
      "caisse": "الصندوق",
      "impayes": "غير المدفوع",
      "benefices": "الأرباح",
      "commands": "الملفات"
    },
    "global": {
      "title": "إجمالي الوكالة",
      "description": "مجموع صناديق جميع الموظفين"
    },
    "empty": {
      "title": "لا توجد بيانات",
      "description": "لا توجد طلبات معينة للموظفين"
    }
  }
}
```

## Technical Details

| Aspect | Details |
|--------|---------|
| Files Created | 1 (EmployeeCaisseTable.tsx) |
| Files Modified | 6 (analytics.service.ts, analytics.module.ts, analytics.controller.ts, api.ts, useAnalytics.ts, AccountingPage.tsx) + 2 translation files |
| API Endpoints | 1 new: GET /analytics/employee-caisses |
| Admin Only | Yes - tab only visible/accessible to admins |
| RTL Support | Yes - follows existing patterns |

## Visual Design

The table will use existing Shadcn/UI components with:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` components
- Employee avatar using the same pattern as sidebar (initials in colored circle)
- `Badge` components for employee names with subtle background colors
- `formatDZD()` utility for currency formatting
- Highlighted global summary row using `bg-muted` or similar styling

## Access Control

This feature is admin-only. The tab will:
1. Only appear in the Tabs list for admin users
2. The API endpoint will verify admin role before returning data

