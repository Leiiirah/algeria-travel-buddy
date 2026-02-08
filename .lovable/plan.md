

# Unify Command Invoice with Factures Invoice Layout

## Overview
Both the Commands tab and the Factures (Invoices) tab already call the **same** PDF function (`generateClientInvoicePdf`), so the visual layout (header, banner, financial box, footer) is identical. The difference is that the Commands page passes empty/zero values for several fields (departure date, return date, travel class, PNR, ticket price, agency fees, payment method), which makes the resulting PDF look sparser.

This plan enriches the data passed from the Commands page so that every available field appears in the PDF, and removes the unused legacy function to keep the codebase clean.

## What Changes

### 1. Enrich Command Invoice Data
Update `handlePrintInvoice` in `CommandsPage.tsx` to extract and pass all available data from the command record:

| Field | Current value | New value |
|-------|--------------|-----------|
| `departureDate` | `''` (empty) | Extracted from `command.data.departureDate` if present, formatted with `date-fns` |
| `returnDate` | `''` (empty) | Extracted from `command.data.returnDate` if present |
| `travelClass` | `''` (empty) | Extracted from `command.data.travelClass` if present |
| `pnr` | `''` (empty) | Extracted from `command.data.pnr` if present |
| `ticketPrice` | `0` | Set to `command.buyingPrice` (the cost price is the ticket price in context of a command) |
| `agencyFees` | `0` | Calculated as `sellingPrice - buyingPrice` (the agency margin) |
| `paymentMethod` | `''` (empty) | Extracted from `command.data.paymentMethod` if present |
| `companyName` | From `command.data.company` | Already correct, no change needed |

The PDF function already handles missing/zero values gracefully (it skips rendering empty fields), so this is backward-compatible.

### 2. Remove Dead Legacy Function
Delete the `generateInvoicePdf` function (lines 172-353 of `invoiceGenerator.ts`) and its associated `InvoiceData` interface (lines 9-25). This function is not imported or called anywhere in the codebase. Removing it:
- Reduces file size by ~180 lines
- Eliminates confusion about which function to use
- Keeps a single source of truth for invoice PDF generation

## Technical Details

### File: `src/pages/CommandsPage.tsx`

**Changes to `handlePrintInvoice` (lines 375-403):**

Update the data object passed to `generateClientInvoicePdf`:
- Extract `departureDate` and `returnDate` from `command.data`, format with `date-fns` if present
- Extract `travelClass` and `pnr` from `command.data`
- Set `ticketPrice` to `Number(command.buyingPrice)` and `agencyFees` to `Number(command.sellingPrice) - Number(command.buyingPrice)`
- Extract `paymentMethod` from `command.data` if available

### File: `src/utils/invoiceGenerator.ts`

**Remove dead code (lines 7-25 and 172-353):**

1. Delete the `InvoiceData` interface (lines 9-25) -- no longer needed
2. Delete the entire `generateInvoicePdf` function (lines 172-353) -- never called anywhere
3. Keep everything else unchanged: `AgencyInfoParam`, `ClientInvoicePdfData`, helpers, `drawArabicFooter`, and `generateClientInvoicePdf`

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/CommandsPage.tsx` | Modify | Pass richer data (dates, class, PNR, ticket breakdown) to `generateClientInvoicePdf` |
| `src/utils/invoiceGenerator.ts` | Modify | Remove unused `InvoiceData` interface and `generateInvoicePdf` function (~180 lines) |

No backend changes, no new dependencies, no database changes required.

