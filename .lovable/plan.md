

# Fix Employee Filter to Show All Users

## Problem
The employee filter in the Commands tab only fetches active employees (role = "employee"), excluding admin users. Since admins can also create and be assigned commands, they don't appear in the filter dropdown, making it impossible to filter commands by admin users.

## Solution
The Commands page employee filter should use the full users list instead of the active-employees-only endpoint. This way all staff members (admins and employees) appear in the filter dropdown.

## Changes

### `src/pages/CommandsPage.tsx`
- Change the import from `useActiveEmployees` to `useUsers` (from `@/hooks/useUsers`)
- Replace `const { data: employees } = useActiveEmployees();` with `const { data: employees } = useUsers();`
- The rest of the code (filter options, assignee dropdown) already maps over `employees` with `firstName`/`lastName`/`id`, which the full users list also provides

This is a one-line fix that ensures the filter dropdown includes all users in the system.

