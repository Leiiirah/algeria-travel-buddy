
# Change Employee Edit Window from 24 Hours to 30 Minutes

## What Changes

Two functions reference the 24-hour limit — both must be updated to 30 minutes (0.5 hours).

### File 1 — `src/lib/utils.ts` (line 25)

The core editability check:

```typescript
// BEFORE
const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
return hoursSinceCreation <= 24;

// AFTER
const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
return hoursSinceCreation <= 0.5;  // 30 minutes
```

Also update the comment on line 18 from `"within 24 hours"` to `"within 30 minutes"`.

### File 2 — `src/pages/CommandsPage.tsx` (lines 380–383)

The countdown display logic:

```typescript
// BEFORE
if (hoursSinceCreation >= 24) return t('time.locked');
const remaining = 24 - hoursSinceCreation;
if (remaining < 1) return t('time.minutesRemaining', { minutes: Math.round(remaining * 60) });
return t('time.hoursRemaining', { hours: Math.round(remaining) });

// AFTER
if (hoursSinceCreation >= 0.5) return t('time.locked');
const remaining = 0.5 - hoursSinceCreation;  // max 30 min remaining
// Always show minutes (remaining is always < 1 hour now)
return t('time.minutesRemaining', { minutes: Math.round(remaining * 60) });
```

Since the window is only 30 minutes, the countdown will always display in minutes (e.g. "28 min restantes"), never in hours — so the `hoursRemaining` branch is no longer reachable and can be removed.

## Files to Change

| File | Change |
|---|---|
| `src/lib/utils.ts` | Change `<= 24` to `<= 0.5` + update comment |
| `src/pages/CommandsPage.tsx` | Change `24` to `0.5` in `getTimeRemaining`, simplify to always show minutes |

## No Other Changes Needed

- Admin bypass (`user?.role === 'admin'`) already works independently of this limit
- `canDelete` logic is unaffected
- Backend has no time-based enforcement — this is purely frontend
