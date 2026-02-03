
# Plan: Fix 413 Payload Too Large Error for Supplier Transaction File Uploads

## Problem

When adding a PDF file to a supplier transaction and clicking "Enregistrer", you get an **API ERROR 413** ("Payload Too Large"). This happens even after the previous fixes for the 431 error.

## Root Cause Analysis

The **413 Payload Too Large** error occurs because NestJS/Express has default body size limits that are separate from Multer's file size limits:

| Component | Default Limit | Our Need |
|-----------|--------------|----------|
| Express raw body | ~100KB | 20MB+ (for PDFs) |
| Express JSON body | ~100KB | Already works |
| Multer file size | 10MB (configured) | Good |

The problem is that **before** Multer processes the file upload, Express checks the raw body size and rejects it if it exceeds the default limit.

## Solution

Configure NestJS to accept larger request bodies globally in `main.ts` by setting the raw body parser limit.

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/main.ts` | Configure body parser limits (20MB) for file uploads |
| `server/src/supplier-transactions/supplier-transactions.controller.ts` | Increase multer file size limit to 20MB to match |

---

## Implementation Details

### 1. Update `server/src/main.ts`

Add body parser configuration to allow larger request bodies:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  // Increase body size limits for file uploads (20MB)
  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ extended: true, limit: '20mb' }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const origins = corsOrigin.includes(',')
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : corsOrigin;

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
```

### 2. Update `server/src/supplier-transactions/supplier-transactions.controller.ts`

Increase the Multer file size limit to 20MB to match the body parser limit:

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
      fileSize: 20 * 1024 * 1024, // Increased to 20MB maximum
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

---

## Why This Fixes the 413 Error

1. **Body Parser Limits**: Express processes the raw body before Multer. Without configuring `json()` and `urlencoded()` limits, Express rejects large payloads with a 413 error.

2. **Multipart Form Data**: For file uploads using `multipart/form-data`, the raw body includes the entire file. We need to ensure Express accepts this before passing it to Multer.

3. **Consistent Limits**: Setting both body parser (20MB) and Multer (20MB) to the same limit ensures consistent behavior.

---

## Additional Server Considerations

If you're running behind a reverse proxy (Nginx), you may also need to configure the proxy to accept larger bodies. This would be done outside of the NestJS application:

```nginx
# Example nginx.conf (not in this codebase)
client_max_body_size 20M;
```

However, since the server appears to be running directly without a proxy visible in the codebase, the NestJS changes should be sufficient.

---

## Summary

| Category | Count |
|----------|-------|
| Backend files | 2 |
| **Total** | 2 files |

This fix addresses:
1. **Express body parser limits** - Increases the default limit from ~100KB to 20MB
2. **Multer consistency** - Updates Multer limit to 20MB to match
3. **Complete request handling** - Ensures the entire upload pipeline accepts larger files
