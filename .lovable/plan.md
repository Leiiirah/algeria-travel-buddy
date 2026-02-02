

# Plan: Command Invoice PDF Export

## Overview

Add a "Print Invoice" feature to each command row in the CommandsPage, generating a professional PDF invoice styled like the Fonex Tour example provided.

---

## Invoice Layout Analysis (from provided example)

Based on the uploaded PDF, the invoice contains:

```text
+--------------------------------------------------+
|  [LOGO]            COMPANY NAME                  |
|--------------------------------------------------| 
|  Référence: XXXXX           Client: CLIENT NAME  |
|  Paiement le XX/XX/XXXX: XXXXX DZD               |
|  Email: company@email.com                        |
|  Prix Total: XXXXX DZD                           |
|--------------------------------------------------|
|  # PASSAGER                                      |
|  | Passager | N° Ticket | Statut |               |
|--------------------------------------------------|
|  # ITINERAIRE                                    |
|  | De | À | Départ | Arrivée | Vol | Classe |    |
|--------------------------------------------------|
|  # TYPE                                          |
|  | Type | Baggage |                              |
+--------------------------------------------------+
```

---

## Mapping Command Data to Invoice

| Invoice Field | Source in Command |
|--------------|-------------------|
| Référence | Generate unique code (e.g., first 6 chars of command.id or custom format) |
| Client | `command.data.clientFullName` |
| Paiement | `command.amountPaid` + `command.createdAt` |
| Prix Total | `command.sellingPrice` |
| Passager | `command.data.clientFullName` |
| N° Ticket | Optional field (can be added to ticket commands) |
| Statut | `command.status` mapped to "Confirmé"/"En attente" |
| Itinéraire | From `command.destination` + `command.data.departureDate/returnDate` |

---

## Files to Create

| File | Description |
|------|-------------|
| `src/utils/invoiceGenerator.ts` | Invoice PDF generation function |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CommandsPage.tsx` | Add "Print Invoice" action to dropdown menu |
| `src/i18n/locales/fr/commands.json` | Add invoice-related translations |
| `src/i18n/locales/ar/commands.json` | Add Arabic translations |

---

## Invoice Generator Design

### Interface

```typescript
interface InvoiceData {
  reference: string;           // Unique invoice reference
  clientName: string;          // Client full name
  clientPhone: string;         // Client phone
  paymentDate: string;         // Date of command
  amountPaid: number;          // Amount already paid
  totalPrice: number;          // Selling price
  remaining: number;           // Remaining balance
  service: string;             // Service name
  destination: string;         // Trip destination
  status: string;              // Confirmé, En attente, etc.
  passengers?: Array<{
    name: string;
    ticketNumber?: string;
    status: string;
  }>;
  itinerary?: Array<{
    from: string;
    to: string;
    departure: string;
    arrival: string;
    flight?: string;
    class?: string;
  }>;
  supplier?: string;           // Supplier name
}
```

### PDF Layout

```text
+------------------------------------------------------+
|  [LOGO - centered]                                    |
|                                                       |
|              EL HIKMA TOURISME ET VOYAGE              |
|                    FACTURE / فاتورة                   |
|------------------------------------------------------|
|                                                       |
|  Référence: CMD-XXXXXX       Date: 02/02/2026        |
|                                                       |
|------------------------------------------------------|
|  CLIENT                                              |
|  Nom: NADJET MEZROUH                                 |
|  Téléphone: +213 555 123 456                         |
|------------------------------------------------------|
|  DÉTAILS DE LA COMMANDE                              |
|  Service: Billet d'avion                             |
|  Destination: ALG-CZL-ALG                            |
|  Fournisseur: Fonex Tour                             |
|------------------------------------------------------|
|  # PASSAGER(S)                                       |
|  | Passager       | N° Ticket | Statut   |           |
|  | NADJET MEZROUH | -         | Confirmé |           |
|------------------------------------------------------|
|  # ITINÉRAIRE (if ticket type)                       |
|  | De  | À   | Départ   | Arrivée  | Vol   | Classe |
|  | ALG | CZL | 24/12/25 | 24/12/25 | SF116 | Y      |
|------------------------------------------------------|
|  RÉSUMÉ FINANCIER                                    |
|                                                       |
|  Prix Total:      85,000 DZD                         |
|  Montant Payé:    25,000 DZD                         |
|  Reste à Payer:   60,000 DZD                         |
|------------------------------------------------------|
|                                                       |
|  Merci de votre confiance !                          |
|  Email: elhikma@contact.dz                           |
|                                                       |
|  Généré le 02/02/2026 à 14:30                        |
+------------------------------------------------------+
```

---

## Implementation Details

### 1. Invoice Generator (`src/utils/invoiceGenerator.ts`)

Key features:
- Reuse `getLogoBase64()` from existing pdfGenerator
- Professional invoice styling with blue accent color
- Conditional sections (itinerary only for ticket type)
- Financial summary with clear breakdown
- Reference number generation: `CMD-{first6CharsOfId}`

### 2. CommandsPage Integration

Add to the dropdown menu (lines 823-843):

```tsx
<DropdownMenuItem onClick={() => handlePrintInvoice(command)}>
  <FileDown className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
  {t('actions.printInvoice')}
