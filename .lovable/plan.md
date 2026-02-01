
# Plan: Implement Omra Management Module

## Overview

This plan creates a dedicated **Omra** tab/section for managing Omra (Islamic pilgrimage) services. The module will include:
- **Omra Orders**: Pilgrimage bookings with name, date, and period (from/to)
- **Omra Visas**: Visa applications with name, date, entry date, and hotel
- **Hotel Management**: Hotels with room configuration (1-5 rooms + suite option)

## Architecture Decision

Based on the existing codebase structure, the Omra module will be implemented as a **separate, dedicated module** rather than extending the existing commands system. This approach:
- Keeps Omra-specific logic isolated and maintainable
- Allows for specialized fields and business rules
- Follows the existing modular pattern (commands, payments, suppliers, etc.)

---

## Backend Changes (NestJS)

### 1. Create Omra Module Structure

```
server/src/omra/
├── dto/
│   ├── create-omra-order.dto.ts
│   ├── update-omra-order.dto.ts
│   ├── create-omra-visa.dto.ts
│   ├── update-omra-visa.dto.ts
│   ├── create-omra-hotel.dto.ts
│   └── update-omra-hotel.dto.ts
├── entities/
│   ├── omra-order.entity.ts
│   ├── omra-visa.entity.ts
│   └── omra-hotel.entity.ts
├── omra.controller.ts
├── omra.service.ts
└── omra.module.ts
```

### 2. Database Entities

**OmraHotel Entity:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | string | Hotel name |
| location | string | Hotel location (city) |
| roomTypes | jsonb | Room configuration (1-5 rooms, suite) |
| isActive | boolean | Active status |
| createdAt | timestamp | Creation date |

**OmraOrder Entity:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| clientName | string | Client full name |
| phone | string | Contact phone |
| orderDate | date | Order creation date |
| periodFrom | date | Start of pilgrimage period |
| periodTo | date | End of pilgrimage period |
| hotelId | UUID | Foreign key to hotel |
| roomType | enum | Room selection (chambre_1 to chambre_5, suite) |
| status | enum | Order status |
| sellingPrice | decimal | Selling price |
| amountPaid | decimal | Amount paid |
| buyingPrice | decimal | Cost price |
| notes | text | Additional notes |
| createdBy | UUID | User who created |
| createdAt | timestamp | Creation date |

**OmraVisa Entity:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| clientName | string | Client full name |
| phone | string | Contact phone |
| visaDate | date | Visa application date |
| entryDate | date | Entry date (date entree) |
| hotelId | UUID | Foreign key to hotel |
| status | enum | Visa status |
| sellingPrice | decimal | Selling price |
| amountPaid | decimal | Amount paid |
| buyingPrice | decimal | Cost price |
| notes | text | Additional notes |
| createdBy | UUID | User who created |
| createdAt | timestamp | Creation date |

### 3. Room Type Enum

```typescript
export enum OmraRoomType {
  CHAMBRE_1 = 'chambre_1',
  CHAMBRE_2 = 'chambre_2',
  CHAMBRE_3 = 'chambre_3',
  CHAMBRE_4 = 'chambre_4',
  CHAMBRE_5 = 'chambre_5',
  SUITE = 'suite',
}
```

### 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /omra/orders | List all Omra orders |
| POST | /omra/orders | Create new order |
| PATCH | /omra/orders/:id | Update order |
| DELETE | /omra/orders/:id | Delete order |
| GET | /omra/visas | List all Omra visas |
| POST | /omra/visas | Create new visa |
| PATCH | /omra/visas/:id | Update visa |
| DELETE | /omra/visas/:id | Delete visa |
| GET | /omra/hotels | List all hotels |
| POST | /omra/hotels | Create new hotel |
| PATCH | /omra/hotels/:id | Update hotel |
| DELETE | /omra/hotels/:id | Delete hotel |
| GET | /omra/stats | Get Omra statistics |

### 5. Register Module

Update `server/src/app.module.ts` to include `OmraModule`.

---

## Frontend Changes (React)

### 1. New Files Structure

