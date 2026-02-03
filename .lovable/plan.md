

# Plan: Add PDF Upload to Supplier Transactions

## Overview

Add the ability to attach PDF documents (bank receipts, payment proofs, or other required documents) to supplier transactions. This will allow users to keep a paper trail of all payments made to suppliers.

---

## Current State

| Component | Current |
|-----------|---------|
| Entity | `supplier-transaction.entity.ts` - No file field |
| DTO | `create-supplier-transaction.dto.ts` - No file field |
| Frontend Form | Dialog in `SupplierAccountingPage.tsx` - No file upload |
| History Table | Shows Date, Supplier, Type, Amount, Note - No document column |

---

## Implementation Approach

### 1. Database Changes

Add a new column `receiptUrl` to the `supplier_transactions` table to store the filename of uploaded documents.

**New Migration File**: `server/src/database/migrations/XXXX-AddReceiptUrlToSupplierTransactions.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReceiptUrlToSupplierTransactions implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      ADD COLUMN "receiptUrl" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "supplier_transactions" 
      DROP COLUMN "receiptUrl"
    `);
  }
}
```

---

### 2. Backend Changes

#### Entity Update (`supplier-transaction.entity.ts`)

Add new column:
```typescript
@Column({ nullable: true })
receiptUrl: string;
```

#### DTO Updates

**create-supplier-transaction.dto.ts**:
```typescript
@IsString()
@IsOptional()
receiptUrl?: string;
```

#### Controller Update (`supplier-transactions.controller.ts`)

Add file upload endpoint using existing pattern from documents controller:

```typescript
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Post('with-file')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/receipts',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `receipt-${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}))
create(
  @Body() createDto: CreateSupplierTransactionDto,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const receiptUrl = file?.filename;
  return this.transactionsService.create({ ...createDto, receiptUrl }, req.user.id);
}
```

Add download endpoint:
```typescript
@Get(':id/download')
async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
  const transaction = await this.transactionsService.findOne(id);
  if (!transaction.receiptUrl) {
    throw new NotFoundException('No receipt attached');
  }
  return res.sendFile(transaction.receiptUrl, { root: './uploads/receipts' });
}
```

---

### 3. Frontend Changes

#### Type Update (`src/types/index.ts`)

```typescript
export interface SupplierTransaction {
  id: string;
  date: Date;
  supplierId: string;
  type: SupplierTransactionType;
  amount: number;
  note: string;
  receiptUrl?: string;  // NEW
  recordedBy: string;
  createdAt: Date;
}
```

#### API Update (`src/lib/api.ts`)

Update DTO:
```typescript
export interface CreateSupplierTransactionDto {
  supplierId: string;
  date: string;
  type: 'sortie' | 'entree';
  amount: number;
  note: string;
  file?: File;  // NEW
}
```

Add new API method for multipart upload:
```typescript
createSupplierTransactionWithFile = async (
  data: CreateSupplierTransactionDto
): Promise<SupplierTransaction> => {
  const formData = new FormData();
  formData.append('supplierId', data.supplierId);
  formData.append('date', data.date);
  formData.append('type', data.type);
  formData.append('amount', data.amount.toString());
  formData.append('note', data.note || '');
  if (data.file) {
    formData.append('file', data.file);
  }
  
  return this.request('/supplier-transactions/with-file', {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
}

getTransactionReceiptUrl = (transactionId: string): string => {
  return `${API_URL}/supplier-transactions/${transactionId}/download`;
}
```

#### Hook Update (`src/hooks/useSupplierTransactions.ts`)

Update to use new file upload method when file is provided.

#### UI Update (`src/pages/SupplierAccountingPage.tsx`)

**Form State**:
```typescript
const [newTransaction, setNewTransaction] = useState({
  supplierId: '',
  type: 'sortie' as SupplierTransactionType,
  amount: '',
  note: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  file: null as File | null,  // NEW
});
```

**Dialog Form** - Add file input after note field:
```tsx
<div className="grid gap-2">
  <Label htmlFor="receipt">{t('accounting.transaction.receipt')}</Label>
  <Input
    id="receipt"
    type="file"
    accept="application/pdf"
    onChange={(e) => {
      const file = e.target.files?.[0] || null;
      setNewTransaction({ ...newTransaction, file });
    }}
  />
  <p className="text-xs text-muted-foreground">
    {t('accounting.transaction.receiptHint')}
  </p>
</div>
```

**History Table** - Add new column for document:
```tsx
<TableHead>{t('accounting.transaction.receipt')}</TableHead>

// In table body:
<TableCell>
  {transaction.receiptUrl ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.open(api.getTransactionReceiptUrl(transaction.id))}
    >
      <FileText className="h-4 w-4 mr-1" />
      PDF
    </Button>
  ) : (
    <span className="text-muted-foreground">-</span>
  )}
