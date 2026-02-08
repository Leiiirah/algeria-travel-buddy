

# Unify Commands PDF to Match Factures Design

## What Changes

The "Print Invoice" action from the Commands three-dots menu currently calls `generateInvoicePdf()` which produces an older, blue-accented layout. This plan will switch it to call `generateClientInvoicePdf()` -- the same function used by the Factures tab -- so both produce identical PDF designs.

## How It Works

The Commands table already has all the data needed (client name, service, destination, prices, etc.). The change maps Command fields to the same data structure that the Factures PDF generator expects:

- **Client Name** from `command.data.clientFullName`
- **Service Name** from the linked service record
- **Destination** from `command.destination`
- **Total Amount** from `command.sellingPrice`
- **Paid Amount** from `command.amountPaid`
- **Company** from `command.data.company` (for ticket services)
- **Invoice Number** auto-generated from the command ID (e.g., `CMD-A1B2C3`)
- **Invoice Type** defaults to `proforma` (since commands are quick prints, not official accounting documents)

## Technical Details

### File: `src/pages/CommandsPage.tsx`

**Update the `handlePrintInvoice` function (lines 373-393):**

Replace the call to `generateInvoicePdf(...)` with `generateClientInvoicePdf(...)`, mapping command data to the `ClientInvoicePdfData` interface:

```typescript
const handlePrintInvoice = async (command: any) => {
  const service = services?.find((s) => s.id === command.serviceId);
  const supplier = suppliers?.find((s) => s.id === command.supplierId);

  await generateClientInvoicePdf({
    invoiceNumber: `CMD-${command.id.substring(0, 6).toUpperCase()}`,
    invoiceType: 'proforma',
    clientName: command.data.clientFullName || '',
    clientPhone: command.data.phone || '',
    clientPassport: '',
    invoiceDate: format(new Date(command.createdAt), 'dd/MM/yyyy'),
    totalAmount: Number(command.sellingPrice),
    paidAmount: Number(command.amountPaid),
    remaining: Number(command.sellingPrice) - Number(command.amountPaid),
    serviceName: service?.name || '',
    serviceType: service?.type || '',
    destination: command.destination || '',
    companyName: command.data.company || '',
    departureDate: '',
    returnDate: '',
    travelClass: '',
    pnr: '',
    ticketPrice: 0,
    agencyFees: 0,
    paymentMethod: '',
    validityHours: 48,
    status: command.status,
    language: (localStorage.getItem('i18nextLng') || 'fr') as 'fr' | 'ar',
  });
};
```

**Update the import (line 59):**

Change from importing `generateInvoicePdf` to `generateClientInvoicePdf`:

```typescript
import { generateClientInvoicePdf } from '@/utils/invoiceGenerator';
```

### Summary

| File | Change |
|------|--------|
| `src/pages/CommandsPage.tsx` | Switch `handlePrintInvoice` from `generateInvoicePdf` to `generateClientInvoicePdf` with field mapping; update import |

No new files, no backend changes. The old `generateInvoicePdf` function remains in the codebase (it can be cleaned up later if no longer used elsewhere).
