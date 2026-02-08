

# Fix Arabic Text Double-Reversal and Visual Ordering in PDF

## Problem
The current `reshapeArabic` function uses a word-by-word approach: it splits text by spaces, reverses characters within each word, then reverses word order. This causes two issues:

1. **Double-reversal artifacts** -- When Arabic Presentation Forms (ligatures like Lam-Alef) are split and reversed per-word, the positional glyphs end up in wrong positions, causing missing or garbled letters (e.g., "ةمكحل" instead of "الحكمة").
2. **Number corruption** -- Numbers embedded in Arabic text (like in the address "09001") get caught up in the reversal and appear scrambled.

## Solution
Replace the word-based reversal with a **run-based Bidi algorithm** that:
- Segments text into directional runs (Arabic vs digits/Latin) at the character level
- Reverses only Arabic runs, leaving numbers and Latin text intact
- Reverses the overall run order to achieve visual RTL in jsPDF's LTR engine

## Changes

### 1. Rewrite `src/utils/arabicReshaper.ts`

Replace the current word-splitting approach with run-based logic:

```text
Current flow (broken):
  text -> reshape -> split by spaces -> reverse each word -> reverse word order

New flow (correct):
  text -> reshape -> split into character-level runs (Arabic vs non-Arabic)
       -> reverse chars within Arabic runs only
       -> reverse overall run order
```

**New `reshapeArabic` function:**
- Step 1: Apply `ArabicReshaper.convertArabic()` for presentation forms (joining/shaping)
- Step 2: Walk character-by-character, classify each as Arabic (U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF) or non-Arabic (digits, Latin)
- Step 3: Group into contiguous directional runs. Neutral characters (spaces, punctuation like ، and :) attach to the current run
- Step 4: Reverse characters within each Arabic run only
- Step 5: Reverse the order of all runs (so RTL base direction is achieved)

**Updated `reshapeArabicLabel` function:**
- Keep the same `value :reshapedLabel` pattern (already correct for visual RTL in LTR rendering)

### 2. Update Arabic strings in `src/constants/agency.ts`

Update `arabicName` to the exact string requested:
- From: `'الحكمة للسياحة و الاسفار'`
- To: `'الحكمة للسياحة والأسفار'`

### 3. Update server defaults in `server/src/agency-settings/agency-settings.service.ts`

Same `arabicName` update:
- From: `'الحكمة للسياحة و الاسفار'`
- To: `'الحكمة للسياحة والأسفار'`

### 4. Update footer in `src/utils/invoiceGenerator.ts`

**`drawArabicFooter` changes:**
- Increase agency name font size to **12pt** (from 10pt) for header emphasis
- Keep detail lines at **8pt** for consistency
- Use `align: 'center'` for footer (designed as centered block)
- Ensure Tajawal font is set for all 5 lines

**Body Arabic content alignment (when `isArabic === true`):**
- Update section headers (CLIENT, PRESTATION, etc.) to use `align: 'right'` at `pageWidth - 14`
- Update label lines (Nom, Passeport, Itineraire, etc.) to use right-aligned positioning
- Update financial labels to right-align
- Update Reglement section header and labels
- Keep non-Arabic values (dates, numbers, amounts) left-aligned or right-aligned as appropriate

This means when Arabic is selected, the invoice body flips to an RTL layout where:
- Labels anchor from the right margin
- Values appear to their left
- Section headers are right-aligned

### 5. Font size consistency

Standardize across the PDF:
- Footer agency name: **12pt** bold
- Footer details (address, legal IDs, phones): **8pt** normal
- Body section headers: **11pt** bold (unchanged)
- Body labels: **10pt** normal (unchanged)

---

## Technical Details

### File: `src/utils/arabicReshaper.ts` (full rewrite)

New helper functions:
- `isArabicChar(ch)` -- unchanged, detects Arabic Unicode ranges
- `isDigitOrLatin(ch)` -- new, detects ASCII digits (0x30-0x39) and Latin letters (0x41-0x5A, 0x61-0x7A)
- `containsArabic(text)` -- unchanged
- `splitIntoRuns(text)` -- new, segments text into `{ text: string, isRTL: boolean }[]` runs at the character level, with neutral characters inheriting the direction of the preceding strong character
- `reshapeArabic(text)` -- rewritten to use run-based approach
- `reshapeArabicLabel(label, value)` -- unchanged logic

### File: `src/constants/agency.ts` (line 16)

Change `arabicName` value from `'الحكمة للسياحة و الاسفار'` to `'الحكمة للسياحة والأسفار'`.

### File: `server/src/agency-settings/agency-settings.service.ts` (line 19)

Change `arabicName` value from `'الحكمة للسياحة و الاسفار'` to `'الحكمة للسياحة والأسفار'`.

### File: `src/utils/invoiceGenerator.ts`

**Footer (`drawArabicFooter`, lines 107-160):**
- Line 120: Change `doc.setFontSize(10)` to `doc.setFontSize(12)` for agency name
- Line 131: Keep `doc.setFontSize(8)` for address
- Line 136: Keep `doc.setFontSize(7)` for legal details (or increase to 8 for consistency)

**Body Arabic alignment (lines 196-466):**
When `isArabic` is true, update positioning for:
- Agency header address/phone lines (lines 200-209): right-align at `pageWidth - 14`
- Client section header and labels (lines 243-258): right-align
- Date label (line 249): left-align at `14` (flipped from current)
- Service section header and labels (lines 261-311): right-align
- Financial section header (line 318): right-align
- Financial labels inside the box (lines 342-372): use `valueX` for labels, `labelX` for amounts (swap)
- Reglement section (lines 387-420): right-align headers and labels
- Cachet et Signature (line 428): left-align at `14` (flipped from current right)
- Conditions/notes (lines 436-465): right-align

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/arabicReshaper.ts` | Rewrite | Run-based Bidi logic replacing word-based reversal |
| `src/constants/agency.ts` | Modify | Correct `arabicName` string |
| `server/src/agency-settings/agency-settings.service.ts` | Modify | Correct `arabicName` default |
| `src/utils/invoiceGenerator.ts` | Modify | Font sizes, RTL body alignment for Arabic mode |

No database changes needed.

