

# Plan: Fix 401 Unauthorized Error for PDF Download/View

## Problem

When clicking the Eye icon (view) or Download icon in the transaction history, you get a **401 Unauthorized** error because:

1. The PDF endpoints (`/download` and `/view`) are protected by `JwtAuthGuard`
2. When using an `<iframe>` or `window.open()`, the browser makes a **direct GET request** without the `Authorization: Bearer` header
3. The JWT token is stored in localStorage and only sent by the ApiClient's `request()` method, not by browser-initiated requests

## Root Cause

```
Frontend: iframe src="http://server/api/supplier-transactions/xxx/view"
           ↓
Browser:  Direct GET request (NO Authorization header!)
           ↓
Backend:  JwtAuthGuard checks for Authorization header
           ↓
Result:   401 Unauthorized
```

## Solution Options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Token as Query Param** | Pass JWT as `?token=xxx` for these endpoints | Simple, works with iframe | Token exposed in URL/logs |
| **B. Fetch + Blob URL** | Fetch PDF via API, create Blob URL for iframe | Most secure, token never exposed | More complex, memory management |
| **C. Signed Temporary URL** | Backend generates time-limited signed URL | Very secure | Requires additional endpoint + signing logic |

**Recommended: Option B (Fetch + Blob URL)** - This is the most secure approach as the JWT token is never exposed in URLs or browser history.

---

## Implementation Details

### 1. Add API method to fetch PDF as Blob

**File**: `src/lib/api.ts`

```typescript
// Add a new method to fetch PDF as blob (authenticated)
getTransactionReceiptBlob = async (transactionId: string, mode: 'view' | 'download' = 'view'): Promise<Blob> => {
  const endpoint = mode === 'view' ? 'view' : 'download';
  const response = await fetch(`${API_URL}/supplier-transactions/${transactionId}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${this.token}`,
    },
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to fetch receipt');
  }
  
  return response.blob();
};
```

### 2. Update SupplierAccountingPage to use Blob URL

**File**: `src/pages/SupplierAccountingPage.tsx`

Add state and effect for PDF blob:

```typescript
const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
const [isPdfLoading, setIsPdfLoading] = useState(false);

// Fetch PDF when dialog opens
useEffect(() => {
  if (isPdfPreviewOpen && selectedTransactionId) {
    setIsPdfLoading(true);
    api.getTransactionReceiptBlob(selectedTransactionId, 'view')
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      })
      .catch(error => {
        console.error('Failed to load PDF:', error);
        toast.error(t('accounting.transaction.loadError'));
      })
      .finally(() => setIsPdfLoading(false));
  }
  
  // Cleanup blob URL when dialog closes
  return () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };
}, [isPdfPreviewOpen, selectedTransactionId]);
```

Update the iframe to use blob URL:

```tsx
<Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
  <DialogContent className="max-w-4xl h-[80vh]">
    <DialogHeader>
      <DialogTitle>{t('accounting.transaction.viewReceipt')}</DialogTitle>
    </DialogHeader>
    <div className="flex-1 h-full min-h-[500px]">
      {isPdfLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : pdfBlobUrl ? (
        <iframe
          src={pdfBlobUrl}
          className="w-full h-full border-0 rounded-md"
          title="PDF Receipt"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          {t('accounting.transaction.loadError')}
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
```

### 3. Update Download Handler

Update the download button to use authenticated fetch:

```typescript
const handleDownloadPdf = async (transactionId: string) => {
  try {
    const blob = await api.getTransactionReceiptBlob(transactionId, 'download');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transactionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    toast.error(t('accounting.transaction.downloadError'));
  }
};
```

### 4. Add Missing Translations

**Files**: `src/i18n/locales/fr/suppliers.json` and `src/i18n/locales/ar/suppliers.json`

```json
{
  "accounting": {
    "transaction": {
      "loadError": "Erreur lors du chargement du document",
      "downloadError": "Erreur lors du téléchargement"
    }
  }
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT (BROKEN)                            │
├─────────────────────────────────────────────────────────────────┤
│  User clicks Eye  →  iframe src="URL"  →  No auth  →  401      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PROPOSED (FIXED)                            │
├─────────────────────────────────────────────────────────────────┤
│  User clicks Eye                                                │
│        ↓                                                        │
│  ApiClient.getTransactionReceiptBlob()                          │
│        ↓ (includes Authorization header)                        │
│  Backend returns PDF                                            │
│        ↓                                                        │
│  Create Blob URL: blob:http://xxx                               │
│        ↓                                                        │
│  iframe src="blob:http://xxx"  →  PDF displays!                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/api.ts` | Add `getTransactionReceiptBlob()` method |
| `src/pages/SupplierAccountingPage.tsx` | Use blob URL for iframe, add loading state, update download handler |
| `src/i18n/locales/fr/suppliers.json` | Add error translations |
| `src/i18n/locales/ar/suppliers.json` | Add error translations |

---

## Summary

| Category | Count |
|----------|-------|
| API methods | 1 new |
| Frontend files | 1 |
| Translation files | 2 |
| **Total** | 4 files |

This fix ensures:
1. **Authentication works** - JWT token sent via fetch Authorization header
2. **Security** - Token never exposed in URLs or browser history
3. **User experience** - Loading spinner while PDF loads
4. **Memory management** - Blob URLs properly revoked when dialog closes

