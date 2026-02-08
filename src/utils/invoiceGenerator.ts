import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import type { AgencyInfoParam, ClientInvoicePdfData } from '@/components/invoice/InvoiceTemplate';

// Re-export types for backward compatibility
export type { AgencyInfoParam, ClientInvoicePdfData };

/**
 * Generate a client invoice PDF using HTML-to-PDF approach.
 *
 * 1. Creates a temporary off-screen container
 * 2. Renders the InvoiceTemplate React component into it
 * 3. Captures it with html2canvas at 2x scale
 * 4. Inserts the canvas image into a jsPDF A4 document
 * 5. Saves the PDF and cleans up
 */
export async function generateClientInvoicePdf(data: ClientInvoicePdfData): Promise<void> {
  // 1. Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  // 2. Render the React template
  const root = createRoot(container);
  root.render(React.createElement(InvoiceTemplate, { data }));

  // Wait for render + images to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Capture with html2canvas
  const templateEl = container.firstElementChild as HTMLElement;
  if (!templateEl) {
    root.unmount();
    document.body.removeChild(container);
    throw new Error('InvoiceTemplate did not render');
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
  const isProforma = data.invoiceType === 'proforma';
  const fileName = `${isProforma ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);

  // 6. Cleanup
  root.unmount();
  document.body.removeChild(container);
}
