
# Plan: Add Passport Upload Field for Visa Commands

## Overview

Add a file upload field to the visa command form that allows users to upload a scanned copy of the client's passport. The passport file will be stored on the server, and the URL will be saved with the command.

---

## Architecture Decision

Since the `data` column is a JSONB field storing dynamic form data, and passport files need to be served via authenticated endpoints, we'll:

1. Add a new `passportUrl` column to the `commands` table to store the passport file URL
2. Create file upload endpoints similar to supplier transactions
3. Update the frontend form to include a file input for visa commands

---

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/commands/entities/command.entity.ts` | Add `passportUrl` column |
| `server/src/commands/dto/create-command.dto.ts` | Add optional `passportUrl` field |
| `server/src/commands/dto/update-command.dto.ts` | Add optional `passportUrl` field |
| `server/src/commands/commands.controller.ts` | Add file upload endpoint + view/download endpoints |
| `server/src/commands/commands.service.ts` | Update create/update to handle passportUrl |
| `src/lib/api.ts` | Add methods for passport upload and viewing |
| `src/pages/CommandsPage.tsx` | Add file input for visa type, update form handling |
| `src/types/index.ts` | Update VisaCommand interface (optional) |
| `src/i18n/locales/fr/commands.json` | Add translations |
| `src/i18n/locales/ar/commands.json` | Add Arabic translations |

---

## Implementation Details

### 1. Backend: Add passportUrl Column

**File**: `server/src/commands/entities/command.entity.ts`

```typescript
@Column({ nullable: true })
passportUrl: string;
```

### 2. Backend: Update DTOs

**File**: `server/src/commands/dto/create-command.dto.ts`

```typescript
@IsString()
@IsOptional()
passportUrl?: string;
```

### 3. Backend: Add File Upload Endpoints

**File**: `server/src/commands/commands.controller.ts`

Add imports and new endpoints:

```typescript
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Create command with passport file
@Post('with-passport')
@UseInterceptors(
  FileInterceptor('passport', {
    storage: diskStorage({
      destination: './uploads/passports',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `passport-${uuidv4()}${ext}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  }),
)
createWithPassport(
  @Body() createDto: CreateCommandDto,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
) {
  const passportUrl = file?.filename || undefined;
  return this.commandsService.create({ ...createDto, passportUrl }, req.user.id);
}

// View passport inline
@Get(':id/passport/view')
async viewPassport(@Param('id') id: string, @Res() res: Response) {
  const command = await this.commandsService.findOne(id);
  if (!command.passportUrl) {
    throw new NotFoundException('No passport attached');
  }
  const ext = path.extname(command.passportUrl).toLowerCase();
  const mimeTypes = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${command.passportUrl}"`);
  return res.sendFile(command.passportUrl, { root: './uploads/passports' });
}

// Download passport
@Get(':id/passport/download')
async downloadPassport(@Param('id') id: string, @Res() res: Response) {
  const command = await this.commandsService.findOne(id);
  if (!command.passportUrl) {
    throw new NotFoundException('No passport attached');
  }
  return res.sendFile(command.passportUrl, { root: './uploads/passports' });
}
```

### 4. Frontend: Add API Methods

**File**: `src/lib/api.ts`

```typescript
// Create command with passport file
createCommandWithPassport = (data: CreateCommandDto, passportFile: File): Promise<Command> => {
  const formData = new FormData();
  formData.append('serviceId', data.serviceId);
  formData.append('supplierId', data.supplierId);
  formData.append('data', JSON.stringify(data.data));
  formData.append('destination', data.destination);
  formData.append('sellingPrice', data.sellingPrice.toString());
  formData.append('amountPaid', data.amountPaid.toString());
  formData.append('buyingPrice', data.buyingPrice.toString());
  formData.append('passport', passportFile);
  return this.requestWithFormData('/commands/with-passport', formData);
};

// Fetch passport as blob for viewing
getCommandPassportBlob = async (commandId: string, mode: 'view' | 'download' = 'view'): Promise<Blob> => {
  const endpoint = mode === 'view' ? 'view' : 'download';
  const response = await fetch(`${API_URL}/commands/${commandId}/passport/${endpoint}`, {
    headers: { Authorization: `Bearer ${this.token}` },
  });
  if (!response.ok) throw new ApiError(response.status, 'Failed to fetch passport');
  return response.blob();
};
```

### 5. Frontend: Update Form

**File**: `src/pages/CommandsPage.tsx`

Add state for passport file:
```typescript
const [passportFile, setPassportFile] = useState<File | null>(null);
```

Update the visa form to include file upload:
```tsx
case 'visa':
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('form.firstName')}</Label>
          <Input ... />
        </div>
        <div className="space-y-2">
          <Label>{t('form.lastName')}</Label>
          <Input ... />
        </div>
      </div>
      {/* NEW: Passport Upload */}
      <div className="space-y-2">
        <Label>{t('form.passport')}</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
        />
        <p className="text-xs text-muted-foreground">{t('form.passportHelp')}</p>
      </div>
    </>
  );
```

Update submit handler to use file upload when passport is provided:
```typescript
const handleCreateCommand = () => {
  // ... existing logic to build data ...
  
  if (serviceType === 'visa' && passportFile && !editingCommandId) {
    createCommand.mutate(
      { ...commandPayload, passportFile },
      { onSuccess: () => { /* reset */ } }
    );
  } else {
    // existing flow
  }
};
```

### 6. Add Translations

**File**: `src/i18n/locales/fr/commands.json`

```json
{
  "form": {
    "passport": "Passeport scanné",
    "passportHelp": "Télécharger le passeport du client (PDF, JPG, PNG - max 10 Mo)",
    "viewPassport": "Voir le passeport",
    "downloadPassport": "Télécharger le passeport",
    "noPassport": "Aucun passeport"
  }
}
```

**File**: `src/i18n/locales/ar/commands.json`

```json
{
  "form": {
    "passport": "جواز السفر الممسوح",
    "passportHelp": "تحميل جواز سفر العميل (PDF، JPG، PNG - الحد الأقصى 10 ميجابايت)",
    "viewPassport": "عرض جواز السفر",
    "downloadPassport": "تحميل جواز السفر",
    "noPassport": "لا يوجد جواز سفر"
  }
}
```

---

## Visual Comparison

### Before (Current Visa Form)
```
┌──────────────────────────────────────────────────┐
│ Visa Form                                        │
├──────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐       │
│ │ Prénom           │ │ Nom              │       │
│ │ [____________]   │ │ [____________]   │       │
│ └──────────────────┘ └──────────────────┘       │
└──────────────────────────────────────────────────┘
```

### After (New Visa Form)
```
┌──────────────────────────────────────────────────┐
│ Visa Form                                        │
├──────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐       │
│ │ Prénom           │ │ Nom              │       │
│ │ [____________]   │ │ [____________]   │       │
│ └──────────────────┘ └──────────────────┘       │
│                                                  │
│ Passeport scanné:                               │
│ ┌────────────────────────────────────────────┐  │
│ │ [Choose File] passport_scan.pdf            │  │
│ └────────────────────────────────────────────┘  │
│ Télécharger le passeport du client (PDF, JPG...)│
└──────────────────────────────────────────────────┘
```

---

## Database Migration

A TypeORM migration will be needed to add the `passportUrl` column:

```sql
ALTER TABLE commands ADD COLUMN "passportUrl" VARCHAR NULL;
```

---

## Upload Directory Setup

The backend will need to create the `uploads/passports` directory on module initialization (similar to how `uploads/receipts` is handled).

---

## Summary

| Category | Count |
|----------|-------|
| Backend entity | 1 |
| Backend DTOs | 2 |
| Backend controller | 1 |
| Backend service | 1 |
| Frontend API | 1 |
| Frontend pages | 1 |
| Translation files | 2 |
| **Total** | 9 files |

This implementation:
1. Adds a new `passportUrl` column to store passport file references
2. Creates upload/view/download endpoints with authentication
3. Updates the visa form with a file input
4. Uses the same Blob URL pattern for authenticated file viewing
5. Supports PDF, JPG, and PNG formats up to 10MB
