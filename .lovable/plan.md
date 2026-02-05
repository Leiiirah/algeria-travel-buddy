
# Enhanced Invoice PDF Generation - Professional Travel Agency Format

## Overview

This plan implements a complete overhaul of the invoice PDF generation to match the professional travel agency format provided. The invoices will include all agency legal information, detailed service breakdowns, proper formatting for both Proforma and Final invoices, and be print-ready.

## Current vs. Target Format

| Element | Current | Target |
|---------|---------|--------|
| Agency Info | Logo + name only | Full address, tel, email, RC, NIF |
| Client Info | Name, phone | Name, passport number |
| Service Details | Basic service name | Itinerary, company, dates, class, PNR |
| Price Breakdown | Total only | Price + agency fees breakdown |
| Legal | Basic disclaimer | Conditions, TVA line, legal notices |
| Footer | Timestamp only | Stamp/signature area |

## Data Model Changes

### 1. Backend: Add missing fields to `client_invoice` entity

New columns needed:
- `clientPassport` (string, nullable) - Passport number
- `companyName` (string, nullable) - Airline/transport company
- `departureDate` (date, nullable) - Travel date
- `returnDate` (date, nullable) - Return date (if applicable)
- `pnr` (string, nullable) - Booking reference (PNR)
- `travelClass` (string, nullable) - Economy, Business, etc.
- `ticketPrice` (decimal, nullable) - Base price before agency fees
- `agencyFees` (decimal, nullable) - Agency service fees
- `paymentMethod` (string, nullable) - Cash, transfer, etc.
- `validityHours` (int, default 48) - Proforma validity in hours

### 2. Backend: Create agency config table or constants

Store agency legal information:
- Agency name: "Al Hikma Voyages" / "EL HIKMA TOURISME ET VOYAGE"
- Address: "Blida – Algérie"
- Phone: "025 XX XX XX"
- Email: "info@alhikma.dz"
- RC: "09/00-1234567"
- NIF: "001234567890123"

## Frontend Changes

### 1. Update Invoice Form (`src/pages/InvoicesPage.tsx`)

Add new form fields:
- Passport number input
- Company name input
- Departure date picker
- Return date picker (optional)
- Travel class select (Économique, Affaires, Première)
- Ticket base price input
- Agency fees input (auto-calculate total)
- Payment method select
- PNR input (for final invoices)

### 2. Rewrite PDF Generator (`src/utils/invoiceGenerator.ts`)

Complete restructure of `generateClientInvoicePdf()`:

```text
┌──────────────────────────────────────────────┐
│                [AGENCY LOGO]                 │
│                                              │
│    Agence : Al Hikma Voyages                 │
│    Adresse : Blida – Algérie                 │
│    Tel : 025 XX XX XX                        │
│    Email : info@alhikma.dz                   │
│    RC : 09/00-1234567 (finale only)          │
│    NIF : 001234567890123 (finale only)       │
├──────────────────────────────────────────────┤
│          FACTURE PROFORMA / FACTURE          │
│        N° PRO-20260204-001 / F-2026-089      │
│                                              │
│    Client : Mohamed Al-Faransi               │
│    Passeport : P12345678                     │
│    Date : 04/02/2026                         │
├──────────────────────────────────────────────┤
│    Prestation : Billet d'avion international │
│                                              │
│    Itinéraire : Alger ✈ Istanbul             │
│    Compagnie : Turkish Airlines              │
│    Date de départ : 20/02/2026               │
│    Classe : Économique                       │
│    PNR : AB4K9Q (finale only)                │
├──────────────────────────────────────────────┤
│    Prix du billet : 95 000 DA                │
│    Frais agence : 5 000 DA                   │
│    ─────────────────────────                 │
│    Total HT : 100 000 DA                     │
│    TVA (0%) : 0                              │
│    Total TTC : 100 000 DA                    │
├──────────────────────────────────────────────┤
│    Conditions (proforma):                    │
│    • Paiement avant émission du billet       │
│    • Validité de l'offre : 48 heures         │
│    ─────────────────────────                 │
│    ⚠ Facture proforma, non valable           │
│      pour la comptabilité                    │
│                                              │
│    OU (finale):                              │
│    Mode de paiement : Espèces                │
│    Billet émis et non remboursable           │
├──────────────────────────────────────────────┤
│                                              │
│              Cachet et Signature             │
│                                              │
│                [Empty space]                 │
│                                              │
└──────────────────────────────────────────────┘
```

