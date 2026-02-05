
# Add Professional Arabic Footer to Invoice PDFs

## Overview

This plan adds a professional Arabic footer at the bottom of each invoice PDF, matching the design in the provided image. The footer will display the agency's complete legal information in Arabic with a clean, professional appearance.

## Footer Design (Based on Image)

The footer will display centered at the bottom of the invoice:

```text
─────────────────────────────────────────────────
                الحكمة لسياحة و الأسفار
   02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر
 رقم السجل التجاري: 12ب0807686-09/00 | رقم التعريف الجبائي: 001209080768687 | رقم المادة الجبائية: 00120908076
        رقم التعريف الإحصائي: 001209010019858 | رقم رخصة الوكالة: 1500
          الجوال: 0770236424 | المكتب: 020475949
─────────────────────────────────────────────────
```

## Changes Required

### 1. Update Agency Constants (`src/constants/agency.ts`)

Add new Arabic-specific fields and update phone numbers:

| Field | Current | New |
|-------|---------|-----|
| `phone` | `025 XX XX XX` | `020475949` |
| `mobile` | (none) | `0770236424` |
| `nameAr` | (none) | `الحكمة لسياحة و الأسفار` |
| `addressAr` | (none) | `02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر` |

Add full Arabic legal details:
- `rcAr`: `12ب0807686-09/00`
- `nifAr`: `001209080768687`
- `articleFiscal`: `00120908076`
- `nis`: `001209010019858`
- `licenseNumber`: `1500`

### 2. Update Invoice PDF Generator (`src/utils/invoiceGenerator.ts`)

Add a new function to render the professional Arabic footer at the bottom of both invoice types:

**Footer Section Implementation:**
- Background: Light beige/cream color (#F5F0E6) matching the design
- Text color: Gold/brown (#C9B896) for the company name
- Content: All legal information centered
- Position: Fixed at bottom of page (before the page ends)

**Font Note:** jsPDF doesn't natively support custom fonts like Tajawal. For Arabic text, we'll use a clean sans-serif style with proper Arabic text rendering. If Tajawal font embedding is required, a separate font file would need to be added to the project.

### 3. Footer Content Structure

```text
Line 1: الحكمة لسياحة و الأسفار (in gold/beige color - #C9B896)
Line 2: 02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر
Line 3: رقم السجل التجاري: 12ب0807686-09/00 | رقم التعريف الجبائي: 001209080768687 | رقم المادة الجبائية: 00120908076
Line 4: رقم التعريف الإحصائي: 001209010019858 | رقم رخصة الوكالة: 1500
Line 5: الجوال: 0770236424 | المكتب: 020475949
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/constants/agency.ts` | Add Arabic fields, update phone numbers, add all legal identifiers |
| `src/utils/invoiceGenerator.ts` | Add professional footer function and apply to both PDF generators |

## Technical Notes

### Font Considerations
- jsPDF has limited Arabic font support with the default Helvetica font
- For proper Arabic rendering with Tajawal font, a custom font file would need to be embedded
- The implementation will use jsPDF's built-in text rendering which supports RTL Arabic text

### Layout
- Footer positioned at fixed Y position from bottom (~50mm from page end)
- Light background box spanning full width with subtle border
- Company name emphasized with larger font and accent color
- All text centered for professional appearance

## Expected Result

After implementation, every generated invoice (both Proforma and Final) will include a professional Arabic footer at the bottom with:
- Agency name in Arabic with distinctive styling
- Complete address
- All legal registration numbers (RC, NIF, NIS, License)
- Updated phone numbers: 020475949 (office) and 0770236424 (mobile)
