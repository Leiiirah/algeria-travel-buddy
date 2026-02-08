

# Fix PDF Invoice Bottom Overflow

## Problem
The invoice PDF content overflows past the Arabic footer at the bottom of the page. The layout uses a "top-down" approach where each section adds to a running `currentY` value, but the footer is positioned at a fixed `pageHeight - 28`. When all optional fields are populated, the body content collides with (and runs past) the footer.

**Current overflow math (worst case with all fields):**
- Usable content area: ~267mm (footer starts at pageHeight - 28 = 269mm)
- Content reaches: ~344mm (stamp box bottom)
- Overflow: ~77mm past the footer

## Solution
Tighten the vertical spacing throughout the document and reduce the signature box size so everything fits cleanly on a single A4 page. Add an overflow safety check that pushes the stamp/signature to a second page if content is unusually long.

## What Changes

### 1. Reduce Vertical Spacing
Tighten the gaps between sections to reclaim vertical space without sacrificing readability:

| Location | Current gap | New gap | Savings |
|----------|------------|---------|---------|
| Between header lines | 6mm, 5mm, 5mm | 5mm, 4mm, 4mm | 3mm |
| Header to banner | 8mm | 6mm | 2mm |
| Banner to invoice # | 6mm | 4mm | 2mm |
| Invoice # to separator | 6mm | 4mm | 2mm |
| Separator to Client | 10mm | 7mm | 3mm |
| Client to Prestation | 14mm | 10mm | 4mm |
| Service detail lines | 6mm each | 5mm each | ~5mm |
| Prestation to Financial | 14mm | 10mm | 4mm |
| Financial box to Reglement | 12mm | 8mm | 4mm |
| Reglement internal gaps | 6mm, 5mm, 8mm | 5mm, 4mm, 6mm | 4mm |
| Conditions/Note to Stamp | 8mm | 4mm | 4mm |

**Total savings: ~37mm** -- more than enough to prevent overflow.

### 2. Reduce Signature Box
Shrink the empty signature box from 35mm to 25mm tall. This saves 10mm and is still sufficient for a stamp/signature.

### 3. Overflow Safety Check
Before drawing the Stamp and Signature section, check if `currentY` would exceed the footer zone (`pageHeight - 60`). If it would, add a new page and draw the stamp at the top of page 2, then draw the footer on that page instead.

### 4. Fix Financial Box Y-tracking
The current code has a confusing `currentY += boxHeight - (hasBreakdown ? 42 : 26)` calculation that doesn't properly track where the box ends. Replace this with a clean calculation: set `currentY` to the actual bottom of the box (`boxStartY + boxHeight`).

---

## Technical Details

### File: `src/utils/invoiceGenerator.ts`

**Spacing reductions (lines 178-467):**
- Line 188: Change `currentY += 6` to `currentY += 5` (header line 2)
- Line 194: Change `currentY += 5` to `currentY += 4` (header line 3)
- Line 200: Change `currentY += 5` to `currentY += 4` (header line 4)
- Line 206: Change `currentY += 8` to `currentY += 6` (header to banner)
- Line 224: Change `currentY += bannerHeight + 6` to `currentY += bannerHeight + 4`
- Line 229: Change `currentY += 6` to `currentY += 4` (separator)
- Line 235: Change `currentY += 10` to `currentY += 7` (separator to client)
- Line 253: Change `currentY += 14` to `currentY += 10` (client to prestation)
- Lines 266, 273, 278, 287: Change `currentY += 6` to `currentY += 5` (service details)
- Line 306: Change `currentY += 14` to `currentY += 10` (prestation to financial)
- Line 371: Change `currentY += 12` to `currentY += 8` (financial to reglement)
- Lines 379, 391: Change `currentY += 6` to `currentY += 5` (reglement internals)
- Line 393: Change `currentY += 5` to `currentY += 4`
- Line 398: Change `currentY += 8` to `currentY += 6` (to amount words)

**Fix financial box tracking (line 368):**
Replace `currentY += boxHeight - (hasBreakdown ? 42 : 26)` with:
```
currentY = (currentY - 2) + boxHeight + 2;
```
where `currentY - 2` is the box top Y (from the roundedRect call at line 322).

**Actually, better approach:** Save the box start Y before the box content, then after the box set `currentY = boxStartY + boxHeight`.

**Signature box (line 456):**
Change height from 35 to 25:
```
doc.roundedRect(pageWidth / 2 - 40, currentY, 80, 25, 2, 2, 'FD');
```

**Overflow check (before line 446):**
Add a check before the Stamp section:
```typescript
const footerZoneStart = pageHeight - 60;
if (currentY > footerZoneStart) {
  doc.addPage();
  currentY = 20;
}
```
Then after the stamp box, call `drawArabicFooter` on the current page (it already uses `doc.internal.pageSize.height` so it adapts).

Move the `drawArabicFooter` and timestamp calls to after the overflow check so they render on the correct page.

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/invoiceGenerator.ts` | Modify | Tighten spacing, shrink signature box, fix box Y-tracking, add overflow safety check |

No other files need changes. This is a layout-only fix within the PDF generator.
