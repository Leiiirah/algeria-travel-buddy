

# Extend Token Lifetime to Reduce Frequent Logouts

## Problem
The access token expires every **15 minutes**, causing frequent logouts when the refresh mechanism encounters any hiccup.

## Changes

### 1. `server/src/auth/auth.module.ts`
Change the default `JWT_EXPIRES_IN` fallback from `'15m'` to `'8h'` (full work day).

### 2. `server/src/auth/auth.service.ts`
Change the default `JWT_REFRESH_EXPIRES_IN` fallback from `'7d'` to `'30d'` (one month).

### 3. `server/.env.example`
Update example values to match:
- `JWT_EXPIRES_IN=8h`
- `JWT_REFRESH_EXPIRES_IN=30d`

## Result
- Users stay logged in throughout their work day without interruption
- Sessions persist for up to 30 days even after closing the browser
- No frontend changes needed

