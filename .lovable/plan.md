

# Fix "Ajouter Paiement" Button in Unpaid Tab

## Problem

The `<Dialog>` for adding a payment is nested inside `<TabsContent value="payments">` (lines 270-382). When the user clicks "Ajouter Paiement" from the **unpaid** tab (line 493-495), it sets `isDialogOpen = true`, but the dialog is not rendered because the payments tab content is hidden.

## Solution

Extract the payment Dialog out of the `<TabsContent value="payments">` and place it after the closing `</Tabs>` tag (before the closing `</DashboardLayout>`). This way the dialog renders regardless of which tab is active.

### File: `src/pages/AccountingPage.tsx`

1. **Cut** the `<Dialog open={isDialogOpen} ...>...</Dialog>` block (lines 270-382) out of the payments tab header.
2. **Keep** only the filter and a standalone "Ajouter Paiement" `<Button>` that opens the dialog in the payments tab header.
3. **Paste** the `<Dialog>` block after `</Tabs>` (after line 544), so it's always rendered regardless of active tab.

The button in the unpaid tab (lines 491-499) already correctly sets `selectedCommand` and `isDialogOpen` — no changes needed there.

### Files Changed

| File | Change |
|---|---|
| `src/pages/AccountingPage.tsx` | Move `<Dialog>` outside of `<TabsContent>` so it renders on any tab |

