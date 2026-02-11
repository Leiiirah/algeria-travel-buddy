

## Fix: Add Missing `IsDateString` Import

**Problem:** `create-command.dto.ts` uses `@IsDateString()` decorator but doesn't import it from `class-validator`.

**File:** `server/src/commands/dto/create-command.dto.ts`

Add `IsDateString` to the existing import statement:

```typescript
// Before
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';

// After
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  IsUUID,
  IsDateString,
} from 'class-validator';
```

After deploying, rebuild and restart the backend:
```bash
cd /var/www/elhikma/server
npm run build
pm2 restart elhikma-backend
```
