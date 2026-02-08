
# Tajawal Font Integration + Arabic Footer for PDF Engine

## Overview
Update the PDF generation engine to use the Tajawal font for proper Arabic text rendering and add a professional Arabic footer block with agency legal details at the bottom of every invoice PDF.

## What Changes

### 1. Tajawal Font for jsPDF
jsPDF only supports 14 standard PDF fonts (Helvetica, Courier, Times, etc.) and cannot render Arabic characters natively. Currently, any Arabic text in the PDFs renders as garbled characters or question marks. To fix this:

- Download the Tajawal font `.ttf` file (Regular and Bold weights)
- Convert to Base64 using the jsPDF font converter
- Create a font registration module that adds Tajawal to jsPDF at runtime
- Use Tajawal for all Arabic labels and the Arabic footer

### 2. Arabic Footer Block
Add a centered, multi-line Arabic footer at the bottom of every generated PDF page with:
- Agency Arabic name: الحكمة لسياحة و الأسفار
- Arabic address: 02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر
- Legal identifiers: RC, NIF, NIS, License Number
- Contact phones: mobile and office numbers
- Styled with a light beige background (#F5F0E6) and gold/brown border (#C9B896)

### 3. Number-to-Words Utility
Create a French number-to-words converter (as seen in the sample PDF: "Douze mille neuf cent soixante-treize virgule dix-huit") for displaying the total amount in written text.

### 4. Layout Matching the Sample PDF
Update the PDF layout to match the provided sample more closely:
- Two-column EMETTEUR / DESTINATAIRE layout
- Description table with Prix Unitaire, Quantite, Total columns
- Right-aligned financial summary (TOTAL HT, TVA, REMISE, TOTAL TTC)
- Left-aligned REGLEMENT section with bank details
- Amount-in-words line at the bottom of the financial section

---

## Technical Details

### New File: `src/utils/tajawalFont.ts`
Contains the Tajawal font encoded as Base64 strings (Regular + Bold weights) and a `registerTajawalFont(doc: jsPDF)` function that calls `doc.addFileToVFS()`, `doc.addFont()`, and makes the font available via `doc.setFont('Tajawal', ...)`.

**Font loading approach:**
- The Tajawal `.ttf` files will be fetched from Google Fonts CDN at PDF generation time
- Converted to Base64 dynamically using `fetch()` + `FileReader`
- Cached in memory after first load to avoid repeated downloads
- Fallback: if font loading fails, the PDF falls back to Helvetica (current behavior)

### New File: `src/utils/numberToWords.ts`
French number-to-words converter:
- Handles units (0-19), tens (20-90), hundreds, thousands, millions
- Handles decimals ("virgule" + decimal part)
- Follows French grammar rules (e.g., "et un" for 21, "quatre-vingts" for 80)
- Example: `numberToWords(12973.18)` returns `"Douze mille neuf cent soixante-treize virgule dix-huit"`

### Modified File: `src/utils/invoiceGenerator.ts`

**Changes to `generateClientInvoicePdf`:**

1. **Font registration**: Call `registerTajawalFont(doc)` at the start; use `doc.setFont('Tajawal', 'normal')` for Arabic text sections
2. **Header redesign**: Match the sample layout
   - Logo (left) + "FACTURE PROFORMA" title (right, large text)
   - Date on left below separator
   - "FACTURE proforma N: XXXX" centered
3. **Two-column info block**:
   - Left column: EMETTEUR -- agency name, address, phone, email, NIS, NIF, RC
   - Right column: DESTINATAIRE -- client name, passport/city
4. **Description table**: Using autoTable with columns: Description, Prix Unitaire, Quantite, Total
5. **Financial summary** (right-aligned):
   - TOTAL HT
   - TVA 9% (or 0% depending on config)
   - REMISE (discount line, dash if none)
   - TOTAL TTC (bold)
6. **Payment section** (left-aligned):
   - REGLEMENT label
   - Payment method
   - Bank details (Banque + Compte)
   - "arrete la presente facture [proforma] a la somme de" + amount in words
7. **Arabic footer block** (bottom of page):
   - Light beige background (#F5F0E6) with gold/brown border (#C9B896)
   - Agency Arabic name in Tajawal Bold
   - Arabic address, legal IDs, phone numbers
   - Centered, ~8-9pt font size
   - Positioned above the page bottom margin so it does not overlap content
8. **Color scheme**: Black/gray/white minimalist palette replacing blue accents

**Changes to `generateInvoicePdf`** (legacy function):
- Add the same Arabic footer block for consistency
- Register Tajawal font

**Updated `AgencyInfoParam` interface**:
- Add optional fields: `bankName`, `bankAccount`, `mobilePhone`, `licenseNumber`, `arabicName`, `arabicAddress`

### Modified File: `src/constants/agency.ts`
Add new fields to the fallback constants:
```
bankName: 'ccp',
bankAccount: '00799999001499040728',
mobilePhone: '0770236424',
licenseNumber: '',
arabicName: 'الحكمة لسياحة و الأسفار',
arabicAddress: '02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر',
```

### Modified File: `src/pages/ContactPage.tsx`
Add new editable fields to the Contact settings form:
- Mobile Phone
- Bank Name
- Bank Account
- License Number
- Arabic Name (with `dir="rtl"`)
- Arabic Address (with `dir="rtl"`)

### Modified Files: Translation updates
**`src/i18n/locales/fr/common.json`** and **`src/i18n/locales/ar/common.json`**:
- Add translation keys for new Contact form fields: `mobilePhone`, `bankName`, `bankAccount`, `licenseNumber`, `arabicName`, `arabicAddress`

### Backend: Agency Settings Seed Update
**`server/src/agency-settings/agency-settings.service.ts`**:
- Add the new keys (`bankName`, `bankAccount`, `mobilePhone`, `licenseNumber`, `arabicName`, `arabicAddress`) to `DEFAULT_SETTINGS` so they are seeded on first run

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/tajawalFont.ts` | Create | Tajawal font loader and jsPDF registration |
| `src/utils/numberToWords.ts` | Create | French number-to-words converter |
| `src/utils/invoiceGenerator.ts` | Rewrite | New layout matching sample + Tajawal + Arabic footer |
| `src/constants/agency.ts` | Modify | Add bank, mobile, Arabic name/address fields |
| `src/pages/ContactPage.tsx` | Modify | Add new fields to admin settings form |
| `server/src/agency-settings/agency-settings.service.ts` | Modify | Add new default keys to seed |
| `src/i18n/locales/fr/common.json` | Modify | Add new field labels |
| `src/i18n/locales/ar/common.json` | Modify | Add new field labels |

No database migration is required -- the existing key-value `agency_settings` table handles new keys automatically.
