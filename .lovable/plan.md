

# Fix Body Size Limits in main.ts

## What Changes
**File:** `server/src/main.ts` (lines 14-15)

Change:
```typescript
app.use(json({ limit: '10gb' }));
app.use(urlencoded({ extended: true, limit: '10gb' }));
```

To:
```typescript
app.use(json({ limit: '20mb' }));
app.use(urlencoded({ extended: true, limit: '20mb' }));
```

## Why This Is Safe
- These parsers only handle JSON/form API requests (login, create command, etc.) -- never file uploads
- File uploads go through Multer which streams to disk and has its own per-controller limits
- No legitimate JSON request will ever exceed 20MB
- The current 10GB limit is a denial-of-service vulnerability

## File Uploads Are Unaffected
Your existing Multer configurations remain independent:
- Documents controller: 10GB limit (you can adjust this to your desired max, e.g., 1GB)
- Receipts controller: 20MB limit
- Passports controller: 10MB limit

## Technical Detail
| Parser | Purpose | Current | Proposed |
|--------|---------|---------|----------|
| `json()` | JSON API bodies | 10gb | 20mb |
| `urlencoded()` | Form submissions | 10gb | 20mb |
| Multer (documents) | File uploads | 10gb | No change |
| Multer (receipts) | PDF uploads | 20mb | No change |
| Multer (passports) | Image/PDF uploads | 10mb | No change |
