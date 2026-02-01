

# Plan: Fix API Routing Between Nginx and NestJS

## Problem Summary

The nginx configuration proxies `/api/*` requests to NestJS, but it sends the full path including `/api`. Since NestJS routes don't have the `/api` prefix, requests fail with 404/405 errors.

## Solution

Two changes are needed:

### 1. Revert Frontend API URL (Lovable Code Change)

The frontend should include `/api` in requests to match nginx configuration.

**File:** `src/lib/api.ts`

**Change:** Remove the normalization that strips `/api`:

```typescript
// Before (current broken state):
const RAW_API_URL = (import.meta.env.VITE_API_URL || 'http://69.62.127.134:8080').trim();
const API_URL = RAW_API_URL
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

// After (fixed):
const API_URL = (import.meta.env.VITE_API_URL || 'http://69.62.127.134:8080/api')
  .trim()
  .replace(/\/+$/, '');
```

### 2. Update Nginx Configuration (VPS Change)

Modify nginx to **strip the `/api` prefix** when proxying to NestJS.

**File on VPS:** `/etc/nginx/sites-available/default`

**Change the `/api` location block:**

```nginx
# Before:
location /api {
    proxy_pass http://127.0.0.1:3000;
    ...
}

# After:
location /api/ {
    rewrite ^/api/(.*) /$1 break;
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**After editing, run these commands on your VPS:**
```bash
sudo nginx -t          # Test configuration
sudo systemctl reload nginx   # Apply changes
```

## Expected Result

After both changes:

```
Frontend → /api/auth/login → Nginx (strips /api) → http://127.0.0.1:3000/auth/login → NestJS ✓
```

## Files to Modify

| Location | File | Change |
|----------|------|--------|
| Lovable | `src/lib/api.ts` | Restore `/api` suffix in base URL |
| VPS | `/etc/nginx/sites-available/default` | Add rewrite rule to strip `/api` prefix |

