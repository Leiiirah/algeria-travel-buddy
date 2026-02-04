

# Plan: Internal Task Management Module

## Overview

This plan outlines the implementation of a new "Internal Task Management" (Missions Internes) module for the El Hikma travel agency platform. This module will allow admins to assign internal tasks to employees and track their progress, separate from client commands.

---

## 1. Database Design

### Entity: `internal_tasks`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | Task title (required) |
| `description` | TEXT | Detailed description (optional) |
| `priority` | ENUM | `urgent` (orange), `normal` (green), `critical` (red) |
| `status` | ENUM | `in_progress`, `completed` |
| `visibility` | ENUM | `clear`, `unreadable` - documentation clarity |
| `assignedTo` | UUID (FK) | Reference to users table (employee) |
| `createdBy` | UUID (FK) | Admin who created the task |
| `dueDate` | DATE | Optional deadline |
| `createdAt` | TIMESTAMP | Auto-generated |
| `updatedAt` | TIMESTAMP | Auto-updated |

### TypeORM Enums

```text
TaskPriority: 'urgent' | 'normal' | 'critical'
TaskStatus: 'in_progress' | 'completed'
TaskVisibility: 'clear' | 'unreadable'
```

---

## 2. Backend Implementation (NestJS)

### File Structure

```text
server/src/internal-tasks/
  |-- dto/
  |     |-- create-internal-task.dto.ts
  |     |-- update-internal-task.dto.ts
  |-- entities/
  |     |-- internal-task.entity.ts
  |-- internal-tasks.controller.ts
  |-- internal-tasks.module.ts
  |-- internal-tasks.service.ts
```

### Endpoints

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/internal-tasks` | All | Get tasks (filtered by role) |
| GET | `/internal-tasks/stats` | Admin | Get task statistics by employee |
| GET | `/internal-tasks/:id` | All | Get single task |
| POST | `/internal-tasks` | Admin | Create new task |
| PATCH | `/internal-tasks/:id` | All | Update task (admin: all fields, employee: status only) |
| DELETE | `/internal-tasks/:id` | Admin | Delete task |

### Role-Based Access Control

- **Admin**: Full CRUD, can see all tasks and stats
- **Employee**: Can only see tasks assigned to them, can only update status

### Controller Logic

```text
// GET /internal-tasks
// If user is admin: return all tasks
// If user is employee: filter by assignedTo = user.id

// PATCH /internal-tasks/:id  
// If user is employee: only allow status field update
// If user is admin: allow all field updates
```

---

## 3. Database Migration

A new TypeORM migration file will be created to:
1. Create the `task_priority` enum
2. Create the `task_status` enum  
3. Create the `task_visibility` enum
4. Create the `internal_tasks` table with proper foreign keys

---

## 4. Frontend Implementation (React)

### File Structure

```text
src/
  |-- pages/
  |     |-- InternalTasksPage.tsx
  |-- hooks/
  |     |-- useInternalTasks.ts
  |-- components/
  |     |-- skeletons/
  |           |-- InternalTasksSkeleton.tsx
  |-- i18n/locales/
        |-- fr/
        |     |-- internalTasks.json
        |-- ar/
              |-- internalTasks.json
```

### Page Component: `InternalTasksPage.tsx`

**Admin View ("Command Center"):**
- Stats cards showing:
  - Total active tasks
  - Tasks in progress
  - Completed tasks
- Employee breakdown section with counters per employee
- Full task table with all tasks
- Create/Edit/Delete task dialogs
- Priority filter and search

**Employee View ("My Tasks"):**
- Simple header with personal stats
- Clean horizontal task bars (as per sketch)
- Status toggle (In Progress / Completed)
- Color-coded priority indicators
- No create/delete buttons

### Task Card UI Design

```text
+------------------------------------------------------------------+
| [PRIORITY COLOR BAR] Task Title                                   |
|   Description preview...                                         |
|   Created: Jan 15, 2024  |  Due: Jan 20, 2024                   |
|   [Status Toggle: In Progress / Completed]   [Visibility Badge]  |
+------------------------------------------------------------------+
```

Priority colors:
- Urgent: `bg-orange-500` / `border-l-orange-500`
- Normal: `bg-green-500` / `border-l-green-500`
- Critical: `bg-red-500` / `border-l-red-500`

---

## 5. API Integration

### Types (src/types/index.ts)

```text
// New types to add:
TaskPriority = 'urgent' | 'normal' | 'critical'
TaskStatus = 'in_progress' | 'completed'
TaskVisibility = 'clear' | 'unreadable'

interface InternalTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignedTo: string;
  assignee?: User;
  createdBy: string;
  creator?: User;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  byEmployee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    inProgress: number;
    completed: number;
  }[];
}
```

### API Methods (src/lib/api.ts)

```text
// DTOs
CreateInternalTaskDto { title, description?, priority, assignedTo, dueDate?, visibility? }
UpdateInternalTaskDto { title?, description?, priority?, status?, visibility?, dueDate? }

// Methods
getInternalTasks(filters?: TaskFilters): Promise<InternalTask[]>
getInternalTaskStats(): Promise<TaskStats>
getInternalTask(id: string): Promise<InternalTask>
createInternalTask(data: CreateInternalTaskDto): Promise<InternalTask>
updateInternalTask(id: string, data: UpdateInternalTaskDto): Promise<InternalTask>
deleteInternalTask(id: string): Promise<void>
```

### React Query Hook (src/hooks/useInternalTasks.ts)

```text
useInternalTasks(filters?)
useInternalTaskStats()
useCreateInternalTask()
useUpdateInternalTask()
useDeleteInternalTask()
```

---

## 6. Navigation & Routing

### App.tsx Updates

Add new route:
```text
<Route
  path="/missions-internes"
  element={
    <ProtectedRoute>
      <InternalTasksPage />
    </ProtectedRoute>
  }
