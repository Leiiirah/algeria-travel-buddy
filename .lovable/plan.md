

# Fix: Duplicate Variable Declaration in Migration

## Problem

The migration file `1770600000000-RefactorDocumentsToHierarchy.ts` declares `const hasCategory` twice in the same function scope (lines 37 and 95). JavaScript/TypeScript does not allow two `const` declarations with the same name in the same scope, causing a `SyntaxError` at runtime.

## Root Cause

When the "make category nullable" step was added (step 6), a `const hasCategory` check was introduced. However, the same variable name was already used in step 8 (drop the category column). Both use `const`, so the compiled JS file throws `SyntaxError: Identifier 'hasCategory' has already been declared`.

## Fix

Rename the second `hasCategory` variable (line 95) to `hasCategoryColumn` to avoid the naming conflict.

**Before (line 95):**
```typescript
const hasCategory = await queryRunner.query(`
```

**After:**
```typescript
const hasCategoryColumn = await queryRunner.query(`
```

And update the reference on line 100 from `hasCategory.length` to `hasCategoryColumn.length`.

## File to Modify

| File | Change |
|------|--------|
| `server/src/database/migrations/1770600000000-RefactorDocumentsToHierarchy.ts` | Rename second `hasCategory` to `hasCategoryColumn` on lines 95 and 100 |

## After Deploying

1. Pull the latest code on the VPS
2. Rebuild: `npm run build`
3. Restart: `pm2 restart elhikma-backend`
4. Check logs: `pm2 logs elhikma-backend --lines 30`

The migration should now run successfully, creating the system folders and completing the schema transition.