### 3. Update Translation Files

Add new keys in `src/i18n/locales/fr/invoices.json` and `ar/invoices.json`:
- `form.clientPassport`: "Passeport" / "جواز السفر"
- `form.companyName`: "Compagnie" / "الشركة"
- `form.departureDate`: "Date de départ" / "تاريخ المغادرة"
- `form.returnDate`: "Date de retour" / "تاريخ العودة"
- `form.travelClass`: "Classe" / "الدرجة"
- `form.ticketPrice`: "Prix billet" / "سعر التذكرة"
- `form.agencyFees`: "Frais agence" / "رسوم الوكالة"
- `form.pnr`: "PNR" / "رقم الحجز"
- `form.paymentMethod`: "Mode de paiement" / "طريقة الدفع"
- `pdf.conditions`: "Conditions" / "الشروط"
- `pdf.stampSignature`: "Cachet et Signature" / "الختم والتوقيع"
- Travel class options: Économique, Affaires, Première

### 4. Update API DTOs and Types

Update `CreateClientInvoiceDto` and `UpdateClientInvoiceDto` to include new fields.

## Files to Modify

| File | Changes |
|------|---------|
| `server/src/client-invoices/entities/client-invoice.entity.ts` | Add new columns |
| `server/src/client-invoices/dto/create-client-invoice.dto.ts` | Add new fields |
| `server/src/client-invoices/dto/update-client-invoice.dto.ts` | Add new fields |
| `server/src/database/migrations/` | New migration for columns |
| `src/lib/api.ts` | Update DTOs |
| `src/types/index.ts` | Update ClientInvoice interface |
| `src/pages/InvoicesPage.tsx` | Add form fields |
| `src/utils/invoiceGenerator.ts` | Complete rewrite of PDF layout |
| `src/i18n/locales/fr/invoices.json` | Add new translation keys |
| `src/i18n/locales/ar/invoices.json` | Add new translation keys |

## PDF Layout Specifications

### Proforma Invoice
1. **Header**: Agency logo + basic info (no legal numbers)
2. **Title**: "FACTURE PROFORMA" in blue
3. **Client**: Name + Passport
4. **Service**: Full itinerary details
5. **Pricing**: Base price + Agency fees = Total
6. **Footer**: Conditions + validity notice + "Non valable pour comptabilité"

### Final Invoice
1. **Header**: Agency logo + full legal info (RC, NIF)
2. **Title**: "FACTURE DÉFINITIVE" or "FACTURE"
3. **Client**: Name + Passport
4. **Service**: Full details + PNR
5. **Pricing**: Base + Fees + TVA line = Total TTC
6. **Payment**: Method + "Billet émis et non remboursable"
7. **Footer**: Stamp & signature area (empty box)

## Agency Constants

Create a constants file or use environment variables:
```typescript
const AGENCY_INFO = {
  name: 'Al Hikma Voyages',
  legalName: 'EL HIKMA TOURISME ET VOYAGE',
  address: 'Blida – Algérie',
  phone: '025 XX XX XX',
  email: 'info@alhikma.dz',
  rc: '09/00-1234567',
  nif: '001234567890123',
};
```

## Summary

This enhancement will transform basic invoices into professional, print-ready documents matching travel agency standards. The user fills in the invoice form, and upon download, receives a properly formatted PDF ready for printing and official use.
