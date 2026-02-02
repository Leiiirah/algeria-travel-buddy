

# Plan: PDF Export for Expenses

## Overview

Add a "Print/Export to PDF" feature to the Expenses page that generates a professional PDF document with the company logo, expense list, and summary statistics.

---

## Library Choice: jsPDF + jspdf-autotable

**jsPDF** is the most popular JavaScript library for PDF generation. Combined with **jspdf-autotable**, it provides easy table generation that matches the current expenses table layout.

| Library | Purpose |
|---------|---------|
| `jspdf` | Core PDF generation |
| `jspdf-autotable` | Table rendering in PDFs |

---

## Files to Create

| File | Description |
|------|-------------|
| `src/utils/pdfGenerator.ts` | Reusable PDF generation utility with company branding |

---

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add jspdf and jspdf-autotable dependencies |
| `src/pages/ExpensesPage.tsx` | Add print button and PDF generation handler |
| `src/i18n/locales/fr/expenses.json` | Add translation for "Exporter en PDF" |
| `src/i18n/locales/ar/expenses.json` | Add translation for PDF export |

---

## PDF Document Layout

```text
+------------------------------------------+
|  [LOGO]     EL HIKMA TOURISME ET VOYAGE  |
|                                          |
|        RAPPORT DES DÉPENSES              |
|        Date: 02/02/2026                  |
|------------------------------------------|
|  Résumé:                                 |
|  - Ce mois: 150,000 DZD                  |
|  - Cette année: 1,200,000 DZD            |
|  - Total: 3,500,000 DZD                  |
|------------------------------------------|
|  Date  | Catégorie | Description | ...  |
|  ------+----------+-------------+---    |
|  01/02 | Factures | Électricité | ...   |
|  ...   | ...      | ...         | ...   |
|------------------------------------------|
|  Total des dépenses filtrées: X DZD     |
|                                          |
|  Généré le 02/02/2026 à 14:30           |
+------------------------------------------+
```

---

## Implementation Details

### 1. Install Dependencies

```bash
npm install jspdf jspdf-autotable
npm install -D @types/jspdf
```

### 2. PDF Generator Utility (`src/utils/pdfGenerator.ts`)

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoBase64 from '@/assets/logo-elhikma.png';

interface ExpensesPdfData {
  expenses: Array<{
    date: string;
    category: string;
    description: string;
    vendor: string;
    paymentMethod: string;
    amount: number;
  }>;
  stats: {
    totalThisMonth: number;
    totalThisYear: number;
    totalAll: number;
  };
  language: 'fr' | 'ar';
  filterTotal: number;
}

