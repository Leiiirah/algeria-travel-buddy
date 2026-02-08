

# Add Search and Advanced Filters to Internal Tasks Page

## Overview
Add a search bar with advanced filtering capabilities to the Internal Tasks (Missions Internes) page, reusing the existing `AdvancedFilter` component already used across other pages (Commands, Employees, Suppliers, etc.).

## Current State
- The page only has basic `Tabs` (All / In Progress / Completed) for status filtering
- No text search capability exists
- No filtering by employee, priority, visibility, or date

## What Will Change

### New Filter Capabilities
- **Text search**: Search tasks by title and description
- **Status filter**: In Progress / Completed (replaces the current Tabs approach)
- **Priority filter**: Urgent / Normal / Critical
- **Employee filter** (admin only): Filter by assigned employee
- **Visibility filter**: Clear / Unreadable
- **Due date filter**: Filter by due date

### User Experience
The current status `Tabs` component will be replaced with the `AdvancedFilter` bar that includes:
1. A search input field (searches across task title and description)
2. A "Filters" button that opens a popover with dropdowns for status, priority, employee, visibility, and a date picker for due date
3. A badge showing the count of active filters
4. A reset button to clear all filters

---

## Technical Details

### File: `src/pages/InternalTasksPage.tsx`

**Changes:**
1. Import `AdvancedFilter` and `FilterConfig` from `@/components/search/AdvancedFilter`
2. Import `useDebounce` for search query debouncing
3. Replace `statusFilter` state with:
   - `searchQuery` (string) for text search
   - `filters` (Record) for advanced filters (status, priority, assignedTo, visibility, dueDate)
4. Build `filterConfig` array with translated labels using `useTranslation`:
   - Status: select with In Progress / Completed options
   - Priority: select with Urgent / Normal / Critical options
   - Employee: select populated from `employees` list (admin only)
   - Visibility: select with Clear / Unreadable options
   - Due Date: date-range picker
5. Update `filteredTasks` logic to apply all filters + debounced search query
6. Replace the `Tabs` component (lines 294-300) with the `AdvancedFilter` component placed between the stats section and the task list card

**Filtering logic (client-side):**
- Text search matches against `task.title` and `task.description` (case-insensitive)
- Status filter matches `task.status`
- Priority filter matches `task.priority`
- Employee filter matches `task.assignedTo`
- Visibility filter matches `task.visibility`
- Due date filter matches tasks on or before the selected date

### Translation Files

**`src/i18n/locales/fr/internalTasks.json`** - Add keys:
- `"searchPlaceholder": "Rechercher une tâche..."`

**`src/i18n/locales/ar/internalTasks.json`** - Add keys:
- `"searchPlaceholder": "البحث عن مهمة..."`

### No Backend Changes Required
All filtering is done client-side since tasks are already fully loaded via the existing `useInternalTasks` hook.

