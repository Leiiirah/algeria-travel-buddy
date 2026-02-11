

# Fix Command Creation: Loading Indicator and Assignment Bug

## Overview
Two issues need to be fixed in the Commands page:
1. No loading feedback when submitting a new command, risking duplicate submissions
2. Employee assignment is lost when creating visa commands with passport upload

## Issue 1: Missing Loading Indicator on Submit

**Problem:** The submit button stays active during command creation, allowing multiple clicks.

**Fix in `src/pages/CommandsPage.tsx`:**
- Track a local `isSubmitting` state for the passport-upload code path (which bypasses the mutation)
- Disable the submit button and show a spinner when either `createCommand.isPending`, `updateCommand.isPending`, or the local `isSubmitting` state is true
- The button already imports `Loader2` icon -- just need to wire it up in the DialogFooter

## Issue 2: Assignment Not Working on Create

**Problem:** The `createCommandWithPassport` method in `src/lib/api.ts` builds a `FormData` object but never appends the `assignedTo` field. So when creating a visa command with a passport file, the employee assignment is silently dropped.

**Fix in `src/lib/api.ts`:**
- Add `assignedTo` to the FormData in `createCommandWithPassport` (only when it has a value)
- Also add `commandDate` which is similarly missing from the FormData builder

**Fix in `src/lib/api.ts` (UpdateCommandDto):**
- Add the missing `assignedTo?: string` and `commandDate?: string` fields to `UpdateCommandDto` for type safety

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/api.ts` | Append `assignedTo` and `commandDate` to FormData in `createCommandWithPassport`; add missing fields to `UpdateCommandDto` |
| `src/pages/CommandsPage.tsx` | Add `isSubmitting` state for passport upload path; disable submit button and show spinner during any submission |

