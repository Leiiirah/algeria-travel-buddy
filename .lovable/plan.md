

# Plan: Fix API URL Configuration Mismatch

## Problem

The production login returns a **404 Not Found** error because the frontend and backend have mismatched URL configurations.

**Request URL:** `http://69.62.127.134:8080/api/auth/login`  
**Expected URL:** `http://69.62.127.134:8080/auth/login`

---

## Root Cause

The backend NestJS server doesn't have a global `/api` prefix, but the frontend is configured to include `/api` in the base URL.

---

## Solution

Update `src/lib/api.ts` to remove `/api` from the default URL:

**Before:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://69.62.127.134:8080/api';
```

**After:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://69.62.127.134:8080';
```

---

## File to Modify

| File | Change |
|------|--------|
| `src/lib/api.ts` | Remove `/api` from the default URL |

---

## Result

After this change:
- Login request will go to `http://69.62.127.134:8080/auth/login`
- All other API endpoints will work correctly

