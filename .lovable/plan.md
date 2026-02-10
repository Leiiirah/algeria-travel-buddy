

## Increase Passport Upload Limit to 500MB

**File:** `server/src/commands/commands.controller.ts` (line 87)

Change the Multer file size limit from 10MB to 500MB:

```typescript
// Before
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB

// After
limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
```

This only affects the passport file upload endpoint (`/commands/with-passport`). The global JSON/urlencoded body parsers remain at 20MB as previously configured.

**Note:** Make sure your Nginx `client_max_body_size` is also set to at least `500m` in your production config, otherwise Nginx will reject the upload before it reaches NestJS.

