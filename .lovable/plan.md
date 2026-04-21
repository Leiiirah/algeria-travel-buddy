

# Remix → Demo Travel Agency (Frontend-Only Mock Build)

Transform this remixed project into a self-contained, frontend-only demo. Keep every screen, hook, computation, and UI behavior identical — only swap the backend layer underneath and rebrand to **Demo Travel Agency**.

## Strategy

The codebase already isolates backend access into a single layer: **`src/lib/api.ts` (1548 lines)** is the only place that talks to the NestJS server. Every page consumes data exclusively through React Query hooks (`src/hooks/use*.ts`), which call methods on the `api` object. This is the perfect seam to cut.

I'll replace the *internals* of `src/lib/api.ts` (the `ApiClient` class and exported `api` singleton) with an in-memory mock store. Every method keeps its exact signature, return type, and `Promise`-based async behavior. Hooks, components, contexts, validation, computed values, role checks — none of them change.

```text
┌─────────────────────────────────────────────────────────┐
│ Pages (19) ── Components ── Contexts (Auth)              │  ← UNCHANGED
│         │                                                │
│         ▼                                                │
│ React Query Hooks (25)                                   │  ← UNCHANGED
│         │                                                │
│         ▼                                                │
│ src/lib/api.ts  ← API surface (signatures)               │  ← KEPT
│         │                                                │
│         ▼                                                │
│ [OLD] HTTP fetch → NestJS → Postgres                     │  ← REMOVED
│ [NEW] In-memory mock store with 200ms simulated latency  │  ← ADDED
└─────────────────────────────────────────────────────────┘
```

## Plan

### 1. Create the mock data layer (`src/lib/mock/`)
- **`store.ts`** — In-memory module-level singletons holding arrays for every entity: `users`, `services`, `serviceTypes`, `suppliers`, `commands`, `payments`, `supplierTransactions`, `documents`, `omraHotels`, `omraOrders`, `omraVisas`, `omraPrograms`, `employeeTransactions`, `expenses`, `supplierOrders`, `supplierReceipts`, `supplierInvoices`, `internalTasks`, `clientInvoices`, `caisseSettlements`, `companies`, `paymentTypes`, `agencySettings`. UUIDs via `crypto.randomUUID()`. **Reset on reload** (no localStorage).
- **`seed.ts`** — Builds the seed: 1 admin (`admin@demo.com` / any password), 1 employee (`employee@demo.com` / any password), ~5 service types, ~6 services, ~8 suppliers, ~25 commands across all 7 statuses + all service types, ~15 payments, ~8 supplier transactions, ~6 omra orders + 4 visas + 2 programs across all 5 statuses, ~10 expenses across all categories, ~12 internal tasks across all priorities/statuses, ~8 client invoices (proforma + final), document folder tree, etc. Foreign-key references all resolved to existing IDs.
- **`helpers.ts`** — `delay(ms = 200)`, `paginate<T>()`, `filter helpers`, `notFound()` thrower for missing-ID errors (preserves error-handling code paths).

### 2. Rewrite `src/lib/api.ts` internals
- Keep **every exported type, DTO, interface, and function signature** byte-for-byte identical.
- Replace the `ApiClient` class methods so each one:
  1. `await delay()` to preserve loading states
  2. Reads/mutates the in-memory store
  3. Returns the same shape the real backend returned (handling `PaginatedResponse<T>`, stats objects, populated relations like `creator`, `assignee`, `supplier`, `hotel`)
  4. Throws `ApiError` with the right `type` (`unauthorized`, `not_found`, etc.) where the real backend would
- Token methods (`getToken`, `setToken`, `clearTokens`, etc.) become no-ops returning placeholder strings — `AuthContext` already handles missing tokens gracefully.
- Computed/aggregated endpoints (`getDashboardStats`, `getOmraStats`, `getExpenseStats`, supplier balances, employee balances, caisse calculations) are computed live from the store so all derived numbers stay coherent with mutations.

### 3. Simulated authentication (`src/contexts/AuthContext.tsx` stays untouched)
- `api.login()` → 800ms delay, accepts **any** email/password, returns the matching seeded user if email matches `admin@demo.com` or `employee@demo.com`, otherwise returns the admin user. Same `LoginResponse` shape, same token plumbing.
- `api.getMe()` → returns currently "logged in" user from a module-level `currentUser` variable.
- `api.logout()` → clears `currentUser`. AuthContext's existing `logout()` flow handles the rest.
- `ProtectedRoute` and `adminOnly` guards work unchanged because they read `user.role` from `AuthContext`.

