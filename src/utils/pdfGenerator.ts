import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import ExpensesReportTemplate from '@/components/expenses/ExpensesReportTemplate';
import type { ExpensesPdfData } from '@/components/expenses/ExpensesReportTemplate';

export type { ExpensesPdfData };

/**
 * Generate an expenses report PDF using the HTML-to-PDF approach
 * (same pattern as invoiceGenerator.ts).
 */
export async function generateExpensesPdf(data: ExpensesPdfData): Promise<void> {
  // 1. Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  // 2. Render the React template
  const root = createRoot(container);
  root.render(React.createElement(ExpensesReportTemplate, { data }));

  // Wait for render + images to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Capture with html2canvas
  const templateEl = container.firstElementChild as HTMLElement;
  if (!templateEl) {
    root.unmount();
    document.body.removeChild(container);
    throw new Error('ExpensesReportTemplate did not render');
  }

  const canvas = await html2canvas(templateEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // 4. Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

  // 5. Save
  pdf.save(`depenses_${new Date().toISOString().split('T')[0]}.pdf`);

  // 6. Cleanup
  root.unmount();
  document.body.removeChild(container);
}
