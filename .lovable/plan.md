# Make Dummy Data Fully Compliant with Logic Document

Apply targeted edits to `src/lib/mock/seed.ts` to resolve every FAIL and coverage gap from the previous audit, then deliver a fresh verification report confirming all rules pass.

## Scope
**Single file edited:** `src/lib/mock/seed.ts`
**No changes to:** types, hooks, API surface, components, routes, store shape.

## Fixes

### 1. FAIL #1 — Add 3 missing default ServiceTypes (§1.2)
Add `billet_bateau`, `billet_tilex`, `billets` to the seeded `serviceTypes` array. All inactive-by-default? No — spec says default seed, so `isActive: true`.

### 2. FAIL #2 — Fix `SupplierOrder.orderNumber` format
Change `SO-2025-NNNN` → `SO-{YYYYMMDD}-{NNN}` using each order's `orderDate`. Use a small helper to format the date and pad the suffix to 3 digits.

### 3. FAIL #3 — Fix `SupplierInvoice.internalRef` format
Change `INT-NNNNN` → `INV-{YYYYMMDD}-{NNN}` using each invoice's `invoiceDate`.

### 4. FAIL #4 — Fix `ClientInvoice.invoiceNumber` format
Change `PROF-2025-NNNN` / `FACT-2025-NNNN` → `PRO-{YYYYMMDD}-{NNN}` / `FAC-{YYYYMMDD}-{NNN}` per `invoiceDate` and `type`. Sequence resets per (type+date) per spec.

### 5. Coverage gap — Missing `OmraVisa` with `status='reserve'`
Add a 5th `OmraVisa` record with `status: 'reserve'`, valid hotelId (`hHaram.id`), valid prices, assigned to employee.

### 6. Coverage gap — No `CaisseSettlement` records
Add 1–2 `CaisseSettlement` (caisse_history) entries for Karim with realistic snapshot values (caisseAmount, impayesAmount, beneficesAmount, commandCount, carry-overs, adminId, resetDate ~30 days ago) so the "Historique des règlements" UI is no longer empty.

### 7. Coverage gap — No overdue `SupplierInvoice`
Adjust the `non_paye` invoice's `dueDate` to a date in the past (e.g., `daysAgo(5)`) so it satisfies `status != 'paye' AND dueDate < today` and the overdue logic (§2.4) is exercised.

### 8. (Optional polish) Coverage gap — Default ServiceType coverage
After adding the 3 missing types, no new Service records are required — the existing 6 services already cover the most-used codes, and the new types just appear in the ServiceType management screen.

## Helpers added inline (not exported)
```ts
const fmtYMD = (d: Date) => 
  `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
```
Used for the 3 numbering format fixes.

## After changes — re-run verification
Re-read `seed.ts`, then deliver an updated **Final Report** with:
- Updated PASS / FAIL / SKIP counts
- Confirmation each prior FAIL is resolved
- Confirmation each coverage gap is closed
- Confirmation no new issues introduced (FK integrity, enum values, sum invariants still hold)

## Files Changed
| File | Type of change |
|---|---|
| `src/lib/mock/seed.ts` | 7 in-place edits (no structural change) |

No types, hooks, components, or routes touched. Mock store schema unchanged.