/>
```

Note: Route is accessible to all authenticated users (both admin and employee)

### Sidebar Updates (AppSidebar.tsx)

Add to `mainMenuItems`:
```text
{
  titleKey: 'navigation.internalTasks',
  url: '/missions-internes',
  icon: ClipboardCheck  // from lucide-react
}
```

---

## 7. Translations (i18n)

### French (fr/internalTasks.json)

```text
{
  "title": "Missions Internes",
  "subtitle": "Gestion des tâches internes de l'agence",
  "myTasks": "Mes Tâches",
  "allTasks": "Toutes les Tâches",
  "stats": {
    "total": "Total des tâches",
    "inProgress": "En cours",
    "completed": "Terminées"
  },
  "priority": {
    "urgent": "Urgent",
    "normal": "Normal",
    "critical": "Critique"
  },
  "status": {
    "in_progress": "En cours",
    "completed": "Terminé"
  },
  "visibility": {
    "clear": "Clair",
    "unreadable": "Illisible"
  },
  "form": {
    "title": "Titre",
    "description": "Description",
    "priority": "Priorité",
    "assignTo": "Assigner à",
    "dueDate": "Date limite",
    "visibility": "Visibilité"
  },
  "dialog": {
    "createTitle": "Nouvelle tâche",
    "editTitle": "Modifier la tâche"
  },
  "actions": {
    "newTask": "Nouvelle tâche",
    "markComplete": "Marquer terminé",
    "markInProgress": "Marquer en cours"
  },
  "empty": {
    "noTasks": "Aucune tâche",
    "noTasksDesc": "Les tâches assignées apparaîtront ici"
  },
  "employeeStats": "Statistiques par employé"
}
```

### Arabic (ar/internalTasks.json)

```text
{
  "title": "المهام الداخلية",
  "subtitle": "إدارة المهام الداخلية للوكالة",
  "myTasks": "مهامي",
  "allTasks": "جميع المهام",
  "stats": {
    "total": "إجمالي المهام",
    "inProgress": "قيد التنفيذ",
    "completed": "مكتملة"
  },
  "priority": {
    "urgent": "عاجل",
    "normal": "عادي",
    "critical": "حرج"
  },
  "status": {
    "in_progress": "قيد التنفيذ",
    "completed": "مكتمل"
  },
  "visibility": {
    "clear": "واضح",
    "unreadable": "غير مقروء"
  },
  "form": {
    "title": "العنوان",
    "description": "الوصف",
    "priority": "الأولوية",
    "assignTo": "تعيين إلى",
    "dueDate": "تاريخ الاستحقاق",
    "visibility": "الوضوح"
  },
  "dialog": {
    "createTitle": "مهمة جديدة",
    "editTitle": "تعديل المهمة"
  },
  "actions": {
    "newTask": "مهمة جديدة",
    "markComplete": "تعيين كمكتمل",
    "markInProgress": "تعيين كقيد التنفيذ"
  },
  "empty": {
    "noTasks": "لا توجد مهام",
    "noTasksDesc": "ستظهر المهام المعينة هنا"
  },
  "employeeStats": "إحصائيات حسب الموظف"
}
```

### Common translations update (fr/common.json & ar/common.json)

Add to navigation section:
```text
"internalTasks": "Missions Internes"  // French
"internalTasks": "المهام الداخلية"    // Arabic
```

---

## 8. Implementation Order

1. **Backend First:**
   - Create entity file with enums
   - Create DTOs
   - Create service with all methods
   - Create controller with role guards
   - Create module and register in app.module
   - Generate and run migration

2. **Frontend Types & API:**
   - Add types to src/types/index.ts
   - Add API methods to src/lib/api.ts
   - Create useInternalTasks hook

3. **UI Components:**
   - Create skeleton component
   - Create main page with dual views (admin/employee)
   - Add translations

4. **Navigation:**
   - Update AppSidebar.tsx
   - Update App.tsx with route

5. **Testing:**
   - Verify admin can create/assign/delete tasks
   - Verify employee can only see own tasks
   - Verify employee can only update status
   - Verify priority colors display correctly
   - Test RTL Arabic layout

---

## 9. Security Considerations

- Backend validates user role before allowing create/delete operations
- Backend filters tasks by `assignedTo` for non-admin users
- Employee PATCH requests are sanitized to only allow `status` field updates
- All endpoints protected by JWT authentication
- Strict data isolation maintained (employees cannot see other employees' tasks)

---

## 10. Files to Create/Modify

### New Files (12)
1. `server/src/internal-tasks/entities/internal-task.entity.ts`
2. `server/src/internal-tasks/dto/create-internal-task.dto.ts`
3. `server/src/internal-tasks/dto/update-internal-task.dto.ts`
4. `server/src/internal-tasks/internal-tasks.service.ts`
5. `server/src/internal-tasks/internal-tasks.controller.ts`
6. `server/src/internal-tasks/internal-tasks.module.ts`
7. `server/src/database/migrations/TIMESTAMP-AddInternalTasks.ts`
8. `src/pages/InternalTasksPage.tsx`
9. `src/hooks/useInternalTasks.ts`
10. `src/components/skeletons/InternalTasksSkeleton.tsx`
11. `src/i18n/locales/fr/internalTasks.json`
12. `src/i18n/locales/ar/internalTasks.json`

### Files to Modify (6)
1. `server/src/app.module.ts` - Import InternalTasksModule
2. `src/types/index.ts` - Add task types
3. `src/lib/api.ts` - Add API methods
4. `src/App.tsx` - Add route
5. `src/components/layout/AppSidebar.tsx` - Add navigation item
6. `src/i18n/index.ts` - Import new translation namespace

