

# Fix PDF Footer Content and Add Missing Field

## Overview
The PDF footer text does not match the correct agency information. This plan updates the footer layout to match the exact format from the reference image, adds a new "Article Fiscal" field (رقم المادة الجبائية) that is currently missing from the system, and updates the default values to be accurate. All footer data is already fetched dynamically from the backend -- we just need to add the missing field and fix the layout/values.

## What Changes

### 1. Add New Field: `articleFiscal` (رقم المادة الجبائية)
This field ("Tax Article Number" / "Article d'imposition") does not exist anywhere in the system. It needs to be added to:
- Backend default settings
- Frontend `AgencyInfoParam` type
- `mergeAgencyInfo` helper
- Fallback constants
- Contact page form
- Translation files (FR and AR)

### 2. Update Default Values
Several values in the backend defaults and frontend fallbacks are incorrect:

| Field | Current Value | Correct Value |
|-------|--------------|---------------|
| `arabicName` | الحكمة للسياحة والأسفار | الحكمة لسياحة و الأسفار |
| `nis` | 001209010018958 | 001209010019858 |
| `rc` | 09/00-0807686B12 | 12ب0807686-09/00 |
| `phone` | 020475949 | 025 17 29 68 |
| `mobilePhone` | 0770236424 | 0540 40 00 80 |
| `licenseNumber` | (empty) | 1500 |
| `articleFiscal` | (new) | 00120908076 |

### 3. Rewrite Footer Layout
The current footer renders 4 lines. The reference image shows 5 lines with a specific arrangement:

```text
Line 1: الحكمة لسياحة و الأسفار                          (agency name - bold)
Line 2: 02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر    (address)
Line 3: رقم السجل التجاري: ... رقم التعريف الجبائي: ... رقم المادة الجبائية: ...  (RC + NIF + Article)
Line 4: رقم التعريف الإحصائي: ... رقم رخصة الوكالة: ...      (NIS + License)
Line 5: الجوال: ... المكتب: ...                            (phone numbers)
```

Key differences from current layout:
- Line 3 now includes the new `articleFiscal` field
- Legal identifiers are split across two lines (3 on one, 2 on the next) instead of all crammed into one line
- Footer starts at `pageHeight - 32` instead of `pageHeight - 28` to accommodate the extra line

---

## Technical Details

### File: `src/utils/invoiceGenerator.ts`

**Add `articleFiscal` to `AgencyInfoParam` (line 16):**
Add `articleFiscal?: string;` to the interface.

**Update `mergeAgencyInfo` (line 84-99):**
Add `articleFiscal: param?.articleFiscal || AGENCY_INFO.articleFiscal` to the return object.

**Rewrite `drawArabicFooter` (lines 104-151):**
- Start Y at `pageHeight - 32` (was -28) to fit 5 lines
- Line 1: Arabic name (Tajawal Bold, size 10)
- Line 2: Arabic address (Tajawal Regular, size 8)
- Line 3: RC + NIF + Article Fiscal (size 7), separated by spaces
- Line 4: NIS + License Number (size 7), separated by spaces
- Line 5: Mobile + Office phone (size 7)
- All lines centered, using Tajawal font

### File: `src/constants/agency.ts`

**Add field and update values (lines 1-17):**
- Add `articleFiscal: '00120908076'`
- Update `arabicName` to `'الحكمة لسياحة و الأسفار'`
- Update `nis` to `'001209010019858'`
- Update `rc` to `'12ب0807686-09/00'`
- Update `phone` to `'025 17 29 68'`
- Update `mobilePhone` to `'0540 40 00 80'`
- Update `licenseNumber` to `'1500'`

### File: `server/src/agency-settings/agency-settings.service.ts`

**Add field and update defaults (lines 6-20):**
- Add `articleFiscal: '00120908076'` to DEFAULT_SETTINGS
- Update `arabicName`, `nis`, `rc`, `phone`, `mobilePhone`, `licenseNumber` to correct values

### File: `src/pages/ContactPage.tsx`

**Add `articleFiscal` to FIELDS array (line 20):**
Insert `{ key: 'articleFiscal', icon: '🔢' }` after the `nis` entry.

### File: `src/i18n/locales/fr/common.json`

**Add translation (line 146):**
Add `"articleFiscal": "Article d'imposition"` to the `contact.fields` section.

### File: `src/i18n/locales/ar/common.json`

**Add translation (line 146):**
Add `"articleFiscal": "رقم المادة الجبائية"` to the `contact.fields` section.

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/invoiceGenerator.ts` | Modify | Add `articleFiscal` to type + merge, rewrite footer to 5-line layout |
| `src/constants/agency.ts` | Modify | Add `articleFiscal`, fix default values |
| `server/src/agency-settings/agency-settings.service.ts` | Modify | Add `articleFiscal`, fix default values |
| `src/pages/ContactPage.tsx` | Modify | Add `articleFiscal` field to form |
| `src/i18n/locales/fr/common.json` | Modify | Add `articleFiscal` translation |
| `src/i18n/locales/ar/common.json` | Modify | Add `articleFiscal` translation |

No database schema changes needed -- the backend uses a flexible key-value store that auto-creates new keys.
