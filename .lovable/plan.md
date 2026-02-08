

# Fix: Document Entity `fileUrl` Column Type Error

## Problem

The error `Data type "Object" in "Document.fileUrl" is not supported by "postgres"` is caused by TypeORM not being able to infer the correct database type from the TypeScript union type `string | null`. TypeORM interprets this as an `Object` type, which PostgreSQL does not support.

## Root Cause

In `server/src/documents/entities/document.entity.ts`, line:

```typescript
@Column({ nullable: true })
fileUrl: string | null;
```

TypeORM reads `string | null` and falls back to `Object` as the reflected type. It needs an explicit `type` hint.

## Fix

Change the `fileUrl` column decorator to explicitly specify the `varchar` type:

```typescript
@Column({ type: 'varchar', nullable: true })
fileUrl: string | null;
```

## File to Modify

| File | Change |
|------|--------|
| `server/src/documents/entities/document.entity.ts` | Add `type: 'varchar'` to the `fileUrl` `@Column()` decorator |

## After Deploying

Once the fix is pushed and built on the server:

1. Pull the latest code on the VPS
2. Rebuild: `npm run build`
3. Restart: `pm2 restart elhikma-backend`
4. Check logs: `pm2 logs elhikma-backend --lines 20`

The server should start successfully and the 502 error will be resolved.

