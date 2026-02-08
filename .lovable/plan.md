

# Simplify PDF Footer and Fix Arabic Misspellings

## Overview
Remove the background container from the PDF footer, fix Arabic text errors in both the footer and the fallback constants, and use the corrected Arabic labels for legal identifiers and contact info. The footer becomes clean, centered text at the bottom of the page using the Tajawal font.

## What Changes

### 1. Remove Footer Container
- Delete the beige background fill (`#F5F0E6`) and gold border (`#C9B896`)
- Delete the `roundedRect` call that draws the container box
- Keep the footer text positioned at the bottom of the page, but render it as plain centered text on a white background

### 2. Fix Arabic Misspellings
Update the following strings in both the `drawArabicFooter` function and the fallback constants in `src/constants/agency.ts`:

| Current (incorrect) | Corrected |
|---|---|
| الحكمة لسياحة و الأسفار | الحكمة للسياحة والأسفار |
| 02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر | 02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر |

### 3. Use Full Arabic Labels for Legal IDs
Replace the short Latin abbreviations in the footer's legal line with proper Arabic labels rendered in Tajawal:

| Current | Corrected |
|---|---|
| `RC: {value}` | `رقم السجل التجاري: {value}` |
| `NIF: {value}` | `رقم التعريف الجبائي: {value}` |
| `NIS: {value}` | `رقم التعريف الإحصائي: {value}` |
| `Licence: {value}` | `رقم رخصة الوكالة: {value}` |

### 4. Keep Correct Contact Labels
The phone labels "المكتب" (Office) and "الجوال" (Mobile) are already correct in the code and will remain unchanged.

### 5. Font Consistency
- Line 1 (Agency Name): Tajawal Bold
- Lines 2-4 (Address, Legal, Phones): Tajawal Regular
- The legal line currently falls back to Helvetica -- this will be changed to Tajawal as well

### 6. Spacing
Position the footer with adequate whitespace above it so it does not crowd the Reglement/Signature sections. The footer will start at `pageHeight - 30` (bottom of page with margin), giving clear separation from content above.

---

## Technical Details

### File: `src/utils/invoiceGenerator.ts`

**Changes to `drawArabicFooter` function (lines 122-187):**

1. **Remove container drawing** (lines 131-135): Delete `setFillColor`, `setDrawColor`, `setLineWidth`, and `roundedRect` calls.
2. **Reposition text**: Start footer text from `pageHeight - 28` instead of relative to a box.
3. **Fix text color**: Change from brown `(80, 60, 30)` to a standard dark gray `(60, 60, 60)` since there is no beige background to contrast against.
4. **Legal line font** (line 167): Change from `doc.setFont('helvetica', 'normal')` to use Tajawal, so the Arabic legal labels render correctly.
5. **Replace legal label strings** (lines 163-166): Use the full Arabic labels instead of "RC:", "NIF:", "NIS:", "Licence:".

### File: `src/constants/agency.ts`

**Fix fallback Arabic strings (lines 15-16):**
- `arabicName`: Change from `'الحكمة لسياحة و الأسفار'` to `'الحكمة للسياحة والأسفار'`
- `arabicAddress`: Change from `'02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر'` to `'02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر'`

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/invoiceGenerator.ts` | Modify | Rewrite `drawArabicFooter`: remove container, fix Arabic labels, use Tajawal for all lines |
| `src/constants/agency.ts` | Modify | Fix misspelled arabicName and arabicAddress fallback values |

No changes to the Contact Settings page, hooks, or backend -- the dynamic data pipeline remains intact.

