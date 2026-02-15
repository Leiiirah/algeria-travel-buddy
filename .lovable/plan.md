

# Fix 4 TypeScript Build Errors

The NestJS backend fails to compile due to strict TypeScript checks. Here are the 4 errors and their fixes:

## Error 1: `companies.controller.ts` - implicit `any` on `req` parameter
**Fix**: Add explicit type annotation `@Request() req: any`

## Error 2: `payment-types.controller.ts` - implicit `any` on `req` parameter  
**Fix**: Add explicit type annotation `@Request() req: any`

## Error 3 & 4: `omra.service.ts` - `reserve` status missing from visa `byStatus` object
The `OmraStatus` enum includes `RESERVE` but the `visaStats.byStatus` object only has `en_attente`, `confirme`, `termine`, `annule`. When a visa has `reserve` status, TypeScript complains it can't index into that object.

**Fix**: Add `reserve: 0` to the `visaStats.byStatus` object.

## Files Changed
- `server/src/companies/companies.controller.ts` (line 25)
- `server/src/payment-types/payment-types.controller.ts` (line 25)
- `server/src/omra/omra.service.ts` (lines ~418-419, add `reserve` to visa byStatus)

After these fixes, run on the server:
```
cd /var/www/elhikma/server
npm run build
pm2 restart elhikma-backend
```

