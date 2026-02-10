
# Clear Database for Production

## What Will Be Preserved
- **Services** -- all service definitions
- **Companies** -- all airline/transport companies
- **Service Types** -- all service type definitions
- **Users (Employees)** -- all employee and admin accounts
- **Documents** -- all uploaded documents
- **Agency Settings** -- contact and agency configuration
- **Payment Types** -- payment method definitions
- **Suppliers** -- supplier records (needed as references; let me know if you want these cleared too)

## What Will Be Deleted
All transactional/operational data will be removed in the correct order to respect foreign key constraints:

1. `client_invoices` -- client invoice records
2. `payments` -- payment records
3. `caisse_history` -- caisse settlement history
4. `commands` -- all command/order records
5. `supplier_receipts` -- supplier receipt records
6. `supplier_invoices` -- supplier invoice records
7. `supplier_orders` -- supplier order records
8. `supplier_transactions` -- supplier transaction records
9. `employee_transactions` -- employee transaction records
10. `omra_visas` -- omra visa records
11. `omra_orders` -- omra order records
12. `omra_programs` -- omra program records
13. `omra_hotels` -- omra hotel records
14. `expenses` -- expense records
15. `internal_tasks` -- internal task records
16. `refresh_tokens` -- login session tokens (users will need to log in again)

## How It Will Be Done

A single TypeORM migration file will be created with TRUNCATE CASCADE statements in the correct dependency order. This ensures no foreign key violations.

### Technical Details

New migration file: `server/src/database/migrations/1771400000000-ClearProductionData.ts`

```sql
TRUNCATE TABLE client_invoices CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE caisse_history CASCADE;
TRUNCATE TABLE commands CASCADE;
TRUNCATE TABLE supplier_receipts CASCADE;
TRUNCATE TABLE supplier_invoices CASCADE;
TRUNCATE TABLE supplier_orders CASCADE;
TRUNCATE TABLE supplier_transactions CASCADE;
TRUNCATE TABLE employee_transactions CASCADE;
TRUNCATE TABLE omra_visas CASCADE;
TRUNCATE TABLE omra_orders CASCADE;
TRUNCATE TABLE omra_programs CASCADE;
TRUNCATE TABLE omra_hotels CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE internal_tasks CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
```

The migration will run automatically on next deployment. Since this is a data-clearing operation (not schema change), the `down()` method will be empty (data cannot be restored).

**Note:** Suppliers are kept since they're reference data. If you also want suppliers cleared, let me know.
