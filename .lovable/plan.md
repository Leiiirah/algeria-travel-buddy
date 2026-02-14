

# Fix: Dates Saved With Wrong Day Across the App

## Root Cause
Two issues cause dates to be saved or displayed incorrectly:

1. **Missing `commandDate` in passport upload**: The `createWithPassport` endpoint in `commands.controller.ts` does not extract `commandDate` from the form data, so it's always `undefined` even when the user picks a date.

2. **Timezone conversion shifts**: Throughout the app, `new Date(dateString).toISOString().split('T')[0]` is used to format dates. Since `toISOString()` converts to UTC, a date like "2026-02-01" in Algeria (UTC+1) becomes "2026-01-31T23:00:00Z" -- shifting to the **previous day**.

## Changes

### 1. Backend: `server/src/commands/commands.controller.ts` (line 101-111)
Add the missing `commandDate` field to the `createWithPassport` parsed DTO:

```typescript
const parsedDto: CreateCommandDto = {
  ...
  assignedTo: createDto.assignedTo || undefined,
  commandDate: createDto.commandDate || undefined,  // ADD THIS LINE
};
```

### 2. Frontend: Create a date utility helper (`src/utils/dateHelpers.ts`)
A small utility with two functions to avoid timezone issues across the app:

- `formatLocalDate(date: Date): string` -- extracts local YYYY-MM-DD using `getFullYear/getMonth/getDate` instead of `toISOString()`
- `parseLocalDate(dateStr: string): Date` -- parses "YYYY-MM-DD" as local midnight instead of UTC

### 3. Frontend: Fix all `toISOString().split('T')[0]` usages

**`src/pages/CommandsPage.tsx`** (line 350):
Replace `new Date(command.commandDate).toISOString().split('T')[0]` with `formatLocalDate(new Date(command.commandDate))`

**`src/components/omra/OmraOrdersTab.tsx`** (lines 82, 132, 155-157):
- Default `orderDate`: use `formatLocalDate(new Date())` 
- Edit parsing: use `formatLocalDate(new Date(order.orderDate))` etc.

**`src/components/omra/OmraVisasTab.tsx`** (lines 74, 103, 121-122):
- Default `visaDate`: use `formatLocalDate(new Date())`
- Edit parsing: use `formatLocalDate(new Date(visa.visaDate))` etc.

**`src/components/omra/OmraProgramsTab.tsx`** (lines 101-102):
- Edit parsing: use `formatLocalDate(new Date(program.periodFrom))` etc.

## Summary

| File | Change |
|------|--------|
| `src/utils/dateHelpers.ts` | New file: `formatLocalDate()` and `parseLocalDate()` helpers |
| `server/src/commands/commands.controller.ts` | Add missing `commandDate` to `createWithPassport` |
| `src/pages/CommandsPage.tsx` | Use `formatLocalDate` for edit form date parsing |
| `src/components/omra/OmraOrdersTab.tsx` | Use `formatLocalDate` for defaults and edit parsing |
| `src/components/omra/OmraVisasTab.tsx` | Use `formatLocalDate` for defaults and edit parsing |
| `src/components/omra/OmraProgramsTab.tsx` | Use `formatLocalDate` for edit parsing |