</TableCell>
```

---

### 4. Translation Updates

**French (`fr/suppliers.json`)**:
```json
{
  "accounting": {
    "transaction": {
      "payment": "Paiement envoyé",
      "refund": "Remboursement reçu",
      "receipt": "Justificatif",
      "receiptHint": "PDF uniquement (reçu bancaire, etc.)"
    }
  }
}
```

**Arabic (`ar/suppliers.json`)**:
```json
{
  "accounting": {
    "transaction": {
      "payment": "دفعة مرسلة",
      "refund": "استرداد مستلم",
      "receipt": "المستند",
      "receiptHint": "PDF فقط (إيصال بنكي، إلخ)"
    }
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/database/migrations/XXXX-AddReceiptUrlToSupplierTransactions.ts` | NEW - Database migration |
| `server/src/supplier-transactions/entities/supplier-transaction.entity.ts` | Add `receiptUrl` column |
| `server/src/supplier-transactions/dto/create-supplier-transaction.dto.ts` | Add `receiptUrl` field |
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Add file upload endpoint + download |
| `server/src/supplier-transactions/supplier-transactions.service.ts` | Handle receiptUrl in create |
| `src/types/index.ts` | Add `receiptUrl` to SupplierTransaction |
| `src/lib/api.ts` | Add file upload method + download URL helper |
| `src/hooks/useSupplierTransactions.ts` | Handle file upload |
| `src/pages/SupplierAccountingPage.tsx` | Add file input to form + PDF column in table |
| `src/i18n/locales/fr/suppliers.json` | Add translation keys |
| `src/i18n/locales/ar/suppliers.json` | Add Arabic translations |

---

## Visual Layout

### New Transaction Dialog
```text
┌────────────────────────────────────────┐
│  Nouvelle transaction                   │
├────────────────────────────────────────┤
│  Fournisseur *         [Select ▼]      │
│  Type *                [Paiement ▼]    │
│  Montant (DZD) *       [50000     ]    │
│  Date                  [2024-01-15]    │
│  Note                  [textarea  ]    │
│                                        │
│  Justificatif (PDF)                    │
│  [Choose file...] receipt.pdf          │
│  PDF uniquement (reçu bancaire, etc.)  │
│                                        │
│           [Annuler] [Enregistrer]      │
└────────────────────────────────────────┘
```

### History Table with PDF Column
```text
┌──────────────────────────────────────────────────────────────┐
│ Date       │ Fournisseur │ Type    │ Montant  │ Note │ PDF  │
├──────────────────────────────────────────────────────────────┤
│ 15 Jan     │ Air Algérie │ Sortie  │ -50,000  │ ...  │ [📄] │
│ 12 Jan     │ Marriott    │ Sortie  │ -80,000  │ ...  │  -   │
└──────────────────────────────────────────────────────────────┘
```

---

## File Storage

Files will be stored in the existing `server/uploads/` directory structure:
- Path: `server/uploads/receipts/`
- Naming: `receipt-{uuid}.pdf`
- Access: Authenticated users only (via download endpoint)

---

## Summary

| Category | Count |
|----------|-------|
| Database migration | 1 |
| Backend files | 4 |
| Frontend files | 4 |
| Translation files | 2 |
| **Total** | 11 files |

This implementation:
1. Adds PDF upload capability to supplier transactions
2. Stores files securely on the server
3. Provides a download link in the transaction history
4. Follows existing patterns from the documents module
5. Supports both French and Arabic languages

