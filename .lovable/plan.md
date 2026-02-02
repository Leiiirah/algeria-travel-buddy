

# Plan: Add Visa Processing Statuses to Commands

## Overview

Add 7 new visa-specific statuses to the Commands page, replacing the current 4 generic statuses with a more detailed workflow that tracks the visa application process from submission to delivery.

---

## New Statuses

| Code | French Label | Arabic Label | Description |
|------|-------------|--------------|-------------|
| `dossier_incomplet` | Dossier incomplet | ملف غير مكتمل | Application documents are incomplete |
| `depose` | Déposé | تم الإيداع | Application has been submitted |
| `en_traitement` | En traitement | قيد المعالجة | Application is being processed |
| `accepte` | Accepté | مقبول | Visa application approved |
| `refuse` | Refusé | مرفوض | Visa application rejected |
| `visa_delivre` | Visa délivré | تم إصدار التأشيرة | Visa has been issued |
| `retire` | Retiré | تم السحب | Visa/passport has been collected |

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/commands/entities/command.entity.ts` | Update `CommandStatus` enum with new values |
| `server/src/commands/commands.service.ts` | Update stats calculation for new statuses |
| `src/lib/api.ts` | Update `UpdateCommandDto` type with new status values |
| `src/pages/CommandsPage.tsx` | Add status dropdown selector in UI for admin, update badge colors |
| `src/i18n/locales/fr/commands.json` | Add French translations for new statuses |
| `src/i18n/locales/ar/commands.json` | Add Arabic translations for new statuses |
| `src/types/index.ts` | Update Command type if needed |

---

## Implementation Details

### 1. Backend - Update CommandStatus Enum

```typescript
// server/src/commands/entities/command.entity.ts
export enum CommandStatus {
  DOSSIER_INCOMPLET = 'dossier_incomplet',
  DEPOSE = 'depose',
  EN_TRAITEMENT = 'en_traitement',
  ACCEPTE = 'accepte',
  REFUSE = 'refuse',
  VISA_DELIVRE = 'visa_delivre',
  RETIRE = 'retire',
}
```

### 2. Frontend - Status Selector for Admin

Add an inline status selector in the table that only admins can use:

```tsx
// Status cell with dropdown for admin
<TableCell>
  {user?.role === 'admin' ? (
    <Select
      value={command.status}
      onValueChange={(value) => handleStatusChange(command.id, value)}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue>{getStatusLabel(command.status)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <Badge variant={getStatusVariant(command.status)}>
      {getStatusLabel(command.status)}
    </Badge>
  )}
</TableCell>
```

### 3. Status Badge Colors

| Status | Badge Variant | Color |
|--------|--------------|-------|
| `dossier_incomplet` | `outline` | Gray/Yellow |
| `depose` | `secondary` | Blue |
| `en_traitement` | `secondary` | Blue |
| `accepte` | `default` | Green |
| `refuse` | `destructive` | Red |
| `visa_delivre` | `default` | Green |
| `retire` | `default` | Green (completed) |

### 4. Update Translations

**French (`commands.json`):**
```json
"status": {
  "dossier_incomplet": "Dossier incomplet",
  "depose": "Déposé",
  "en_traitement": "En traitement",
  "accepte": "Accepté",
  "refuse": "Refusé",
  "visa_delivre": "Visa délivré",
  "retire": "Retiré"
}
```

**Arabic (`commands.json`):**
```json
"status": {
  "dossier_incomplet": "ملف غير مكتمل",
  "depose": "تم الإيداع",
  "en_traitement": "قيد المعالجة",
  "accepte": "مقبول",
  "refuse": "مرفوض",
  "visa_delivre": "تم إصدار التأشيرة",
  "retire": "تم السحب"
}
```

---

## Status Workflow Visualization

```text
┌─────────────────────┐
│  Dossier incomplet  │ ◄── Initial state if docs missing
└─────────┬───────────┘
          │ (complete docs)
          ▼
┌─────────────────────┐
│      Déposé         │ ◄── Submitted to embassy/consulate
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   En traitement     │ ◄── Being processed
└─────────┬───────────┘
          │
     ┌────┴────┐
     ▼         ▼
┌─────────┐ ┌─────────┐
│ Accepté │ │ Refusé  │
└────┬────┘ └─────────┘
     │
     ▼
┌─────────────────────┐
│   Visa délivré      │ ◄── Visa ready for pickup
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│      Retiré         │ ◄── Client collected passport
└─────────────────────┘
```

---

## Admin Permission Check

Only admins can modify the status. This will be enforced by:
1. Checking `user.role === 'admin'` in the frontend before showing the selector
2. The existing role-based system on the backend

---

## Migration Considerations

The database currently has commands with the old status values (`en_attente`, `en_cours`, `termine`, `annule`). We need to:

1. Add the new enum values to PostgreSQL
2. Optionally migrate existing data:
   - `en_attente` → `dossier_incomplet`
   - `en_cours` → `en_traitement`
   - `termine` → `retire`
   - `annule` → `refuse`

---

## Summary

| Category | Count |
|----------|-------|
| Backend files | 2 |
| Frontend files | 3 |
| Translation files | 2 |
| **Total** | 7 files |