```
src/
├── pages/
│   └── OmraPage.tsx              # Main Omra page with tabs
├── hooks/
│   └── useOmra.ts                # React Query hooks for Omra
├── components/
│   └── omra/
│       ├── OmraOrdersTab.tsx     # Orders list and management
│       ├── OmraVisasTab.tsx      # Visas list and management
│       ├── OmraHotelsTab.tsx     # Hotels management
│       ├── OmraOrderForm.tsx     # Order creation/edit form
│       ├── OmraVisaForm.tsx      # Visa creation/edit form
│       └── OmraHotelForm.tsx     # Hotel creation/edit form
└── components/skeletons/
    └── OmraSkeleton.tsx          # Loading skeleton
```

### 2. Types Definition

Add to `src/types/index.ts`:

```typescript
// Omra Types
export type OmraRoomType = 'chambre_1' | 'chambre_2' | 'chambre_3' | 'chambre_4' | 'chambre_5' | 'suite';
export type OmraStatus = 'en_attente' | 'confirme' | 'termine' | 'annule';

export interface OmraHotel {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
}

export interface OmraOrder {
  id: string;
  clientName: string;
  phone: string;
  orderDate: Date;
  periodFrom: Date;
  periodTo: Date;
  hotelId: string;
  hotel?: OmraHotel;
  roomType: OmraRoomType;
  status: OmraStatus;
  sellingPrice: number;
  amountPaid: number;
  buyingPrice: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface OmraVisa {
  id: string;
  clientName: string;
  phone: string;
  visaDate: Date;
  entryDate: Date;
  hotelId: string;
  hotel?: OmraHotel;
  status: OmraStatus;
  sellingPrice: number;
  amountPaid: number;
  buyingPrice: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}
```

### 3. API Client Extensions

Add to `src/lib/api.ts`:

```typescript
// Omra endpoints
getOmraOrders = (): Promise<OmraOrder[]> => this.request('/omra/orders');
createOmraOrder = (data: CreateOmraOrderDto): Promise<OmraOrder> => ...
updateOmraOrder = (id: string, data: UpdateOmraOrderDto): Promise<OmraOrder> => ...
deleteOmraOrder = (id: string): Promise<void> => ...

getOmraVisas = (): Promise<OmraVisa[]> => this.request('/omra/visas');
createOmraVisa = (data: CreateOmraVisaDto): Promise<OmraVisa> => ...
updateOmraVisa = (id: string, data: UpdateOmraVisaDto): Promise<OmraVisa> => ...
deleteOmraVisa = (id: string): Promise<void> => ...

getOmraHotels = (): Promise<OmraHotel[]> => this.request('/omra/hotels');
createOmraHotel = (data: CreateOmraHotelDto): Promise<OmraHotel> => ...
updateOmraHotel = (id: string, data: UpdateOmraHotelDto): Promise<OmraHotel> => ...
deleteOmraHotel = (id: string): Promise<void> => ...
```

### 4. Navigation Update

Add Omra to sidebar in `src/components/layout/AppSidebar.tsx`:

```typescript
import { Palmtree } from 'lucide-react'; // or similar icon

const mainMenuItems = [
  // ... existing items
  {
    title: 'Omra',
    url: '/omra',
    icon: Palmtree, // Pilgrimage-related icon
  },
];
```

### 5. Routing Update

Add to `src/App.tsx`:

```typescript
import OmraPage from './pages/OmraPage';

// In routes:
<Route
  path="/omra"
  element={
    <ProtectedRoute>
      <OmraPage />
    </ProtectedRoute>
  }
/>
```

### 6. Omra Page Layout

The page will use tabs (similar to existing patterns):

