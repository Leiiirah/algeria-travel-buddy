

# Professional Invoice Template Redesign

## Overview
Completely redesign the `InvoiceTemplate.tsx` component to create a polished, modern, and professional invoice layout. The new design uses a structured grid system, refined typography hierarchy, elegant color accents, and clear visual separation between sections -- all while preserving every existing data field and the bilingual (French/Arabic) support.

## Design Philosophy
- **Clean whitespace**: Generous spacing between sections for readability
- **Strong visual hierarchy**: Clear section headers with subtle accent bars
- **Professional color palette**: Deep green (#1B4332) as primary accent for finale, blue (#1E3A5F) for proforma -- used sparingly for headers and borders
- **Structured data display**: Travel details in a clean 2-column grid layout instead of stacked text lines
- **Prominent financial table**: Proper table with alternating row styling and a bold highlighted total row
- **Signature area**: Bordered dotted-line box for a professional stamp/signature zone
- **Dual-language header**: French name on one side, Arabic name on the other, with logo centered -- creating an official bilingual letterhead

## What the New Layout Looks Like

### Top Section: Bilingual Letterhead
```text
+------------------------------------------------------------------+
|  EL HIKMA TOURISME ET VOYAGE    [LOGO]    الحكمة للسياحة و الاسفار |
|  02 rue de kolea...                       02، طريق القليعة...      |
|  Tel: 025 17 29 68 / 0540 40 00 80  |  elhikmatours@gmail.com     |
|  RC: ... | NIF: ... | NIS: ...                                    |
+------------------------------------------------------------------+
```

### Title Banner
Full-width colored bar with invoice type, number, and date aligned in a single row.

### Two-Column Info Cards
```text
+-------------------------------+  +-------------------------------+
|  CLIENT                       |  |  PRESTATION                   |
|  Nom: Ahmed Benali            |  |  Billet d'avion               |
|  Passeport: A12345678         |  |  Alger -> Istanbul -> Alger   |
|  Tel: 0555 12 34 56           |  |  Air Algerie | Economique     |
+-------------------------------+  |  Depart: 15/03/2026           |
                                   |  Retour: 22/03/2026           |
                                   |  PNR: ABC123                  |
                                   +-------------------------------+
```

### Financial Details Table
```text
+------------------------------------------------------------------+
|  Designation                              |  Montant              |
|-------------------------------------------|---------------------- |
|  Prix du billet                            |  85 000 DA            |
|  Frais agence                             |  15 000 DA            |
|-------------------------------------------|---------------------- |
|  Total HT                                 |  100 000 DA           |
|  TVA (0%)                                 |  0 DA                 |
|===========================================#======================|
|  TOTAL TTC                                |  100 000 DA           |
+------------------------------------------------------------------+
```

### Bottom: Payment + Signature Side by Side
```text
+-------------------------------+  +-------------------------------+
|  REGLEMENT                    |  |                               |
|  Mode: Especes                |  |    Cachet et Signature        |
|  Banque: CCP                  |  |                               |
|  Compte: 00799...             |  |    ..................         |
|                               |  |                               |
|  Arrete la presente facture   |  |                               |
|  a la somme de: Cent mille    |  |                               |
|  Dinars Algeriens             |  |                               |
+-------------------------------+  +-------------------------------+
```

### Footer
Centered Arabic legal details with license and fiscal identifiers.

---

## Technical Details

### File Changed

| File | Action | Description |
|------|--------|-------------|
| `src/components/invoice/InvoiceTemplate.tsx` | Rewrite | Complete visual redesign with new layout structure |

No other files change. The `invoiceGenerator.ts`, data interfaces, `ClientInvoicePdfData`, `AgencyInfoParam` -- all remain identical. The component still accepts the exact same props.

### Design Specifications

**Colors:**
- Finale accent: `#1B4332` (deep forest green) for headers, borders, and total row
- Proforma accent: `#1E3A5F` (deep navy blue)
- Section headers: White text on accent-colored background strips
- Financial table total row: Accent background with white bold text
- Body text: `#1a1a1a` (near-black) for maximum readability
- Secondary text: `#4a5568` (medium gray)
- Table borders: `#e2e8f0` (light gray)
- Background: Pure white `#ffffff`

**Typography (all Tajawal):**
- Agency name: 18px Bold
- Section headers: 12px Bold, uppercase, letter-spacing 1px
- Body text: 12px Regular
- Financial table values: 12px, right-aligned
- Total TTC row: 14px Bold
- Footer Arabic: 11px Bold (name), 9px Regular (details)
- Amount in words: 10px Italic

**Layout Structure:**
- A4 container: 794px x 1123px with 32px padding all sides
- Letterhead: 3-column flexbox (French left, logo center, Arabic right)
- Title banner: Full-width, 44px height, border-radius 4px
- Info cards: 2-column grid with 16px gap, each card has a 3px left border in accent color
- Financial table: Full-width HTML table with proper `thead`/`tbody` styling
- Payment/Signature: 2-column flex, signature box has dashed border
- Footer: Centered block with horizontal rule separator above

**Key UX Improvements:**
1. **Client phone displayed**: The current template ignores `clientPhone` -- the redesign includes it
2. **Paid/Remaining shown on finale**: For finale invoices, show "Montant paye" and "Reste a payer" with semantic colors (green for paid, red for remaining > 0)
3. **Status badge**: Small colored pill showing invoice status (Payee, Partielle, En attente)
4. **Clear visual hierarchy**: Section headers use colored accent bars instead of plain bold text
5. **Better date formatting**: Date displayed prominently in the title banner row alongside invoice number
6. **Professional signature area**: Dotted-line bordered box instead of empty whitespace
7. **Proforma validity**: Displayed as a highlighted info box with clock icon (text-based)
8. **Proper table for financials**: Replaces the current flex-based rows with a real HTML table that has clear column headers

### Section-by-Section Implementation

**1. Letterhead (replaces current centered header)**
- Three-column layout: French info left-aligned, logo centered (100px), Arabic info right-aligned RTL
- Agency legal identifiers (RC, NIF, NIS) in a single row below, centered, smaller font
- Thin horizontal line separator below

**2. Title Banner (replaces current banner + invoice number)**
- Single row: Invoice type label on left, "N deg X" centered, date on right
- All in white text on accent-colored background
- Slightly taller (44px) with rounded corners

**3. Client + Service Cards (replaces current stacked sections)**
- Two side-by-side cards with subtle left border accent
- Client card: Name, passport, phone (new!), all with label:value format
- Service card: Service name, itinerary with arrow, company, class, dates (departure/return on same line), PNR badge (finale only)

**4. Financial Table (replaces current flex-based box)**
- Proper HTML table with "Designation" and "Montant (DA)" column headers
- Rows: ticket price, agency fees (if breakdown exists), then separator
- Sub-total rows: Total HT, TVA (0%), then highlighted Total TTC row
- For finale: Additional rows showing "Montant paye" (green) and "Reste a payer" (red/green based on value)

**5. Payment + Signature (enhanced version of current)**
- Left side: Payment details in a light-background card with accent border
- Right side: "Cachet et Signature" in a dashed-border box (100px height) for professional look
- Amount in words below payment details in italic

**6. Conditions (enhanced)**
- Proforma: Light blue info box with bullet points for validity and payment terms
- Finale: Simple bold statement "Billet emis et non remboursable"
- Proforma warning: Yellow banner (kept from current design, slightly refined)

**7. Footer (streamlined)**
- Thin horizontal rule separator
- Centered Arabic details (same 5 lines as current but with cleaner spacing)
- Generation timestamp bottom-right, very small and light gray

