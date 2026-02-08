

# Refactor PDF Engine: Dynamic Agency Data + Tajawal Branding + Arabic Footer

## Overview
Refactor the entire PDF generation engine (`invoiceGenerator.ts`) so that **all** agency data is pulled dynamically from the Contact Settings (via the `agencyInfo` parameter), with the hardcoded `AGENCY_INFO` constants serving only as a fallback. The layout remains strictly **centered and minimalist**, with the **Tajawal** font used for all branding/Arabic elements. The Arabic footer block is already present but will be refined per your specifications.

## What Changes

### 1. Agency Header -- Fully Dynamic, Centered
Currently the header uses `mergeAgencyInfo()` which already merges dynamic settings with fallback constants. The refactor ensures:
- **Logo**: Centered at the top (already in place, no change).
- **Agency Name**: Centered below the logo, rendered in **Tajawal Bold** font for brand consistency.
- **Contact Line**: Address, Phone/Mobile, and Email centered underneath.
- **Legal IDs Line**: NIF, NIS, and RC displayed as a centered line -- all values pulled dynamically from the Contact Settings API.

### 2. Invoice Title Banner
Replace the plain text title with a **full-width colored banner**:
- **Proforma**: Blue background (#3B82F6) with white text "FACTURE PROFORMA".
- **Finale**: Green background (#22644A) with white text "FACTURE DEFINITIVE".
- Invoice number displayed centered below the banner.

### 3. Financial Section Enhancements
- Keep the right-aligned financial summary box.
- For **Final Invoices**: Display Total HT, TVA (0%), and Total TTC as separate lines (already present).
- Continue using `numberToWords` utility for the amount-in-words line in the REGLEMENT section.
- No changes to the calculation logic -- it already works correctly.

### 4. Arabic Footer Refinement
The footer (`drawArabicFooter`) is already implemented with the beige background and gold border. Refinements:
- Ensure Line 1 uses the **dynamic** `arabicName` from Contact Settings.
- Ensure Line 2 uses the **dynamic** `arabicAddress`.
- Ensure Line 3 shows dynamic RC, NIF, NIS, and License Number.
- Ensure Line 4 shows dynamic phone numbers with Arabic labels.
- All Arabic text rendered in **Tajawal** font.
- Footer is already centered; no alignment changes needed.

### 5. Legacy Function Update
The `generateInvoicePdf` function (for Commands) currently does not accept `agencyInfo` as a parameter. It will be updated to accept it, matching the same pattern as `generateClientInvoicePdf`. The agency name in the legacy function will also use Tajawal.

---

## Technical Details

### File: `src/utils/invoiceGenerator.ts`

**Changes to `generateClientInvoicePdf`:**

1. **Header typography** (lines 390-393): Change the agency name from `doc.setFont('helvetica', 'bold')` to `doc.setFont('Tajawal', 'bold')` (with fallback to helvetica if Tajawal failed to load).

2. **Invoice title banner** (lines 418-427): Replace plain centered text with a full-width filled rectangle:
   - Proforma: Blue (#3B82F6) background, white bold text
   - Finale: Green (#22644A) background, white bold text
   - Banner spans from margin to margin with rounded corners

3. **Section headers** (lines 444, 462, 515): Change section header color from blue (#3B82F6) to dark gray (#333333) for a more minimalist look, keeping the colored banner as the only accent.

4. **No changes** to: Client section, Service/Prestation section, Financial calculations, REGLEMENT section, Conditions section, Stamp/Signature section, or the Arabic footer (it already works correctly with dynamic data).

**Changes to `generateInvoicePdf` (legacy):**

1. Add `agencyInfo?: AgencyInfoParam` parameter to the `InvoiceData` interface.
2. Call `mergeAgencyInfo(data.agencyInfo)` instead of `mergeAgencyInfo()`.
3. Use Tajawal for the agency name in the header.

**Changes to `drawArabicFooter`:**
- No structural changes needed -- it already uses the dynamic `info` object passed from the calling function. Just ensure all Arabic text lines explicitly set the Tajawal font before rendering.

### File: `src/pages/CommandsPage.tsx`
- No changes needed -- already passes `agencyInfo: agencySettings || undefined` to the PDF generator.

### File: `src/pages/InvoicesPage.tsx`
- No changes needed -- already passes `agencyInfo: agencySettings || undefined` to the PDF generator.

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/invoiceGenerator.ts` | Modify | Use Tajawal for agency name; add colored title banner; update legacy function to accept agencyInfo; refine section header colors |

This is a focused refactor touching only the PDF generator file. All dynamic data plumbing (Contact Settings API, `useAgencySettings` hook, `mergeAgencyInfo` fallback) is already in place and working correctly.
