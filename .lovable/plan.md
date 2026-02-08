

# Fix Arabic Text Rendering in PDF Footer

## Problem
jsPDF does not have a built-in Arabic text shaping engine. Arabic letters change shape based on their position in a word (initial, medial, final, isolated), but jsPDF renders every character in its isolated form. This causes letters to appear disconnected, missing, or garbled in the generated PDF.

## Solution
Install the `arabic-reshaper` npm package and run all Arabic text through it before passing to jsPDF. This library converts standard Arabic Unicode characters into their correct "Presentation Forms" (Unicode block FB50-FDFF and FE70-FEFF), which are pre-shaped glyphs that render correctly without a text shaping engine.

Example:
- Input: `الحكمة للسياحة و الاسفار` (standard Unicode)
- Output: `ﺍﻟﺤﻜﻤﺔ ﻟﻠﺴﻴﺎﺣﺔ ﻭ ﺍﻻﺳﻔﺎﺭ` (presentation forms -- looks identical to a human reader but each glyph is pre-shaped)

## What Changes

### 1. Install `arabic-reshaper` package
Add the `arabic-reshaper` npm dependency to the project.

### 2. Create Arabic text utility
Create a helper function `reshapeArabic(text: string): string` in a new utility file that wraps the reshaper and also reverses the text for RTL rendering in jsPDF (since jsPDF does not handle RTL ordering either).

### 3. Apply reshaping to all Arabic text in PDF
Update `drawArabicFooter` in `invoiceGenerator.ts` to reshape all Arabic strings before calling `doc.text()`. This includes:
- Agency Arabic name (Line 1)
- Arabic address (Line 2)
- Arabic labels for RC, NIF, Article Fiscal, NIS, License, phone (Lines 3-5)

Also apply reshaping to any other Arabic text in the invoice body (labels like "العميل", "الخدمة", etc. when `isArabic` is true).

---

## Technical Details

### New file: `src/utils/arabicReshaper.ts`
- Import `arabic-reshaper` (or `ArabicReshaper.convertArabic`)
- Export a `reshapeArabic(text: string): string` function that:
  1. Splits the text by spaces to handle mixed Arabic/Latin content
  2. For Arabic segments: applies the reshaper to convert to presentation forms, then reverses character order for RTL
  3. For non-Arabic segments (numbers, Latin text): keeps as-is
  4. Reverses the word order so RTL reads correctly in jsPDF's LTR rendering

### File: `src/utils/invoiceGenerator.ts`
- Import `reshapeArabic` from the new utility
- In `drawArabicFooter`: wrap every Arabic string with `reshapeArabic()` before passing to `doc.text()`
  - Line 1: `reshapeArabic(info.arabicName)`
  - Line 2: `reshapeArabic(info.arabicAddress)`
  - Lines 3-5: reshape the Arabic label portions while keeping the numeric values intact
- In the main `generateClientInvoicePdf` function: apply `reshapeArabic()` to all Arabic labels used when `isArabic === true` (e.g., "العميل", "الاسم", "جواز السفر", "الخدمة", etc.)

### Package installation
- `arabic-reshaper` (npm package, ~5KB, MIT-compatible license)

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `arabic-reshaper` dependency |
| `src/utils/arabicReshaper.ts` | Create | Helper to reshape + reverse Arabic text for jsPDF |
| `src/utils/invoiceGenerator.ts` | Modify | Apply `reshapeArabic()` to all Arabic strings before rendering |

No database or backend changes needed. This is purely a frontend PDF rendering fix.

