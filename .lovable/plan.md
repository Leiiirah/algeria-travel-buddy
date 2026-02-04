

# Command Assignment & Attribution System Implementation Plan

## Overview

This plan implements an Admin-to-Employee command assignment system for the El Hikma travel agency platform. Administrators will be able to assign Visa and Omra commands to specific employees at creation time, with clear visual attribution badges showing who is responsible for each command.

---

## Architecture Summary

```text
+-------------------------------------------------------------------------+
|                         DATABASE CHANGES                                |
+-------------------------------------------------------------------------+
|  commands table         -> Add 'assignedTo' UUID column (nullable FK)  |
|  omra_orders table      -> Add 'assignedTo' UUID column (nullable FK)  |
|  omra_visas table       -> Add 'assignedTo' UUID column (nullable FK)  |
+-------------------------------------------------------------------------+
|                        BACKEND CHANGES                                  |
+-------------------------------------------------------------------------+
|  Migration              -> Add assignedTo columns with FK constraints   |
|  Entities               -> Update Command, OmraOrder, OmraVisa entities |
|  DTOs                   -> Add assignedTo to Create/Update DTOs         |
|  Services               -> Update access control (createdBy OR assignedTo) |
|  Users Controller       -> Add GET /users/employees endpoint            |
+-------------------------------------------------------------------------+
|                       FRONTEND CHANGES                                  |
+-------------------------------------------------------------------------+
|  Types                  -> Add assignedTo/assignee to interfaces        |
|  API Client             -> Add getActiveEmployees method                |
|  useActiveEmployees     -> New hook to fetch employee list              |
|  Command Forms          -> Add "Assign To" dropdown (admin-only)        |
|  Omra Forms             -> Add "Assign To" dropdown (admin-only)        |
|  Dashboard              -> Add assignee badges to recent commands       |
|  Tables                 -> Show "by [name]" attribution in rows         |
|  Translations           -> Add assignment keys (FR/AR)                  |
+-------------------------------------------------------------------------+
```

---

## Database Schema Changes

### Migration: Add `assignedTo` Column

| Table | Column | Type | Description |
|-------|--------|------|-------------|
| `commands` | `assignedTo` | UUID (nullable) | FK to users.id - Employee responsible |
| `omra_orders` | `assignedTo` | UUID (nullable) | FK to users.id - Employee responsible |
| `omra_visas` | `assignedTo` | UUID (nullable) | FK to users.id - Employee responsible |

### Migration SQL

```sql
-- Add assignedTo to commands
ALTER TABLE commands ADD COLUMN "assignedTo" UUID;
ALTER TABLE commands ADD CONSTRAINT "FK_commands_assignedTo" 
  FOREIGN KEY ("assignedTo") REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX "IDX_commands_assignedTo" ON commands("assignedTo");

-- Add assignedTo to omra_orders  
ALTER TABLE omra_orders ADD COLUMN "assignedTo" UUID;
ALTER TABLE omra_orders ADD CONSTRAINT "FK_omra_orders_assignedTo"
  FOREIGN KEY ("assignedTo") REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX "IDX_omra_orders_assignedTo" ON omra_orders("assignedTo");

-- Add assignedTo to omra_visas
ALTER TABLE omra_visas ADD COLUMN "assignedTo" UUID;
ALTER TABLE omra_visas ADD CONSTRAINT "FK_omra_visas_assignedTo"
  FOREIGN KEY ("assignedTo") REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX "IDX_omra_visas_assignedTo" ON omra_visas("assignedTo");
```

---

## Backend Implementation

### 1. New Migration File

**File:** `server/src/database/migrations/1770400000000-AddAssignedToFields.ts`

TypeORM migration to add `assignedTo` columns to all three tables with foreign key constraints and indexes.

### 2. Entity Updates

**Command Entity** (`server/src/commands/entities/command.entity.ts`):
Add new column and relation:
```typescript
@Column({ nullable: true })
assignedTo: string;

@ManyToOne(() => User, { nullable: true })
@JoinColumn({ name: 'assignedTo' })
assignee: User;
```

**OmraOrder Entity** (`server/src/omra/entities/omra-order.entity.ts`):
Same pattern - add `assignedTo` column and `assignee` relation.

**OmraVisa Entity** (`server/src/omra/entities/omra-visa.entity.ts`):
Same pattern - add `assignedTo` column and `assignee` relation.

### 3. DTO Updates

**CreateCommandDto** (`server/src/commands/dto/create-command.dto.ts`):
```typescript
@IsUUID()
@IsOptional()
assignedTo?: string;
```

**CreateOmraOrderDto** (`server/src/omra/dto/create-omra-order.dto.ts`):
```typescript
@IsUUID()
@IsOptional()
assignedTo?: string;
```

**CreateOmraVisaDto** (`server/src/omra/dto/create-omra-visa.dto.ts`):
```typescript
@IsUUID()
@IsOptional()
assignedTo?: string;
```

### 4. Service Logic Updates

