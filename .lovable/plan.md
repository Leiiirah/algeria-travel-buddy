
# Add Activate/Deactivate Toggle & Delete Confirmation for Suppliers

## What will change

Two improvements to `src/pages/SuppliersPage.tsx` only — no backend changes needed since `updateSupplier` already accepts `isActive` via the existing `UpdateSupplierDto`, and `deleteSupplier` already exists.

---

## 1. Delete Confirmation (AlertDialog)

Currently, clicking the trash icon deletes immediately with no warning. We'll replace this with a two-step flow matching the pattern used in `EmployeeAccountingPage`, `DocumentsPage`, and others:

- Add state: `supplierToDelete: string | null`
- Trash icon button sets `supplierToDelete` to the supplier's id (instead of deleting directly)
- An `AlertDialog` renders at the bottom of the page, controlled by `supplierToDelete`
- Confirming in the dialog calls `deleteSupplier.mutate(supplierToDelete)` and resets state
- Uses existing i18n keys: `tCommon('actions.confirmDeleteTitle')` and `tCommon('actions.confirmDeleteMessage')`

---

## 2. Activate / Deactivate Toggle

Currently there is no way to toggle a supplier's active status from the UI. We'll add:

- A toggle button next to the Edit/Delete buttons in the actions column (admin only)
- Clicking it calls `updateSupplier.mutate({ id, data: { isActive: !supplier.isActive } })`
- Icon: `ToggleLeft` (inactive → activate) / `ToggleRight` (active → deactivate), following the `CompaniesPage` pattern
- Uses `tCommon('companies.activate')` / `tCommon('companies.deactivate')` i18n keys which already exist

---

## Technical Details

### Files modified
- `src/pages/SuppliersPage.tsx` — only file to change

### Changes
1. Add imports: `AlertDialog` family from `@/components/ui/alert-dialog`, `ToggleLeft`, `ToggleRight` from `lucide-react`
2. Add state: `const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)`
3. Update `handleDeleteSupplier` to just set `setSupplierToDelete(id)` instead of calling `deleteSupplier.mutate` directly
4. Add `handleConfirmDelete` function that calls `deleteSupplier.mutate(supplierToDelete!)` then resets
5. Add `handleToggleActive` function that calls `updateSupplier.mutate({ id, data: { isActive: !supplier.isActive } })`
6. In the actions `TableCell`: add a toggle button between Edit and Delete. Change Delete button to set `supplierToDelete` instead of calling mutate directly
7. Add `AlertDialog` at the end of the JSX (before closing `DashboardLayout`) for delete confirmation

No backend, no i18n, no migration changes required — everything needed already exists.