</DropdownMenuItem>
```

Handler function:

```tsx
const handlePrintInvoice = async (command: any) => {
  const service = services?.find((s) => s.id === command.serviceId);
  const supplier = suppliers?.find((s) => s.id === command.supplierId);
  
  await generateInvoicePdf({
    reference: `CMD-${command.id.substring(0, 6).toUpperCase()}`,
    clientName: command.data.clientFullName,
    clientPhone: command.data.phone || '',
    paymentDate: format(new Date(command.createdAt), 'dd/MM/yyyy'),
    amountPaid: command.amountPaid,
    totalPrice: command.sellingPrice,
    remaining: command.sellingPrice - command.amountPaid,
    service: service?.name || '',
    serviceType: service?.type || '',
    destination: command.destination,
    status: getStatusLabel(command.status),
    departureDate: command.data.departureDate,
    returnDate: command.data.returnDate,
    supplier: supplier?.name,
    language: i18n.language as 'fr' | 'ar',
  });
};
```

---

## Translations

### French (`commands.json`)

```json
{
  "actions": {
    "printInvoice": "Imprimer la facture"
  },
  "invoice": {
    "title": "FACTURE",
    "reference": "Référence",
    "date": "Date",
    "client": "CLIENT",
    "name": "Nom",
    "phone": "Téléphone",
    "orderDetails": "DÉTAILS DE LA COMMANDE",
    "service": "Service",
    "destination": "Destination",
    "supplier": "Fournisseur",
    "passengers": "PASSAGER(S)",
    "passenger": "Passager",
    "ticketNumber": "N° Ticket",
    "status": "Statut",
    "itinerary": "ITINÉRAIRE",
    "from": "De",
    "to": "À",
    "departure": "Départ",
    "arrival": "Arrivée",
    "flight": "Vol",
    "class": "Classe",
    "financialSummary": "RÉSUMÉ FINANCIER",
    "totalPrice": "Prix Total",
    "amountPaid": "Montant Payé",
    "remaining": "Reste à Payer",
    "thankYou": "Merci de votre confiance !",
    "generatedOn": "Généré le"
  }
}
```

### Arabic (`commands.json`)

```json
{
  "actions": {
    "printInvoice": "طباعة الفاتورة"
  },
  "invoice": {
    "title": "فاتورة",
    "reference": "المرجع",
    "date": "التاريخ",
    "client": "العميل",
    "name": "الاسم",
    "phone": "الهاتف",
    "orderDetails": "تفاصيل الطلب",
    "service": "الخدمة",
    "destination": "الوجهة",
    "supplier": "المورد",
    "passengers": "الركاب",
    "passenger": "الراكب",
    "ticketNumber": "رقم التذكرة",
    "status": "الحالة",
    "itinerary": "خط السير",
    "from": "من",
    "to": "إلى",
    "departure": "المغادرة",
    "arrival": "الوصول",
    "flight": "الرحلة",
    "class": "الدرجة",
    "financialSummary": "الملخص المالي",
    "totalPrice": "السعر الإجمالي",
    "amountPaid": "المبلغ المدفوع",
    "remaining": "المتبقي",
    "thankYou": "شكراً لثقتكم!",
    "generatedOn": "تم الإنشاء في"
  }
}
```

---

## File Summary

| Category | Files |
|----------|-------|
| **New Files** | 1 (`invoiceGenerator.ts`) |
| **Modified Files** | 3 (`CommandsPage.tsx`, `fr/commands.json`, `ar/commands.json`) |
| **Total** | 4 files |

---

## Technical Notes

- Reuses existing jsPDF and jspdf-autotable dependencies (already installed)
- Leverages the `getLogoBase64()` helper from `pdfGenerator.ts`
- Invoice filename format: `facture_CMD-XXXXXX_2026-02-02.pdf`
- Conditional itinerary table: only shown for "ticket" service types
- Financial section shows remaining balance in red if > 0, green if fully paid

