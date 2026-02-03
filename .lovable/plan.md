

# Plan: Add Inline PDF Viewer for Supplier Transaction Receipts

## Problem

Currently, when clicking the PDF button in the transaction history, the file is downloaded. You want to **view the PDF directly in the app** without downloading it.

---

## Solution Overview

Add a transaction details dialog with an embedded PDF viewer that displays the receipt inline using an `<iframe>` or `<object>` element.

---

## Current vs Proposed

| Current | Proposed |
|---------|----------|
| PDF button triggers download | PDF button opens preview dialog |
| No inline viewing | Embedded PDF viewer in modal |
| `window.open()` to download URL | Dialog with `<iframe src="...">` |

---

## Implementation

### 1. Backend: Add Inline View Endpoint

Create a new endpoint that returns the PDF with `Content-Disposition: inline` (for browser viewing) instead of `attachment` (for download).

**File**: `server/src/supplier-transactions/supplier-transactions.controller.ts`

```typescript
@Get(':id/view')
async viewReceipt(@Param('id') id: string, @Res() res: Response) {
  const transaction = await this.transactionsService.findOne(id);
  if (!transaction.receiptUrl) {
    throw new NotFoundException('No receipt attached to this transaction');
  }
  
  const filePath = path.join('./uploads/receipts', transaction.receiptUrl);
  
  // Set headers for inline viewing
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${transaction.receiptUrl}"`);
  
  return res.sendFile(transaction.receiptUrl, { root: './uploads/receipts' });
}
```

### 2. Frontend: Add API Method for Viewing

**File**: `src/lib/api.ts`

```typescript
getTransactionReceiptViewUrl = (transactionId: string): string =>
  `${API_URL}/supplier-transactions/${transactionId}/view`;
```

### 3. Frontend: Add PDF Preview Dialog

**File**: `src/pages/SupplierAccountingPage.tsx`

Add state for the PDF preview dialog:
```typescript
const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

const handleViewPdf = (transactionId: string) => {
  setSelectedTransactionId(transactionId);
  setIsPdfPreviewOpen(true);
};
```

Add the PDF preview dialog:
```tsx
{/* PDF Preview Dialog */}
<Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
  <DialogContent className="max-w-4xl h-[80vh]">
    <DialogHeader>
      <DialogTitle>{t('accounting.transaction.viewReceipt')}</DialogTitle>
    </DialogHeader>
    <div className="flex-1 h-full min-h-[500px]">
      {selectedTransactionId && (
        <iframe
          src={api.getTransactionReceiptViewUrl(selectedTransactionId)}
          className="w-full h-full border-0 rounded-md"
          title="PDF Receipt"
        />
      )}
    </div>
  </DialogContent>
</Dialog>
```

Update the PDF button in the history table:
```tsx
<TableCell>
  {transaction.receiptUrl ? (
    <div className="flex gap-1">
      {/* View button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleViewPdf(transaction.id)}
        title={t('accounting.transaction.viewReceipt')}
      >
        <Eye className="h-4 w-4" />
      </Button>
      {/* Download button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(api.getTransactionReceiptUrl(transaction.id), '_blank')}
        title={t('accounting.transaction.downloadReceipt')}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  ) : (
    <span className="text-muted-foreground">-</span>
  )}
</TableCell>
```

### 4. Add Translations

**File**: `src/i18n/locales/fr/suppliers.json`
```json
{
  "accounting": {
    "transaction": {
      "viewReceipt": "Voir le justificatif",
      "downloadReceipt": "Télécharger"
    }
  }
}
```

**File**: `src/i18n/locales/ar/suppliers.json`
```json
{
  "accounting": {
    "transaction": {
      "viewReceipt": "عرض المستند",
      "downloadReceipt": "تحميل"
    }
  }
}
```

---

## Visual Layout

### Transaction History Row (Updated)
```
┌─────────────────────────────────────────────────────────────────────┐
│ Date       │ Supplier    │ Type    │ Amount    │ Note   │ Receipt  │
├─────────────────────────────────────────────────────────────────────┤
│ 15 Jan     │ Air Algérie │ Sortie  │ -50,000   │ ...    │ 👁️ 📥     │
│ 12 Jan     │ Marriott    │ Sortie  │ -80,000   │ ...    │    -     │
└─────────────────────────────────────────────────────────────────────┘
                                                         ▲    ▲
                                                      View  Download
```

### PDF Preview Dialog
```
┌────────────────────────────────────────────────────────┐
│  Voir le justificatif                              [X] │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │                  [PDF CONTENT]                   │  │
│  │                                                  │  │
│  │           Embedded PDF Viewer (iframe)           │  │
│  │                                                  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Add `/view` endpoint with inline Content-Disposition |
| `src/lib/api.ts` | Add `getTransactionReceiptViewUrl` method |
| `src/pages/SupplierAccountingPage.tsx` | Add PDF preview dialog, Eye icon, state management |
| `src/i18n/locales/fr/suppliers.json` | Add `viewReceipt`, `downloadReceipt` translations |
| `src/i18n/locales/ar/suppliers.json` | Add Arabic translations |

---

## Technical Notes

1. **Iframe PDF Viewing**: Most modern browsers support viewing PDFs in iframes. The `Content-Disposition: inline` header tells the browser to display the PDF instead of downloading it.

2. **Authentication**: The iframe will include credentials because the API client uses `Bearer` token. However, since this is a direct URL in an iframe, we need to ensure the auth token is passed. We can handle this by:
   - Using a temporary signed URL approach, OR
   - Having the backend accept the token as a query parameter for this specific endpoint

3. **CORS**: The PDF viewer should work as long as CORS is properly configured (which it already is in your setup).

---

## Summary

| Category | Count |
|----------|-------|
| Backend files | 1 |
| Frontend files | 1 |
| Translation files | 2 |
| API changes | 1 |
| **Total** | 5 files |

This implementation:
1. Adds an inline PDF viewing endpoint
2. Creates a modal dialog with embedded PDF viewer
3. Keeps the download option available
4. Provides both "view" and "download" actions for each receipt