**CommandsService** (`server/src/commands/commands.service.ts`):
Update query builder to include `assignee` relation and modify access control:
```typescript
// Add to query builder
.leftJoinAndSelect('command.assignee', 'assignee')

// Update employee filtering logic
if (createdBy) {
  // Employee sees commands where they created it OR it's assigned to them
  queryBuilder.andWhere(
    '(command.createdBy = :userId OR command.assignedTo = :userId)',
    { userId: createdBy }
  );
}
```

**OmraService** (`server/src/omra/omra.service.ts`):
Apply same pattern for orders and visas:
- Add `assignee` relation to query builders
- Update filtering to include `OR assignedTo = :userId`

### 5. New Employees Endpoint

**UsersController** (`server/src/users/users.controller.ts`):
```typescript
@Get('employees')
@UseGuards(JwtAuthGuard)
async getActiveEmployees(): Promise<User[]> {
  return this.usersService.findActiveEmployees();
}
```

**UsersService** (`server/src/users/users.service.ts`):
```typescript
async findActiveEmployees(): Promise<User[]> {
  return this.usersRepository.find({
    where: { role: UserRole.EMPLOYEE, isActive: true },
    select: ['id', 'firstName', 'lastName', 'email'],
    order: { firstName: 'ASC' },
  });
}
```

---

## Frontend Implementation

### 1. Types Update

**File:** `src/types/index.ts`

Add to Command interface:
```typescript
export interface Command {
  // ... existing fields
  assignedTo?: string;
  assignee?: User;
}
```

Add to OmraOrder interface:
```typescript
export interface OmraOrder {
  // ... existing fields
  assignedTo?: string;
  assignee?: User;
}
```

Add to OmraVisa interface:
```typescript
export interface OmraVisa {
  // ... existing fields
  assignedTo?: string;
  assignee?: User;
}
```

### 2. API Client Update

**File:** `src/lib/api.ts`

Add to DTOs:
```typescript
export interface CreateCommandDto {
  // ... existing fields
  assignedTo?: string;
}

export interface CreateOmraOrderDto {
  // ... existing fields
  assignedTo?: string;
}

export interface CreateOmraVisaDto {
  // ... existing fields
  assignedTo?: string;
}
```

Add new method:
```typescript
getActiveEmployees = (): Promise<User[]> =>
  this.request('/users/employees');
```

### 3. New Hook

**File:** `src/hooks/useUsers.ts`

Add new hook:
```typescript
export const useActiveEmployees = () => {
  return useQuery({
    queryKey: ['users', 'employees'],
    queryFn: () => api.getActiveEmployees(),
  });
};
```

### 4. CommandsPage Form Enhancement

**File:** `src/pages/CommandsPage.tsx`

Add "Assign To" dropdown (visible only to admins):
- Import `useActiveEmployees` hook
- Add `assignedTo` to form state
- Render dropdown conditionally:
```typescript
{user?.role === 'admin' && (
  <div className="space-y-2">
    <Label>{t('form.assignTo')}</Label>
    <Select
      value={formData.assignedTo || ''}
      onValueChange={(value) => setFormData({ ...formData, assignedTo: value || undefined })}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('form.selectEmployee')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{t('form.unassigned')}</SelectItem>
        {employees?.map((emp) => (
          <SelectItem key={emp.id} value={emp.id}>
            {emp.firstName} {emp.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}
```

Add attribution badge in table rows:
```typescript
{command.assignee && (
  <Badge variant="outline" className="text-xs ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
    {t('table.by')} {command.assignee.firstName}
  </Badge>
)}
```

### 5. OmraOrdersTab Form Enhancement

**File:** `src/components/omra/OmraOrdersTab.tsx`

Same pattern as Commands:
- Import `useActiveEmployees` and `useAuth`
- Add `assignedTo` to form state
- Render "Assign To" dropdown for admins
- Show attribution badge in table

### 6. OmraVisasTab Form Enhancement

**File:** `src/components/omra/OmraVisasTab.tsx`

Same pattern as Orders and Commands.

### 7. Dashboard Attribution Badges

**File:** `src/pages/DashboardPage.tsx`

Add assignee badge to recent commands list:
```typescript
{command.assignee && (
  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
    {t('recentCommands.by')} {command.assignee.firstName}
  </Badge>
)}
```

### 8. Translation Updates

**French (`src/i18n/locales/fr/commands.json`):**
```json
{
  "form": {
    "assignTo": "Attribuer à",
    "selectEmployee": "Sélectionner un employé",
    "unassigned": "Non attribué"
  },
  "table": {
    "by": "par",
    "assignee": "Responsable"
  }
}
```

**Arabic (`src/i18n/locales/ar/commands.json`):**
```json
{
  "form": {
    "assignTo": "تعيين إلى",
    "selectEmployee": "اختر موظفاً",
    "unassigned": "غير معين"
  },
  "table": {
    "by": "بواسطة",
    "assignee": "المسؤول"
  }
}
```

