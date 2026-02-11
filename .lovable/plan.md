
# Add Employee Tasks Section to Dashboard

## Overview
Add a new section to the Dashboard page that is visible only to employees, showing their internal tasks split into two categories: ongoing tasks ("En cours") and unread tasks ("Non lue" -- tasks with visibility = 'unreadable').

## Changes

### 1. Add translations for the new section

**File:** `src/i18n/locales/fr/dashboard.json`
- Add a new `tasks` key with translations:
  - `title`: "Mes missions"
  - `ongoingTitle`: "En cours"
  - `unreadTitle`: "Non lue"
  - `emptyOngoing`: "Aucune mission en cours"
  - `emptyUnread`: "Aucune nouvelle mission"
  - `viewAll`: "Voir toutes les missions"
  - `dueDate`: "Echéance"
  - `priority`: labels for urgent/normal/critical

**File:** `src/i18n/locales/ar/dashboard.json`
- Add corresponding Arabic translations for the same keys.

### 2. Add the tasks section to DashboardPage

**File:** `src/pages/DashboardPage.tsx`
- Import `useInternalTasks` from `@/hooks/useInternalTasks`
- Import `useAuth` from `@/contexts/AuthContext`
- Import necessary icons (`ClipboardCheck`, `Clock`, `Eye`, `EyeOff`, etc.)
- Import `Link` from react-router-dom for a "View all" link
- Call `useInternalTasks()` only when the user is an employee (or for all users -- the backend already filters by role)
- After the "Recent Commands" section, add a new section visible to employees:
  - Two side-by-side cards (grid layout):
    - **"En cours" card**: Shows tasks where `status === 'in_progress'` and `visibility === 'clear'`
    - **"Non lue" card**: Shows tasks where `visibility === 'unreadable'`
  - Each task card shows: title, priority badge (color-coded), and due date if present
  - A "View all" link at the bottom navigating to `/internal-tasks`
  - Empty states when no tasks exist in either category

### Technical Details

| Area | File | Change |
|------|------|--------|
| Translations | `fr/dashboard.json` | Add `tasks` section |
| Translations | `ar/dashboard.json` | Add `tasks` section |
| Dashboard | `DashboardPage.tsx` | Import hooks, add conditional employee tasks section |

The section will use the existing `useInternalTasks` hook which already returns only the employee's own tasks (backend filtering). Tasks are split client-side by `status` and `visibility` fields.
