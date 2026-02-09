

# Fix Commands Page Responsive Design (Complete)

## Root Cause

The Commands page content overflows horizontally, which pushes the entire page wider -- including the header. This is why scrolling is needed to reach the language switcher, even though the header component itself is the same one used by the Dashboard (which works fine). The Dashboard doesn't have a wide table, so it doesn't trigger overflow.

## Changes

### 1. `src/components/layout/DashboardLayout.tsx` -- Constrain main content

Add `overflow-x-hidden` to the main element so page content can never push the layout wider than the viewport. This fixes the header scroll issue for ALL pages.

- Line 40, change `<main className="flex-1 overflow-auto bg-background p-3 sm:p-6">` to `<main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-3 sm:p-6">`

### 2. `src/pages/CommandsPage.tsx` -- Multiple fixes

**a) Stats cards (lines 680-721):**
- Already using `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` -- OK
- Add `overflow-hidden` to each Card to prevent long DZD amounts from overflowing

**b) Filter/action header (lines 726-731):**
- Already `flex-col gap-4 sm:flex-row` -- OK but the "New command" button text can be long
- Shorten button text on mobile: hide text, show only icon on very small screens, or wrap the button area with `flex-wrap`

**c) Table container (line 1015):**
- Add `min-w-0` to the Card wrapping the table to prevent flex overflow
- Ensure the `-mx-4 sm:mx-0` negative margin approach works with a proper `overflow-x-auto` wrapper

**d) Status select in table (line 1078):**
- Already `w-[120px] sm:w-[160px]` -- further reduce to `w-[100px] sm:w-[160px]`

**e) Action dropdown in table rows:**
- Ensure `DropdownMenuContent` has `align="end"` to prevent it from overflowing off-screen on mobile

### 3. `src/components/search/GlobalSearch.tsx` -- Dialog mobile fix

- Line 76: Change `max-w-[650px]` to `max-w-[95vw] sm:max-w-[650px]` so the search dialog fits on mobile

## Summary of files changed

| File | What changes |
|------|-------------|
| `src/components/layout/DashboardLayout.tsx` | Add `overflow-x-hidden` to main element |
| `src/pages/CommandsPage.tsx` | Add `overflow-hidden` on stat cards, `min-w-0` on table card, reduce status select width, add `flex-wrap` to button area |
| `src/components/search/GlobalSearch.tsx` | Make search dialog responsive with `max-w-[95vw]` |

These changes will prevent the horizontal overflow that causes the header to scroll on mobile, and ensure cards and table content fit within the screen.

