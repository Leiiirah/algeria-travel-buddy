
# Fix: Internal Tasks 404 Error

## Problem Identified

The Internal Tasks module is returning 404 errors because of a **duplicate route prefix**.

### Root Cause

| File | Current | Should Be |
|------|---------|-----------|
| `main.ts` | `app.setGlobalPrefix('api')` | Global prefix adds `/api` to all routes |
| `internal-tasks.controller.ts` | `@Controller('api/internal-tasks')` | Creates `/api/api/internal-tasks` |

**Actual route being served**: `http://69.62.127.134:8080/api/api/internal-tasks`
**Expected route**: `http://69.62.127.134:8080/api/internal-tasks`

### Evidence

Looking at other controllers in the project:
- `commands.controller.ts`: `@Controller('commands')` → becomes `/api/commands`
- `users.controller.ts`: `@Controller('users')` → becomes `/api/users`

---

## Solution

Change the controller decorator from `'api/internal-tasks'` to `'internal-tasks'`:

### File: `server/src/internal-tasks/internal-tasks.controller.ts`

```text
// Line 21 - BEFORE:
@Controller('api/internal-tasks')

// Line 21 - AFTER:
@Controller('internal-tasks')
```

---

## Implementation Steps

1. Update the controller route prefix (1 line change)
2. Redeploy the backend via GitHub Actions
3. The migration will run automatically as configured

---

## Technical Details

No other changes required. The global prefix in `main.ts` will automatically prepend `/api` to all controller routes, making the final endpoint `/api/internal-tasks` as expected.