**French (`src/i18n/locales/fr/omra.json`):**
```json
{
  "orders": {
    "form": {
      "assignTo": "Attribuer à",
      "selectEmployee": "Sélectionner un employé",
      "unassigned": "Non attribué"
    },
    "table": {
      "by": "par"
    }
  },
  "visas": {
    "form": {
      "assignTo": "Attribuer à",
      "selectEmployee": "Sélectionner un employé",
      "unassigned": "Non attribué"
    },
    "table": {
      "by": "par"
    }
  }
}
```

**Arabic (`src/i18n/locales/ar/omra.json`):**
```json
{
  "orders": {
    "form": {
      "assignTo": "تعيين إلى",
      "selectEmployee": "اختر موظفاً",
      "unassigned": "غير معين"
    },
    "table": {
      "by": "بواسطة"
    }
  },
  "visas": {
    "form": {
      "assignTo": "تعيين إلى",
      "selectEmployee": "اختر موظفاً",
      "unassigned": "غير معين"
    },
    "table": {
      "by": "بواسطة"
    }
  }
}
```

**French (`src/i18n/locales/fr/dashboard.json`):**
```json
{
  "recentCommands": {
    "by": "par"
  }
}
```

**Arabic (`src/i18n/locales/ar/dashboard.json`):**
```json
{
  "recentCommands": {
    "by": "بواسطة"
  }
}
```

---

## Data Isolation & Access Control

### Current Behavior
| Entity | Employee View |
|--------|---------------|
| Commands | Only their own (createdBy) |
| Omra Orders | Only their own (createdBy) |
| Omra Visas | Only their own (createdBy) |

### New Behavior
| Entity | Employee View |
|--------|---------------|
| Commands | Created by them OR assigned to them |
| Omra Orders | Created by them OR assigned to them |
| Omra Visas | Created by them OR assigned to them |

### Assignment Rules
| Action | Admin | Employee |
|--------|-------|----------|
| See "Assign To" dropdown | Yes | No |
| Assign to any employee | Yes | N/A |
| See assigned commands | All | Only theirs |
| Edit assigned commands | All | Only theirs |

---

## UI/UX Design

### Assignment Dropdown Styling
- Positioned in the form after client/service selection
- Uses existing Shadcn Select component
- Admin-only visibility (conditional rendering)
- Placeholder: "Sélectionner un employé" / "اختر موظفاً"
- First option: "Non attribué" / "غير معين" (empty value)

### Attribution Badge Design
- Small outline badge with light blue background
- Format: "par [FirstName]" / "بواسطة [FirstName]"
- Positioned next to client name or status in tables
- Consistent styling across all views

### Dashboard Integration
- Badge appears in "Recent Commands" section
- Shows assignee for each command with clear visual distinction
- Maintains existing card layout

---

## Files to Create/Modify

### New Files (1)
1. `server/src/database/migrations/1770400000000-AddAssignedToFields.ts`

### Modified Backend Files (8)
1. `server/src/commands/entities/command.entity.ts`
2. `server/src/commands/dto/create-command.dto.ts`
3. `server/src/commands/commands.service.ts`
4. `server/src/omra/entities/omra-order.entity.ts`
5. `server/src/omra/entities/omra-visa.entity.ts`
6. `server/src/omra/dto/create-omra-order.dto.ts`
7. `server/src/omra/dto/create-omra-visa.dto.ts`
8. `server/src/omra/omra.service.ts`
9. `server/src/users/users.controller.ts`
10. `server/src/users/users.service.ts`

### Modified Frontend Files (11)
1. `src/types/index.ts`
2. `src/lib/api.ts`
3. `src/hooks/useUsers.ts`
4. `src/pages/CommandsPage.tsx`
5. `src/components/omra/OmraOrdersTab.tsx`
6. `src/components/omra/OmraVisasTab.tsx`
7. `src/pages/DashboardPage.tsx`
8. `src/i18n/locales/fr/commands.json`
9. `src/i18n/locales/ar/commands.json`
10. `src/i18n/locales/fr/omra.json`
11. `src/i18n/locales/ar/omra.json`
12. `src/i18n/locales/fr/dashboard.json`
13. `src/i18n/locales/ar/dashboard.json`

---

## Implementation Order

1. **Database First**
   - Create migration for `assignedTo` columns
   - Update entities with new fields and relations

2. **Backend Services**
   - Add employees endpoint to users module
   - Update DTOs with `assignedTo` validation
   - Modify service methods to include `assignee` relation
   - Update access control logic (OR-based filtering)

3. **Frontend Core**
   - Update types with `assignedTo`/`assignee`
   - Add API method for employees
   - Add `useActiveEmployees` hook

4. **UI Integration**
   - Add assignment dropdowns to all forms
   - Add attribution badges to tables
   - Update dashboard with badges
   - Update translations (FR/AR)

5. **Testing**
   - Verify admin can assign commands
   - Verify employee sees assigned commands in their dashboard
   - Test dashboard badge display
   - Verify bilingual support (FR/AR) and RTL layout

