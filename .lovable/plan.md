

# Refactor Documents Module into a Hierarchical File System (Google Drive-like)

## Overview

Transform the flat 4-category Documents module into a recursive, folder-based file system. Users will navigate folders and sub-folders freely, with breadcrumb navigation, contextual uploads, and folder creation -- all while maintaining the existing role-based permissions.

## Architecture Changes

### 1. Data Model Overhaul

**Replace the `documents` table with a unified `document_nodes` table** that supports both folders and files in a self-referencing tree structure.

**Entity: `DocumentNode`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `name` | VARCHAR | Folder or file name |
| `type` | ENUM('folder', 'file') | Node type |
| `parentId` | UUID (nullable, FK -> self) | Parent folder (null = root) |
| `fileUrl` | VARCHAR (nullable) | Stored filename (files only) |
| `uploadedBy` | UUID (FK -> users) | Who created/uploaded |
| `createdAt` | TIMESTAMP | Auto-generated |
| `updatedAt` | TIMESTAMP | Auto-generated |

- The `category` enum column is removed entirely.
- The old categories (Assurance, CNAS, CASNOS, Autre) become seed data: 4 root-level folder rows inserted via the migration.

### 2. Database Migration

Create migration `1770600000000-RefactorDocumentsToHierarchy.ts`:

1. Add columns `type` (default 'file'), `parentId` (nullable self-FK) to the existing `documents` table.
2. Rename table to `document_nodes` (or keep `documents` -- keeping `documents` is simpler for backward compat).
3. Insert 4 system folders at root level: Assurance, CNAS, CASNOS, Autre.
4. Migrate existing file records: set their `parentId` to the matching system folder based on their `category` value.
5. Drop the `category` column.
6. Add an index on `parentId` for efficient directory listing.

### 3. Backend Changes

**Files to modify/create:**