```
┌─────────────────────────────────────────────────────────┐
│  Omra Management                                        │
│  Gestion des services Omra                              │
├─────────────────────────────────────────────────────────┤
│  [Commandes]  [Visas]  [Hotels]                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Summary Cards (Total orders, visas, revenue)           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  + Nouvelle Commande    [Search] [Filters]              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │ Table: Client | Date | Période | Hotel | Chambre│   │
│  │              | Status | Prix | Actions          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Backend (NestJS)
1. Create entity files for OmraHotel, OmraOrder, OmraVisa
2. Create DTOs for create/update operations
3. Create OmraService with CRUD operations
4. Create OmraController with API endpoints
5. Create OmraModule and register in AppModule
6. Run database synchronization (TypeORM will create tables)

### Phase 2: Frontend - Types & API
1. Add Omra types to `src/types/index.ts`
2. Add Omra API methods to `src/lib/api.ts`
3. Create `useOmra.ts` hook with React Query

### Phase 3: Frontend - UI Components
1. Create skeleton component `OmraSkeleton.tsx`
2. Create form components (OmraOrderForm, OmraVisaForm, OmraHotelForm)
3. Create tab components (OmraOrdersTab, OmraVisasTab, OmraHotelsTab)
4. Create main `OmraPage.tsx` with tab navigation

### Phase 4: Integration
1. Add Omra route to `App.tsx`
2. Add Omra menu item to sidebar
3. Test all CRUD operations

---

## Technical Details

### Room Type Display Labels

```typescript
const roomTypeLabels: Record<OmraRoomType, string> = {
  chambre_1: 'Chambre 1 personne',
  chambre_2: 'Chambre 2 personnes',
  chambre_3: 'Chambre 3 personnes',
  chambre_4: 'Chambre 4 personnes',
  chambre_5: 'Chambre 5 personnes',
  suite: 'Suite',
};
```

### Status Labels

```typescript
const omraStatusLabels: Record<OmraStatus, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  termine: 'Terminé',
  annule: 'Annulé',
};
```

---

## Files to Create/Modify

### New Files (Backend - 10 files)
| File | Description |
|------|-------------|
| `server/src/omra/entities/omra-hotel.entity.ts` | Hotel entity |
| `server/src/omra/entities/omra-order.entity.ts` | Order entity |
| `server/src/omra/entities/omra-visa.entity.ts` | Visa entity |
| `server/src/omra/dto/create-omra-hotel.dto.ts` | Create hotel DTO |
| `server/src/omra/dto/create-omra-order.dto.ts` | Create order DTO |
| `server/src/omra/dto/create-omra-visa.dto.ts` | Create visa DTO |
| `server/src/omra/dto/update-omra-hotel.dto.ts` | Update hotel DTO |
| `server/src/omra/dto/update-omra-order.dto.ts` | Update order DTO |
| `server/src/omra/dto/update-omra-visa.dto.ts` | Update visa DTO |
| `server/src/omra/omra.service.ts` | Omra service |
| `server/src/omra/omra.controller.ts` | Omra controller |
| `server/src/omra/omra.module.ts` | Omra module |

### New Files (Frontend - 8 files)
| File | Description |
|------|-------------|
| `src/pages/OmraPage.tsx` | Main Omra page |
| `src/hooks/useOmra.ts` | React Query hooks |
| `src/components/omra/OmraOrdersTab.tsx` | Orders tab |
| `src/components/omra/OmraVisasTab.tsx` | Visas tab |
| `src/components/omra/OmraHotelsTab.tsx` | Hotels tab |
| `src/components/omra/OmraOrderForm.tsx` | Order form dialog |
| `src/components/omra/OmraVisaForm.tsx` | Visa form dialog |
| `src/components/omra/OmraHotelForm.tsx` | Hotel form dialog |
| `src/components/skeletons/OmraSkeleton.tsx` | Loading skeleton |

### Modified Files (4 files)
| File | Change |
|------|--------|
| `server/src/app.module.ts` | Import OmraModule |
| `src/types/index.ts` | Add Omra types |
| `src/lib/api.ts` | Add Omra API methods |
| `src/components/layout/AppSidebar.tsx` | Add Omra menu item |
| `src/App.tsx` | Add Omra route |

---

## VPS Deployment Note

After implementing the backend changes, you will need to:
1. Pull the latest code on your VPS
2. Run `npm run build` in the server directory
3. Restart the NestJS server (TypeORM will auto-create tables in development mode)
