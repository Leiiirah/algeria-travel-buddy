
# Fix: "Mes commandes" Showing Today's Date Instead of User-Set Date

## Problem
In the Employee Accounting page (`src/pages/EmployeeAccountingPage.tsx`), the "Mes commandes" table and the admin employee detail dialog both display `command.createdAt` for the date column, ignoring the `commandDate` set by the user.

## Fix

Two lines need to change in `src/pages/EmployeeAccountingPage.tsx`:

### 1. Employee "Mes commandes" table (line 583)

```typescript
// Before:
format(new Date(command.createdAt), 'dd MMM yyyy', { locale: dateLocale })

// After:
format(new Date(command.commandDate || command.createdAt), 'dd MMM yyyy', { locale: dateLocale })
```

### 2. Admin employee detail dialog - sales tab (line 802)

```typescript
// Before:
format(new Date(command.createdAt), 'dd MMM yyyy', { locale: dateLocale })

// After:
format(new Date(command.commandDate || command.createdAt), 'dd MMM yyyy', { locale: dateLocale })
```

Both changes apply the same effective date pattern: use `commandDate` if set, otherwise fall back to `createdAt`.
