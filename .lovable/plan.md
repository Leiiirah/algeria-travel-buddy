
# Remove the Optional Date Field from the Command Creation Form

## What Will Change

A single UI block (lines 927–935 in `src/pages/CommandsPage.tsx`) will be deleted — the "Date de commande (optionnel)" input and its helper text paragraph.

```text
src/pages/CommandsPage.tsx
├── REMOVE lines 927–935:
│     <div className="space-y-2">
│       <Label>{t('form.commandDate')}</Label>
│       <Input type="date" ... />
│       <p className="text-xs ...">...</p>
│     </div>
```

## What Will NOT Change

- The `commandDate` key stays in `formData` state and `resetForm()` — it defaults to `''` and is harmless to keep.
- The backend payload still passes `commandDate: formData.commandDate || undefined` — this will always evaluate to `undefined` now (since the field is never filled), which is fine: the backend treats `null`/`undefined` as "use `createdAt`".
- The details dialog display (`viewingCommand.commandDate || viewingCommand.createdAt`) is unchanged — existing records that already have a `commandDate` will still show it correctly.
- The edit form pre-populate logic (`formUpdates.commandDate = ...`) stays in place — it's inert since the input is removed.

## Files to Change

| File | Change |
|---|---|
| `src/pages/CommandsPage.tsx` | Delete the 9-line `commandDate` form field block (lines 927–935) |

That is the only change needed — one file, one block removed.