export function generateExpensesPdf(data: ExpensesPdfData): void {
  const doc = new jsPDF();
  const isArabic = data.language === 'ar';
  
  // Add logo (centered at top)
  doc.addImage(logoBase64, 'PNG', 85, 10, 40, 30);
  
  // Company name
  doc.setFontSize(18);
  doc.text('EL HIKMA TOURISME ET VOYAGE', 105, 50, { align: 'center' });
  
  // Report title
  doc.setFontSize(14);
  doc.text(isArabic ? 'تقرير المصروفات' : 'Rapport des Dépenses', 105, 60, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR')}`, 105, 68, { align: 'center' });
  
  // Summary section
  doc.setFontSize(12);
  const summaryY = 80;
  doc.text(isArabic ? 'ملخص:' : 'Résumé:', 14, summaryY);
  doc.setFontSize(10);
  doc.text(`${isArabic ? 'هذا الشهر' : 'Ce mois'}: ${data.stats.totalThisMonth.toLocaleString()} DZD`, 20, summaryY + 8);
  doc.text(`${isArabic ? 'هذا العام' : 'Cette année'}: ${data.stats.totalThisYear.toLocaleString()} DZD`, 20, summaryY + 16);
  doc.text(`${isArabic ? 'الإجمالي' : 'Total global'}: ${data.stats.totalAll.toLocaleString()} DZD`, 20, summaryY + 24);
  
  // Expenses table
  autoTable(doc, {
    startY: summaryY + 35,
    head: [[
      isArabic ? 'التاريخ' : 'Date',
      isArabic ? 'الفئة' : 'Catégorie',
      isArabic ? 'الوصف' : 'Description',
      isArabic ? 'المورد' : 'Fournisseur',
      isArabic ? 'طريقة الدفع' : 'Mode',
      isArabic ? 'المبلغ' : 'Montant (DZD)',
    ]],
    body: data.expenses.map(exp => [
      exp.date,
      exp.category,
      exp.description,
      exp.vendor || '-',
      exp.paymentMethod,
      exp.amount.toLocaleString(),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }, // Blue header
  });
  
  // Filter total at bottom
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text(
    `${isArabic ? 'إجمالي المصروفات المعروضة' : 'Total des dépenses affichées'}: ${data.filterTotal.toLocaleString()} DZD`,
    14,
    finalY
  );
  
  // Footer with generation timestamp
  doc.setFontSize(8);
  doc.text(
    `${isArabic ? 'تم الإنشاء في' : 'Généré le'} ${new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR')}`,
    14,
    doc.internal.pageSize.height - 10
  );
  
  // Save the PDF
  doc.save(`depenses_${new Date().toISOString().split('T')[0]}.pdf`);
}
```

### 3. Update ExpensesPage.tsx

Add a print button next to the "New Expense" button:

```tsx
import { Plus, Receipt, Calendar, TrendingDown, Trash2, Pencil, FileDown } from 'lucide-react';
import { generateExpensesPdf } from '@/utils/pdfGenerator';

// Inside the component:
const handleExportPdf = () => {
  if (!filteredExpenses || !stats) return;
  
  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  generateExpensesPdf({
    expenses: filteredExpenses.map(exp => ({
      date: format(new Date(exp.date), 'dd/MM/yyyy'),
      category: expenseCategoryLabels[exp.category],
      description: exp.description,
      vendor: exp.vendor || '',
      paymentMethod: paymentMethodLabels[exp.paymentMethod],
      amount: Number(exp.amount),
    })),
    stats: {
      totalThisMonth: stats.totalThisMonth,
      totalThisYear: stats.totalThisYear,
      totalAll: stats.totalAll,
    },
    language: i18n.language as 'fr' | 'ar',
    filterTotal: total,
  });
};

// In the header section, add button:
<Button variant="outline" onClick={handleExportPdf} disabled={!filteredExpenses?.length}>
  <FileDown className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
  {t('actions.exportPdf')}
</Button>
```

### 4. Update Translations

**French (`expenses.json`):**
```json
"actions": {
  "newExpense": "Nouvelle Dépense",
  "exportPdf": "Exporter en PDF"
}
```

**Arabic (`expenses.json`):**
```json
"actions": {
  "newExpense": "مصروف جديد",
  "exportPdf": "تصدير PDF"
}
```

---

## Logo Handling

The logo needs to be converted to Base64 for embedding in the PDF. Two approaches:

**Option A: Import as asset (requires Vite config)**
```typescript
// vite.config.ts - add to assetsInclude if needed
import logo from '@/assets/logo-elhikma.png?base64';
```

**Option B: Convert at build time**
Create a utility that converts the logo to base64 string at initialization.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Install `jspdf` and `jspdf-autotable` |
| 2 | Create `src/utils/pdfGenerator.ts` with company branding |
| 3 | Add export button to ExpensesPage header |
| 4 | Add translations for the new button |
| 5 | Handle logo embedding as Base64 |

---

## Technical Notes

- The PDF exports the **currently filtered** expenses, not all expenses
- Summary stats show global totals (month/year/all) while the table shows filtered data
- Generated filename includes current date: `depenses_2026-02-02.pdf`
- Supports both French and Arabic languages

