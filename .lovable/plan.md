

# Redesign Expenses PDF to Match Invoice Template Style

## Overview

Replace the current plain jsPDF-based expenses PDF with an HTML-to-PDF approach identical to how invoices are generated. This means creating a React template component (`ExpensesReportTemplate.tsx`) that mirrors the invoice design (bilingual letterhead, accent colors, professional layout, Arabic footer), then rendering it off-screen and capturing via `html2canvas` into a jsPDF A4 document.

## Design Details

The expenses report PDF will feature:
- **Bilingual letterhead** (French left, logo center, Arabic right) -- same as invoices
- **Legal identifiers row** (RC, NIF, NIS, Art. Fiscal)
- **Gradient separator line**
- **Title banner** with accent color background: "RAPPORT DES DEPENSES" / "تقرير المصروفات"
- **Summary cards** in a 3-column layout showing: Ce Mois, Cette Annee, Total Global
- **Expenses table** styled as an HTML table with header accent color, alternating rows
- **Total row** at the bottom of the table with the accent-colored highlight
- **Arabic footer** with agency details (same as invoice footer)
- **Timestamp** at bottom right
- Accent color: a distinct color like `#1B4332` (Forest Green) to match the professional feel

## Files to Create / Modify

### 1. NEW: `src/components/expenses/ExpensesReportTemplate.tsx`

A React component (similar to `InvoiceTemplate.tsx`) that renders the full A4-sized expenses report:
- Uses `AGENCY_INFO` from `src/constants/agency.ts`
- Accepts `ExpensesPdfData` (same interface as current `pdfGenerator.ts`)
- Renders the bilingual letterhead, title banner, summary stats, expenses table, footer
- Uses inline styles (same pattern as InvoiceTemplate) for html2canvas compatibility

### 2. MODIFY: `src/utils/pdfGenerator.ts`

Replace the current `jsPDF + autoTable` approach with the HTML-to-PDF pattern:
- Import React, `createRoot`, `html2canvas`, `jsPDF`
- Import `ExpensesReportTemplate`
- Render the template off-screen, capture with `html2canvas` at 2x scale, embed in jsPDF A4
- Same cleanup pattern as `invoiceGenerator.ts`
- Keep the same exported function signature `generateExpensesPdf(data)` so `ExpensesPage.tsx` needs no changes

### 3. No changes needed to `ExpensesPage.tsx`

The function signature stays the same, so the page component requires zero modifications.

## Technical Approach

The implementation follows the exact same pattern as `src/utils/invoiceGenerator.ts`:

1. Create off-screen container
2. Render React template with `createRoot`
3. Wait 500ms for render + images
4. Capture with `html2canvas` at 2x scale
5. Insert into jsPDF A4 document
6. Save and cleanup

