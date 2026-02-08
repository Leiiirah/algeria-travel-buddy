

# Refactor Invoice PDF Generation: HTML-to-PDF Approach

## Overview
Replace the current imperative jsPDF coordinate-based invoice generation (~480 lines of manual layout math) with a React component-based approach. Invoices will be designed as styled HTML templates, rendered off-screen, captured with `html2canvas`, and converted to PDF with `jsPDF`. This eliminates all manual `currentY` tracking, font fetching, and Arabic reshaping complexity -- Arabic/RTL will work natively through CSS `direction: rtl` and the Tajawal font already loaded via Google Fonts CSS in `index.css`.

## What Changes

### 1. New Dependency
Install `html2canvas` -- the library that captures a DOM element as a rasterized canvas image.

### 2. Invoice HTML Template Component
A new React component (`InvoiceTemplate`) that renders the exact same invoice layout currently produced by the jsPDF code, but using standard HTML/CSS with Tailwind utility classes. This component is never shown to the user -- it is rendered off-screen solely for PDF capture.

### 3. Simplified PDF Generator
The new `generateClientInvoicePdf` function will:
1. Create a temporary off-screen container
2. Render the `InvoiceTemplate` React component into it
3. Capture it with `html2canvas` at 2x scale for crisp output
4. Insert the canvas image into a jsPDF A4 document
5. Clean up the temporary DOM element
6. Save the PDF file

### 4. Removal of Arabic Workarounds
Since HTML natively supports RTL text and the Tajawal font is already loaded via the Google Fonts CSS import in `index.css`, there is no longer any need for:
- The `arabic-reshaper` library calls in the invoice generator
- The `registerTajawalFont` async font-fetching logic for invoice rendering
- Manual `isInputRtl` jsPDF options

The `arabicReshaper.ts` and `tajawalFont.ts` utilities remain in the project because `pdfGenerator.ts` (expenses PDF) still uses jsPDF directly. Only the invoice generator is refactored.

---

## Technical Details

### New Dependency
```
html2canvas (latest)
```

### New File: `src/components/invoice/InvoiceTemplate.tsx`

A pure React component that accepts the same `ClientInvoicePdfData` interface and renders a pixel-perfect A4 invoice layout. The component uses:

- **Container**: Fixed 794px width (A4 at 96dpi), `font-family: 'Tajawal', sans-serif` for full Arabic support
- **Header**: Centered logo image, agency legal name, address, phone/email, RC/NIF/NIS
- **Title Banner**: Full-width rounded div with blue (#3B82F6) for proforma or green (#22644A) for finale, white text
- **Invoice Number**: Centered below banner with a subtle separator line
- **Client Section**: Bold "CLIENT" / "العميل" header with date aligned right; client name and passport below
- **Prestation Section**: Service name, itinerary (with plane icon), company, dates, travel class, PNR (finale only)
- **Financial Details Box**: Light gray rounded box showing ticket price, agency fees, separator, Total HT / TVA / Total TTC (finale) or just Total (proforma)
- **Payment + Signature Side-by-Side**: Left column shows payment method, bank details, amount in words (French). Right column shows "Cachet et Signature" header with empty space below
- **Conditions**: Proforma shows validity/payment terms + yellow warning banner. Finale shows "non-remboursable" note
- **Arabic Footer**: 5 centered lines using Tajawal font -- Arabic agency name (bold), Arabic address, RC/NIF/Article Fiscal labels, NIS/License labels, phone numbers
- **Timestamp**: Small gray generation date at bottom-right

All Arabic text uses native HTML `dir="rtl"` attributes -- no reshaping needed.

The component accepts a `forwardRef` to expose the root div for `html2canvas` capture.

### Modified File: `src/utils/invoiceGenerator.ts`

Complete rewrite. The file keeps the same exported interface (`ClientInvoicePdfData`, `AgencyInfoParam`, `generateClientInvoicePdf`) for backward compatibility. The implementation changes to:

```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import { InvoiceTemplate } from '@/components/invoice/InvoiceTemplate';

export async function generateClientInvoicePdf(data: ClientInvoicePdfData): Promise<void> {
  // 1. Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  // 2. Render the React template
  const root = createRoot(container);
  root.render(<InvoiceTemplate data={data} />);
  
  // Wait for render + images to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Capture with html2canvas
  const templateEl = container.firstElementChild as HTMLElement;
  const canvas = await html2canvas(templateEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  // 4. Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
  
  // 5. Save
  pdf.save(`${data.invoiceType === 'proforma' ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`);

  // 6. Cleanup
  root.unmount();
  document.body.removeChild(container);
}
```

### Unchanged Files
- `src/utils/pdfGenerator.ts` -- Expenses PDF stays as-is (uses jsPDF + autoTable, which is the right tool for tabular data)
- `src/utils/arabicReshaper.ts` -- Kept for potential use by other modules
- `src/utils/tajawalFont.ts` -- Kept for potential use by expenses PDF if Arabic support is added later
- `src/utils/numberToWords.ts` -- Still used by the invoice template for amount-in-words
- `src/pages/InvoicesPage.tsx` -- No changes needed, same `generateClientInvoicePdf` call
- `src/pages/CommandsPage.tsx` -- No changes needed, same `generateClientInvoicePdf` call
- `src/constants/agency.ts` -- Unchanged

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `html2canvas` dependency |
| `src/components/invoice/InvoiceTemplate.tsx` | Create | React component rendering the full A4 invoice layout with Tailwind + inline styles |
| `src/utils/invoiceGenerator.ts` | Rewrite | Replace ~480 lines of imperative jsPDF with ~60 lines using html2canvas + React rendering |

### Key Benefits
- **Native Arabic/RTL**: No more `arabic-reshaper` or font-fetching for invoices. HTML handles BiDi text natively with the Tajawal font already loaded
- **CSS-based Layout**: Use flexbox, padding, margins -- no manual coordinate math
- **Easy to Modify**: Adding fields or rearranging sections is just editing JSX/Tailwind classes
- **Visual Debugging**: The template component can be temporarily rendered on-screen to preview exactly what the PDF will look like
- **Same API Surface**: Callers (`InvoicesPage`, `CommandsPage`) need zero changes

### Trade-offs
- **Rasterized Text**: PDF text will be an image (not selectable/searchable). This is acceptable for official invoices that are typically printed or shared as-is
- **Slightly Larger File Size**: PNG-based PDFs are ~200-400KB vs ~50KB for vector jsPDF. Acceptable for single-page invoices
- **Render Delay**: ~500ms wait for React render + html2canvas capture. Imperceptible to users compared to the current font-fetching delay