#### `server/src/documents/entities/document.entity.ts`
- Remove `DocumentCategory` enum.
- Add `DocumentNodeType` enum: `'folder' | 'file'`.
- Add `type` column (enum, default 'file').
- Add `parentId` column (nullable UUID, self-referencing FK).
- Add `parent` relation (ManyToOne self-ref).
- Add `children` relation (OneToMany self-ref).
- Make `fileUrl` nullable (folders don't have files).

#### `server/src/documents/dto/document.dto.ts`
- Replace `UploadDocumentDto`: remove `category`, add optional `parentId` (UUID).
- Add `CreateFolderDto`: `name` (required), `parentId` (optional UUID).
- Update `UpdateDocumentDto`: replace `category` with `name` only.
- Add `MoveNodeDto`: `parentId` (nullable UUID) for drag-and-drop moves.

#### `server/src/documents/documents.service.ts`
- `findByParent(parentId?: string)`: List nodes where `parentId` matches (null for root). Return folders first, then files, ordered by name.
- `createFolder(name, parentId, userId)`: Create a folder node.
- `upload(dto, file, userId)`: Create a file node with `parentId` from DTO.
- `remove(id)`: **Recursive delete** -- find all descendants, delete their physical files, then remove all nodes.
- `move(id, newParentId)`: Update `parentId`.
- `getAncestors(id)`: Walk up the tree via `parentId` to build the breadcrumb path.
- Remove the category-based `findAll` query.

#### `server/src/documents/documents.controller.ts`
- `GET /documents?parentId=xxx` -- List contents of a folder (omit parentId for root).
- `GET /documents/:id/ancestors` -- Get breadcrumb path.
- `POST /documents/folder` -- Create folder (Admin only).
- `POST /documents/upload` -- Upload file into folder (Admin only).
- `PATCH /documents/:id` -- Rename node (Admin only).
- `PATCH /documents/:id/move` -- Move node to another folder (Admin only).
- `DELETE /documents/:id` -- Recursive delete (Admin only).
- `GET /documents/:id/download` -- Download file (unchanged).

### 4. Frontend Changes

#### `src/types/index.ts`
- Remove `DocumentCategory` type.
- Replace `Document` interface with `DocumentNode`:
```typescript
type DocumentNodeType = 'folder' | 'file';
interface DocumentNode {
  id: string;
  name: string;
  type: DocumentNodeType;
  parentId: string | null;
  fileUrl: string | null;
  uploadedBy: string;
  uploader?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `src/lib/api.ts`
- Update DTOs: `UploadDocumentDto` (remove `category`, add `parentId`), add `CreateFolderDto`.
- `getDocuments(parentId?)` -> `GET /documents?parentId=xxx`
- `getDocumentAncestors(id)` -> `GET /documents/:id/ancestors`
- `createFolder(name, parentId?)` -> `POST /documents/folder`
- `moveDocument(id, parentId)` -> `PATCH /documents/:id/move`
- Keep `uploadDocument`, `deleteDocument`, `getDocumentDownloadUrl`.

#### `src/hooks/useDocuments.ts`
- `useDocuments(parentId?)` -- query key includes `parentId`.
- `useDocumentAncestors(id)` -- fetches breadcrumb path.
- `useCreateFolder()` -- mutation for folder creation.
- `useMoveDocument()` -- mutation for move.
- Keep `useUploadDocument`, `useDeleteDocument` (updated to invalidate by parentId).

#### `src/pages/DocumentsPage.tsx` -- Complete Rewrite

The page becomes a folder navigator:

**State Management:**
- `currentFolderId: string | null` -- tracks which folder is being viewed (null = root).
- `searchQuery` for filtering within current folder.

**UI Sections:**

1. **Breadcrumb Bar** (new component `DocumentBreadcrumbs`):
   - Shows: `Documents > Assurance > 2026 > Q1`
   - Each segment is clickable to navigate up.
   - Home icon at the start (or end in RTL).
   - Uses the `/documents/:id/ancestors` API.

2. **Toolbar:**
   - Search input (filters current folder contents).
   - "New Folder" button (Admin only) -- opens a simple dialog for folder name.
   - "Upload PDF" button (Admin only) -- uploads into the current folder.

3. **Content Grid:**
   - **Folders first**, displayed as cards with folder icons (yellow/amber).
   - **Files second**, displayed as cards with PDF icons (red).
   - Clicking a folder card sets `currentFolderId` to that folder's ID.
   - Clicking a file shows download/delete actions.
   - Each card shows: name, date, and action buttons on hover (download, rename, delete for admins).

4. **Empty State:**
   - "This folder is empty" with a folder icon when no items exist.

#### New Component: `src/components/documents/DocumentBreadcrumbs.tsx`
- Receives `ancestors` array + current folder name.
- Renders a clickable breadcrumb trail.
- Supports RTL: flips Home icon position and separator direction.
- Uses `ChevronRight` (LTR) or `ChevronLeft` (RTL) separators.

#### Updated: `src/components/skeletons/DocumentsSkeleton.tsx`
- Replace category card skeletons with breadcrumb skeleton + grid skeleton.

#### Updated: `src/lib/utils.ts`
- Remove `getDocumentCategoryLabel` function (no longer needed).

### 5. Translation Updates

#### `src/i18n/locales/fr/documents.json`
```json
{
  "title": "Bibliothèque de documents",
  "subtitle": "Gestion electronique des documents (GED)",
  "breadcrumbs": {
    "root": "Documents"
  },
  "actions": {
    "newFolder": "Nouveau dossier",
    "upload": "Televerser un PDF",
    "uploading": "Televersement...",
    "download": "Telecharger",
    "rename": "Renommer",
    "delete": "Supprimer",
    "move": "Deplacer"
  },
  "dialog": {
    "newFolderTitle": "Creer un dossier",
    "newFolderDesc": "Entrez le nom du nouveau dossier",
    "folderName": "Nom du dossier",
    "folderNamePlaceholder": "Ex: 2026",
    "uploadTitle": "Televerser un document",
    "uploadDesc": "Le fichier sera ajoute dans le dossier actuel",
    "fileName": "Nom du document",
    "fileNamePlaceholder": "Ex: Attestation Assurance 2025",
    "file": "Fichier PDF",
    "dropzone": "Glissez-deposez ou cliquez pour selectionner",
    "renameTitle": "Renommer",
    "renameDesc": "Entrez le nouveau nom",
    "deleteTitle": "Confirmer la suppression",
    "deleteFolderWarning": "Ce dossier et tout son contenu seront supprimes definitivement.",
    "deleteFileWarning": "Ce fichier sera supprime definitivement."
  },
  "list": {
    "count": "{{count}} element(s)",
    "folders": "Dossiers",
    "files": "Fichiers"
  },
  "empty": {
    "title": "Ce dossier est vide",
    "description": "Creez un sous-dossier ou televersez un fichier"
  },
  "table": {
    "updatedAt": "Mis a jour le {{date}}"
  },
  "filters": {
    "search": "Rechercher dans ce dossier..."
  }
}
```

#### `src/i18n/locales/ar/documents.json`
Equivalent Arabic translations with proper RTL-aware labels.

### 6. Search Service Update

Update `server/src/search/search.service.ts`:
- Remove category-based search.
- Search by `document.name` only (type = 'file').
- URL in results: `/documents` (since files are now nested, deep-linking will navigate to parent).

### 7. Permission Model (Unchanged Logic)

| Action | Admin | Employee |
|--------|-------|----------|
| View/Navigate folders | Yes | Yes |
| Download files | Yes | Yes |
| Create folders | Yes | No |
| Upload files | Yes | No |
| Rename items | Yes | No |
| Delete items | Yes | No |
| Move items | Yes | No |

## File Change Summary

| File | Action |
|------|--------|
| `server/src/documents/entities/document.entity.ts` | Rewrite: self-ref tree structure |
| `server/src/documents/dto/document.dto.ts` | Rewrite: new DTOs |
| `server/src/documents/documents.service.ts` | Rewrite: folder CRUD + recursive operations |
| `server/src/documents/documents.controller.ts` | Rewrite: new endpoints |
| `server/src/database/migrations/1770600000000-*.ts` | New: schema migration |
| `server/src/search/search.service.ts` | Update: remove category search |
| `src/types/index.ts` | Update: replace Document with DocumentNode |
| `src/lib/api.ts` | Update: new API methods |
| `src/lib/utils.ts` | Update: remove getDocumentCategoryLabel |
| `src/hooks/useDocuments.ts` | Rewrite: folder-aware hooks |
| `src/pages/DocumentsPage.tsx` | Rewrite: folder navigator UI |
| `src/components/documents/DocumentBreadcrumbs.tsx` | New: breadcrumb component |
| `src/components/skeletons/DocumentsSkeleton.tsx` | Update: new skeleton layout |
| `src/i18n/locales/fr/documents.json` | Rewrite: new keys |
| `src/i18n/locales/ar/documents.json` | Rewrite: new keys |

## Implementation Order

1. Database migration (add columns, migrate data, seed system folders)
2. Backend entity + DTOs
3. Backend service (recursive operations)
4. Backend controller (new endpoints)
5. Frontend types + API client
6. Frontend hooks
7. Breadcrumbs component
8. DocumentsPage rewrite
9. Skeleton + translations
10. Search service update

