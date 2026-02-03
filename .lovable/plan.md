

# Plan: Fix PDF Upload 431 Error for Supplier Transactions

## Problem

When adding a PDF file to a supplier transaction and clicking "Enregistrer", the user gets an **API ERROR 431** ("Request Header Fields Too Large").

## Root Cause Analysis

After investigating the code, I identified multiple potential issues:

### Issue 1: FormData Type Conversion
When using `FormData`, all values are sent as **strings**. The backend DTO expects:
- `amount: number` (with `@IsNumber()` validation)

But the frontend sends `amount` as a string via `formData.append('amount', data.amount.toString())`.

While NestJS's `ValidationPipe` has `enableImplicitConversion: true`, this sometimes doesn't work correctly with multipart/form-data requests.

### Issue 2: Missing Multer Limits Configuration
The `FileInterceptor` doesn't have explicit file size limits configured, which can cause issues with larger PDFs.

### Issue 3: Missing Validation Transform for FormData
The backend might be rejecting the request before multer processes it due to type validation failures.

---

## Solution

### Fix 1: Add Type Transform Decorator to DTO

Update the DTO to explicitly transform string values to numbers for multipart/form-data compatibility:

```typescript
// server/src/supplier-transactions/dto/create-supplier-transaction.dto.ts
import { Transform } from 'class-transformer';

export class CreateSupplierTransactionDto {
  // ... other fields ...

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
```

### Fix 2: Add Multer File Size Limits

Configure explicit file size limits to prevent large file issues:

```typescript
// server/src/supplier-transactions/supplier-transactions.controller.ts
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({ /* ... */ }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => { /* ... */ },
  }),
)
```

### Fix 3: Ensure Uploads Directory Exists

Create the uploads/receipts directory if it doesn't exist on server startup.

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/supplier-transactions/dto/create-supplier-transaction.dto.ts` | Add `@Transform` decorator to convert string to number |
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Add file size limits to multer config |
| `server/src/supplier-transactions/supplier-transactions.module.ts` | Ensure uploads directory exists on module init |

---

## Implementation Details

### 1. Update DTO (`create-supplier-transaction.dto.ts`)

```typescript
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '../entities/supplier-transaction.entity';

export class CreateSupplierTransactionDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @Transform(({ value }) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parsed;
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;
}
```

### 2. Update Controller (`supplier-transactions.controller.ts`)

Add file size limits and better error handling:

```typescript
@Post('with-file')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/receipts',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `receipt-${uuidv4()}${ext}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB maximum
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
  }),
)
createWithFile(
  @Body() createDto: CreateSupplierTransactionDto,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const receiptUrl = file?.filename || undefined;
  return this.transactionsService.create({ ...createDto, receiptUrl }, req.user.id);
}
```

### 3. Update Module to Ensure Directory Exists

```typescript
// server/src/supplier-transactions/supplier-transactions.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';

@Module({ /* ... */ })
export class SupplierTransactionsModule implements OnModuleInit {
  onModuleInit() {
    const uploadDir = './uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }
}
```

---

## Summary

| Category | Count |
|----------|-------|
| Backend DTO | 1 file |
| Backend Controller | 1 file |
| Backend Module | 1 file |
| **Total** | 3 files |

This fix addresses:
1. **Type conversion** - Ensures `amount` is properly converted from string to number in FormData
2. **File size limits** - Adds explicit 10MB limit to prevent oversized uploads
3. **Directory creation** - Ensures the uploads/receipts folder exists before attempting to save files

