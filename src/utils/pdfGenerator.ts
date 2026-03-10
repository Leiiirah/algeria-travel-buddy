import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import ExpensesReportTemplate from '@/components/expenses/ExpensesReportTemplate';
import type { ExpensesPdfData } from '@/components/expenses/ExpensesReportTemplate';

export type { ExpensesPdfData };

const PDF_PAGE_SIZE = 20;

/**
 * Generate an expenses report PDF with multiple pages (20 expenses per page).
 */
export async function generateExpensesPdf(data: ExpensesPdfData): Promise<void> {
  const allExpenses = data.expenses;
  const totalPages = Math.max(1, Math.ceil(allExpenses.length / PDF_PAGE_SIZE));

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageExpenses = allExpenses.slice(
      pageIdx * PDF_PAGE_SIZE,
      (pageIdx + 1) * PDF_PAGE_SIZE
    );

    const pageData: ExpensesPdfData = {
      ...data,
      expenses: pageExpenses,
      filterTotal: pageIdx === totalPages - 1
        ? data.filterTotal
        : pageExpenses.reduce((sum, e) => sum + e.amount, 0),
    };

    // Create off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(React.createElement(ExpensesReportTemplate, { data: pageData }));

    await new Promise(resolve => setTimeout(resolve, 500));

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

    if (pageIdx > 0) {
      pdf.addPage();
    }

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    root.unmount();
    document.body.removeChild(container);
  }

  pdf.save(`depenses_${new Date().toISOString().split('T')[0]}.pdf`);
}
