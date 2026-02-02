

# Plan: Dynamic Service Types Management

## Overview

Transform service types from a hardcoded enum to a dynamic database-managed system, allowing admins to create, edit, and delete service types.

---

## Current State

| Component | Current Implementation |
|-----------|----------------------|
| Backend | `ServiceType` enum with 7 fixed values |
| Frontend Types | `ServiceType` union type |
| Services | Each service has a `type` field (enum value) |
| Suppliers | Array of `serviceTypes` strings |
| UI | Hardcoded Select options and icons |

---

## Proposed Architecture

### New Database Entity: `ServiceType`

A new table to store dynamic service types that admins can manage:

```text
service_types
├── id (uuid, primary key)
├── code (string, unique) - e.g., "visa", "residence", "billet_bateau"
├── nameFr (string) - French label
├── nameAr (string) - Arabic label
├── icon (string) - Icon identifier from lucide-react
├── isActive (boolean, default: true)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

---

## Files to Create

### Backend

| File | Description |
|------|-------------|
| `server/src/service-types/entities/service-type.entity.ts` | New database entity |
| `server/src/service-types/dto/create-service-type.dto.ts` | Create DTO |
| `server/src/service-types/dto/update-service-type.dto.ts` | Update DTO |
| `server/src/service-types/service-types.service.ts` | CRUD service |
| `server/src/service-types/service-types.controller.ts` | REST endpoints |
| `server/src/service-types/service-types.module.ts` | Module definition |

### Frontend

| File | Description |
|------|-------------|
| `src/hooks/useServiceTypes.ts` | React Query hooks for service types |
| `src/pages/ServiceTypesPage.tsx` | Admin page to manage service types |

---

## Files to Modify

### Backend

| File | Changes |
|------|---------|
| `server/src/app.module.ts` | Import ServiceTypesModule |
| `server/src/services/entities/service.entity.ts` | Change `type` from enum to string (references service_type code) |
| `server/src/services/dto/create-service.dto.ts` | Update type validation |
| `server/src/services/dto/update-service.dto.ts` | Update type validation |

### Frontend

| File | Changes |
|------|---------|
| `src/types/index.ts` | Remove hardcoded `ServiceType` union, add `ServiceTypeEntity` interface |
| `src/lib/api.ts` | Add API methods for service types CRUD, update DTOs |
| `src/pages/ServicesPage.tsx` | Fetch service types dynamically, show dynamic icons |
| `src/pages/SuppliersPage.tsx` | Fetch service types for the dropdown |
| `src/lib/utils.ts` | Remove `getServiceTypeLabel` or make it dynamic |
| `src/i18n/locales/fr/common.json` | Remove hardcoded `serviceTypes` (now in DB) |
| `src/i18n/locales/ar/common.json` | Remove hardcoded `serviceTypes` (now in DB) |
| `src/App.tsx` | Add route for ServiceTypesPage |

---

## New API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/service-types` | List all service types | Any authenticated |
| GET | `/service-types/active` | List active service types | Any authenticated |
| POST | `/service-types` | Create new service type | Admin only |
| PATCH | `/service-types/:id` | Update service type | Admin only |
| DELETE | `/service-types/:id` | Soft delete (set isActive=false) | Admin only |

---

## UI: Service Types Management Page

A new admin-only page at `/settings/service-types` with:

1. **List view** - Cards or table showing all service types
2. **Create dialog** - Form with:
   - Code (unique identifier, e.g., "visa")
   - French name
   - Arabic name
   - Icon selector (dropdown with available Lucide icons)
3. **Edit functionality** - Modify existing types
4. **Toggle active/inactive** - Soft delete capability
5. **Protection** - Cannot delete types that are in use by services

---

## Icon Management

Available icons that admins can choose from:

```text
FileText, Plane, Hotel, Folder, Ship, Bus, Ticket,
Globe, CreditCard, Briefcase, MapPin, Users, Package
```

The icon code is stored as a string (e.g., "Plane") and mapped to the actual component at runtime.

---

## Migration Strategy

1. Create `service_types` table
2. Seed with existing 7 types (visa, residence, ticket, dossier, billet_bateau, billet_tilex, billets)
3. Modify `services` table to use string instead of enum for `type`
4. Update all frontend components to use dynamic types

---

## Translation Files

### French (`src/i18n/locales/fr/serviceTypes.json`)

```json
{
  "title": "Types de services",
  "subtitle": "Gérez les catégories de services proposés",
  "dialog": {
    "createTitle": "Nouveau type de service",
    "editTitle": "Modifier le type",
    "createDesc": "Ajoutez une nouvelle catégorie de service",
    "editDesc": "Modifiez les informations du type"
  },
  "form": {
    "code": "Code",
    "codePlaceholder": "ex: visa_schengen",
    "nameFr": "Nom (Français)",
    "nameAr": "Nom (Arabe)",
    "icon": "Icône",
    "selectIcon": "Choisir une icône"
  },
  "actions": {
    "newType": "Nouveau type",
    "create": "Créer",
    "edit": "Modifier"
  },
  "empty": {
    "title": "Aucun type de service",
    "description": "Créez votre premier type de service"
  },
  "errors": {
    "codeExists": "Ce code existe déjà",
    "inUse": "Ce type est utilisé par des services et ne peut être supprimé"
  }
}
```

---

## Summary

| Category | Files |
|----------|-------|
| **New Backend Files** | 6 files (entity, DTOs, service, controller, module) |
| **New Frontend Files** | 3 files (hook, page, translations) |
| **Modified Backend** | 4 files |
| **Modified Frontend** | 7 files |
| **Total** | ~20 files |

This change allows admins to fully manage service types without code changes, with proper bilingual support and icon customization.

