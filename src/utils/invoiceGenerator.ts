import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
  reference: string;
  clientName: string;
  clientPhone: string;
  paymentDate: string;
  amountPaid: number;
  totalPrice: number;
  remaining: number;
  service: string;
  serviceType: string;
  destination: string;
  status: string;
  company?: string;
  supplier?: string;
  language: 'fr' | 'ar';
}

// Reuse logo loading function from pdfGenerator
async function getLogoBase64(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Could not load logo'));
    img.src = new URL('../assets/logo-elhikma.png', import.meta.url).href;
  });
}

export async function generateInvoicePdf(data: InvoiceData): Promise<void> {
  const doc = new jsPDF();
  const isArabic = data.language === 'ar';
  const pageWidth = doc.internal.pageSize.width;

  try {
    // Add logo centered at top
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', (pageWidth - 40) / 2, 10, 40, 30);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Company name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EL HIKMA TOURISME ET VOYAGE', pageWidth / 2, 50, { align: 'center' });

  // Invoice title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(isArabic ? 'FACTURE / فاتورة' : 'FACTURE', pageWidth / 2, 60, { align: 'center' });

  // Reference and Date line
  doc.setFontSize(10);
  const refDateY = 75;
  doc.setFont('helvetica', 'bold');
  doc.text(`Référence: ${data.reference}`, 14, refDateY);
  doc.text(`Date: ${data.paymentDate}`, pageWidth - 14, refDateY, { align: 'right' });

  // Horizontal line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, refDateY + 5, pageWidth - 14, refDateY + 5);

  // CLIENT section
  let currentY = refDateY + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'العميل' : 'CLIENT', 14, currentY);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${isArabic ? 'الاسم' : 'Nom'}: ${data.clientName}`, 14, currentY);
  if (data.clientPhone) {
    currentY += 6;
    doc.text(`${isArabic ? 'الهاتف' : 'Téléphone'}: ${data.clientPhone}`, 14, currentY);
  }

  // ORDER DETAILS section
  currentY += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'تفاصيل الطلب' : 'DÉTAILS DE LA COMMANDE', 14, currentY);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${isArabic ? 'الخدمة' : 'Service'}: ${data.service}`, 14, currentY);
  currentY += 6;
  doc.text(`${isArabic ? 'الوجهة' : 'Destination'}: ${data.destination || '-'}`, 14, currentY);
  if (data.supplier) {
    currentY += 6;
    doc.text(`${isArabic ? 'المورد' : 'Fournisseur'}: ${data.supplier}`, 14, currentY);
  }

  // PASSENGER table
  currentY += 12;
  const passengerStatus = data.status === 'Terminé' || data.status === 'مكتمل' ? (isArabic ? 'مؤكد' : 'Confirmé') : (isArabic ? 'قيد الانتظار' : 'En attente');
  
  autoTable(doc, {
    startY: currentY,
    head: [[
      isArabic ? 'الراكب' : 'Passager',
      isArabic ? 'رقم التذكرة' : 'N° Ticket',
      isArabic ? 'الحالة' : 'Statut',
    ]],
    body: [[
      data.clientName,
      '-',
      passengerStatus,
    ]],
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ITINERARY table (only for ticket service type)
  if (data.serviceType === 'ticket' && data.destination) {
    const destinations = data.destination.split('-');
    const itineraryRows: string[][] = [];
    
    // Parse destination for itinerary (e.g., "ALG-CZL-ALG")
    for (let i = 0; i < destinations.length - 1; i++) {
      itineraryRows.push([
        destinations[i],
        destinations[i + 1],
        data.company || '-',
        'Y',
      ]);
    }

    if (itineraryRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [[
          isArabic ? 'من' : 'De',
          isArabic ? 'إلى' : 'À',
          isArabic ? 'الشركة' : 'Compagnie',
          isArabic ? 'الدرجة' : 'Classe',
        ]],
        body: itineraryRows,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        theme: 'grid',
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // FINANCIAL SUMMARY section
  currentY += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'الملخص المالي' : 'RÉSUMÉ FINANCIER', 14, currentY);
  doc.setTextColor(0, 0, 0);

  // Financial details box
  currentY += 8;
  const boxX = 14;
  const boxWidth = pageWidth - 28;
  const boxHeight = 36;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, currentY - 2, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const labelX = boxX + 10;
  const valueX = boxX + boxWidth - 10;

  currentY += 6;
  doc.text(isArabic ? 'السعر الإجمالي:' : 'Prix Total:', labelX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.totalPrice.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(isArabic ? 'المبلغ المدفوع:' : 'Montant Payé:', labelX, currentY);
  doc.setTextColor(34, 139, 34);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.amountPaid.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(isArabic ? 'المتبقي:' : 'Reste à Payer:', labelX, currentY);
  
  // Color the remaining amount based on value
  if (data.remaining > 0) {
    doc.setTextColor(220, 53, 69); // Red for unpaid
  } else {
    doc.setTextColor(34, 139, 34); // Green for fully paid
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.remaining.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Footer section
  currentY += boxHeight - 8;
  currentY += 15;

  // Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(isArabic ? '!شكراً لثقتكم' : 'Merci de votre confiance !', pageWidth / 2, currentY, { align: 'center' });

  currentY += 8;
  doc.setFontSize(9);
  doc.text('Email: elhikma@contact.dz', pageWidth / 2, currentY, { align: 'center' });

  // Generation timestamp at bottom
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  const timestamp = new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR');
  doc.text(
    `${isArabic ? 'تم الإنشاء في' : 'Généré le'} ${timestamp}`,
    14,
    doc.internal.pageSize.height - 10
  );

  // Save the PDF
  const fileName = `facture_${data.reference}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return dateString;
  }
}

// ==================== CLIENT INVOICE PDF ====================

interface ClientInvoicePdfData {
  invoiceNumber: string;
  invoiceType: 'proforma' | 'finale';
  clientName: string;
  clientPhone: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  serviceName: string;
  serviceType: string;
  destination: string;
  status: string;
  language: 'fr' | 'ar';
}

export async function generateClientInvoicePdf(data: ClientInvoicePdfData): Promise<void> {
  const doc = new jsPDF();
  const isArabic = data.language === 'ar';
  const pageWidth = doc.internal.pageSize.width;

  try {
    // Add logo centered at top
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', (pageWidth - 40) / 2, 10, 40, 30);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Company name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EL HIKMA TOURISME ET VOYAGE', pageWidth / 2, 50, { align: 'center' });

  // Invoice title - different for proforma vs finale
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  if (data.invoiceType === 'proforma') {
    doc.setTextColor(59, 130, 246); // Blue for proforma
    doc.text(isArabic ? 'فاتورة مبدئية / FACTURE PROFORMA' : 'FACTURE PROFORMA', pageWidth / 2, 60, { align: 'center' });
  } else {
    doc.setTextColor(128, 90, 213); // Purple for finale
    doc.text(isArabic ? 'فاتورة نهائية / FACTURE' : 'FACTURE', pageWidth / 2, 60, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);

  // Proforma notice (if applicable)
  if (data.invoiceType === 'proforma') {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      isArabic ? 'هذا عرض سعر وليس فاتورة رسمية' : 'Ceci est un devis, pas une facture officielle',
      pageWidth / 2,
      67,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  }

  // Reference and Date line
  doc.setFontSize(10);
  const refDateY = data.invoiceType === 'proforma' ? 80 : 75;
  doc.setFont('helvetica', 'bold');
  doc.text(`N° Facture: ${data.invoiceNumber}`, 14, refDateY);
  doc.text(`Date: ${data.invoiceDate}`, pageWidth - 14, refDateY, { align: 'right' });

  // Horizontal line
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(14, refDateY + 5, pageWidth - 14, refDateY + 5);

  // CLIENT section
  let currentY = refDateY + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'العميل' : 'CLIENT', 14, currentY);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${isArabic ? 'الاسم' : 'Nom'}: ${data.clientName}`, 14, currentY);
  if (data.clientPhone) {
    currentY += 6;
    doc.text(`${isArabic ? 'الهاتف' : 'Téléphone'}: ${data.clientPhone}`, 14, currentY);
  }

  // SERVICE section
  currentY += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'الخدمة' : 'SERVICE', 14, currentY);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${isArabic ? 'الخدمة' : 'Service'}: ${data.serviceName}`, 14, currentY);
  if (data.destination) {
    currentY += 6;
    doc.text(`${isArabic ? 'الوجهة' : 'Destination'}: ${data.destination}`, 14, currentY);
  }

  // FINANCIAL SUMMARY section
  currentY += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'الملخص المالي' : 'RÉSUMÉ FINANCIER', 14, currentY);
  doc.setTextColor(0, 0, 0);

  // Financial details box
  currentY += 8;
  const boxX = 14;
  const boxWidth = pageWidth - 28;
  const boxHeight = 36;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, currentY - 2, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const labelX = boxX + 10;
  const valueX = boxX + boxWidth - 10;

  currentY += 6;
  doc.text(isArabic ? 'المبلغ الإجمالي:' : 'Montant Total:', labelX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(isArabic ? 'المبلغ المدفوع:' : 'Montant Payé:', labelX, currentY);
  doc.setTextColor(34, 139, 34);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.paidAmount.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(isArabic ? 'المتبقي:' : 'Reste à Payer:', labelX, currentY);
  
  // Color the remaining amount based on value
  if (data.remaining > 0) {
    doc.setTextColor(220, 53, 69); // Red for unpaid
  } else {
    doc.setTextColor(34, 139, 34); // Green for fully paid
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.remaining.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Footer section
  currentY += boxHeight - 8;
  currentY += 15;

  // Thank you message
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(isArabic ? '!شكراً لثقتكم' : 'Merci de votre confiance !', pageWidth / 2, currentY, { align: 'center' });

  currentY += 8;
  doc.setFontSize(9);
  doc.text('Email: elhikma@contact.dz', pageWidth / 2, currentY, { align: 'center' });

  // Generation timestamp at bottom
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  const timestamp = new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR');
  doc.text(
    `${isArabic ? 'تم الإنشاء في' : 'Généré le'} ${timestamp}`,
    14,
    doc.internal.pageSize.height - 10
  );

  // Save the PDF
  const fileName = `${data.invoiceType === 'proforma' ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