### 4. Rebrand to "Demo Travel Agency"
Files touched (text only — no structural changes):
- `index.html` — `<title>`, meta description, author, OG tags, twitter handle
- `src/i18n/locales/fr/common.json` + `src/i18n/locales/ar/common.json` — `company.name`, `company.subtitle`
- `src/constants/agency.ts` — already partially placeholder; fill with Demo Travel Agency identity (FR + AR)
- `src/components/layout/AppSidebar.tsx` — alt text + replace `logo-elhikma.png` reference with a generic icon (use existing Lucide `Plane` icon already in the sidebar nav, scaled up — no new asset needed)
- `src/pages/LoginPage.tsx` — logo + alt text → same Lucide-icon swap, plus add a small credentials hint card showing the two demo accounts
- `src/components/invoice/InvoiceTemplate.tsx` + `src/components/expenses/ExpensesReportTemplate.tsx` — swap `logo-elhikma.png` import for the same icon-based header
- `src/index.css` — top comment "El Hikma Tourisme - Design System" → "Demo Travel Agency - Design System"
- `README.md` — rewrite intro to describe the demo build + list credentials

### 5. Strip backend code
- **Delete** the entire `server/` folder (no longer used)
- **Delete** `src/integrations/supabase/` folder + `@supabase/supabase-js` import (Supabase is unused but the dep exists)
- **Delete** `.env.example` and any `VITE_API_URL` / `VITE_SUPABASE_*` references
- Remove env-variable reads from `src/lib/api.ts` header
- Keep all utility files (`pdfGenerator.ts`, `arabicReshaper.ts`, `tajawalFont.ts`, `numberToWords.ts`, `dateHelpers.ts`, `invoiceGenerator.ts`) — they're pure utilities

### 6. Final audit (all 8 audit dimensions from the brief)
After implementation I'll trace data end-to-end:
- **Referential integrity** — every `serviceId`, `supplierId`, `assignedTo`, `createdBy`, `commandId`, `hotelId`, `programId`, `employeeId`, `parentId` resolves to an existing seeded record
- **Enum consistency** — all `CommandStatus`, `OmraStatus`, `TaskStatus`, `TaskPriority`, `ExpenseCategory`, `PaymentMethod`, `SupplierOrderStatus`, `SupplierInvoiceStatus`, `ClientInvoiceType/Status`, `EmployeeTransactionType`, `OmraRoomType`, `OmraOrderType`, `UserRole` values exactly match the type unions
- **Logic-driven coherence** — `amountPaid ≤ sellingPrice`, `buyingPrice < sellingPrice` (positive profit on most), payments sum to each command's `amountPaid`, completed commands have status reflecting completion, supplier transactions roll up to coherent balances
- **Temporal** — all `createdAt < updatedAt < (completedAt where applicable)`, dueDates in plausible windows, `commandDate` recent, omra `periodFrom < periodTo`, no 1970/future-anomaly dates
- **Distribution** — every status, role, category, priority has ≥1 record; lists long enough to exercise pagination (>20 commands); at least one user with no assigned tasks (empty state); at least one supplier with no transactions
- **Narrative coherence** — admin "Sara Admin" created seed records, employee "Karim Employee" assigned to several commands & tasks; suppliers match service types (visa supplier → visa commands); hotels appear in omra orders
- **Branding sweep** — final regex check for `Hikma|hikma|elhikma|ElHikma|admin@elhikma|@ElHikmaTourisme` returns zero matches in active code
- **Dead data** — every entity type appears in at least one UI screen

I'll list any issues found and fix each one in the same pass, then explicitly confirm "Audit passed" with a summary.

## Demo credentials (shown on login page)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | any |
| Employee | `employee@demo.com` | any |

Any other email also logs in (defaults to admin) — matches the "any credentials work" requirement.

## Files Changed (high-level)

| Area | Files | Change |
|---|---|---|
| Mock layer | `src/lib/mock/store.ts`, `seed.ts`, `helpers.ts` | **New** |
| API surface | `src/lib/api.ts` | Rewrite internals only — signatures preserved |
| Branding | `index.html`, `src/i18n/locales/{fr,ar}/common.json`, `src/constants/agency.ts`, `src/index.css`, `README.md` | Text |
| Logo swaps | `AppSidebar.tsx`, `LoginPage.tsx`, `InvoiceTemplate.tsx`, `ExpensesReportTemplate.tsx` | Replace logo asset with Lucide icon |
| Login UX | `src/pages/LoginPage.tsx` | Add credentials hint card |
| Cleanup | `server/`, `src/integrations/supabase/`, `.env.example` | **Delete** |
| Untouched | All `src/hooks/*`, all `src/pages/*` (except LoginPage), all `src/components/*` (except 4 above), `AuthContext.tsx`, `ProtectedRoute.tsx`, types, utils, validation, Tailwind config, design tokens | No changes |

