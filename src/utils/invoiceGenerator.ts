import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AGENCY_INFO } from '@/constants/agency';
import { registerTajawalFont } from './tajawalFont';
import { numberToWords } from './numberToWords';

// ============ Shared types ============

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

export interface AgencyInfoParam {
  legalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  rc?: string;
  nif?: string;
  nis?: string;
  bankName?: string;
  bankAccount?: string;
  mobilePhone?: string;
  licenseNumber?: string;
  arabicName?: string;
  arabicAddress?: string;
}

interface ClientInvoicePdfData {
  invoiceNumber: string;
  invoiceType: 'proforma' | 'finale';
  clientName: string;
  clientPhone: string;
  clientPassport: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  serviceName: string;
  serviceType: string;
  destination: string;
  companyName: string;
  departureDate: string;
  returnDate: string;
  travelClass: string;
  pnr: string;
  ticketPrice: number;
  agencyFees: number;
  paymentMethod: string;
  validityHours: number;
  status: string;
  language: 'fr' | 'ar';
  agencyInfo?: AgencyInfoParam;
}

// ============ Helpers ============

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

function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return dateString;
  }
}

function mergeAgencyInfo(param?: AgencyInfoParam) {
  return {
    legalName: param?.legalName || AGENCY_INFO.legalName,
    address: param?.address || AGENCY_INFO.address,
    phone: param?.phone || AGENCY_INFO.phone,
    email: param?.email || AGENCY_INFO.email,
    rc: param?.rc || AGENCY_INFO.rc,
    nif: param?.nif || AGENCY_INFO.nif,
    nis: param?.nis || AGENCY_INFO.nis,
    bankName: param?.bankName || AGENCY_INFO.bankName,
    bankAccount: param?.bankAccount || AGENCY_INFO.bankAccount,
    mobilePhone: param?.mobilePhone || AGENCY_INFO.mobilePhone,
    licenseNumber: param?.licenseNumber || AGENCY_INFO.licenseNumber,
    arabicName: param?.arabicName || AGENCY_INFO.arabicName,
    arabicAddress: param?.arabicAddress || AGENCY_INFO.arabicAddress,
  };
}

// ============ Arabic Footer ============

function drawArabicFooter(doc: jsPDF, info: ReturnType<typeof mergeAgencyInfo>, hasTajawal: boolean) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const footerHeight = 38;
  const footerY = pageHeight - footerHeight - 6;
  const footerX = 10;
  const footerW = pageWidth - 20;

  // Background
  doc.setFillColor(245, 240, 230); // #F5F0E6
  doc.setDrawColor(201, 184, 150); // #C9B896
  doc.setLineWidth(0.6);
  doc.roundedRect(footerX, footerY, footerW, footerHeight, 2, 2, 'FD');

  // Use Tajawal for Arabic text if available
  if (hasTajawal) {
    doc.setFont('Tajawal', 'bold');
  } else {
    doc.setFont('helvetica', 'bold');
  }

  const centerX = pageWidth / 2;
  let y = footerY + 8;

  // Line 1: Arabic name
  doc.setFontSize(10);
  doc.setTextColor(80, 60, 30);
  doc.text(info.arabicName, centerX, y, { align: 'center' });

  // Line 2: Arabic address
  y += 6;
  if (hasTajawal) {
    doc.setFont('Tajawal', 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  doc.setFontSize(8);
  doc.text(info.arabicAddress, centerX, y, { align: 'center' });

  // Line 3: Legal identifiers
  y += 6;
  const legalParts: string[] = [];
  if (info.rc) legalParts.push(`RC: ${info.rc}`);
  if (info.nif) legalParts.push(`NIF: ${info.nif}`);
  if (info.nis) legalParts.push(`NIS: ${info.nis}`);
  if (info.licenseNumber) legalParts.push(`Licence: ${info.licenseNumber}`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(legalParts.join('  |  '), centerX, y, { align: 'center' });

  // Line 4: Phone numbers
  y += 6;
  const phoneParts: string[] = [];
  if (info.phone) phoneParts.push(`المكتب: ${info.phone}`);
  if (info.mobilePhone) phoneParts.push(`الجوال: ${info.mobilePhone}`);
  if (hasTajawal) {
    doc.setFont('Tajawal', 'normal');
  }
  doc.setFontSize(7);
  doc.text(phoneParts.join('  |  '), centerX, y, { align: 'center' });

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}

// ============ Legacy Invoice (Command-based) ============

export async function generateInvoicePdf(data: InvoiceData): Promise<void> {
  const doc = new jsPDF();
  const isArabic = data.language === 'ar';
  const pageWidth = doc.internal.pageSize.width;

  // Register Tajawal
  const hasTajawal = await registerTajawalFont(doc);
  const info = mergeAgencyInfo();

  try {
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', (pageWidth - 40) / 2, 10, 40, 30);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Company name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(info.legalName, pageWidth / 2, 50, { align: 'center' });

  // Invoice title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(isArabic ? 'FACTURE / فاتورة' : 'FACTURE', pageWidth / 2, 60, { align: 'center' });

  // Reference and Date
  doc.setFontSize(10);
  const refDateY = 75;
  doc.setFont('helvetica', 'bold');
  doc.text(`Référence: ${data.reference}`, 14, refDateY);
  doc.text(`Date: ${data.paymentDate}`, pageWidth - 14, refDateY, { align: 'right' });

  // Separator
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(14, refDateY + 5, pageWidth - 14, refDateY + 5);

  // CLIENT section
  let currentY = refDateY + 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
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

  // ORDER DETAILS
  currentY += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
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

  // Passenger table
  currentY += 12;
  const passengerStatus = data.status === 'Terminé' || data.status === 'مكتمل'
    ? (isArabic ? 'مؤكد' : 'Confirmé')
    : (isArabic ? 'قيد الانتظار' : 'En attente');

  autoTable(doc, {
    startY: currentY,
    head: [[
      isArabic ? 'الراكب' : 'Passager',
      isArabic ? 'رقم التذكرة' : 'N° Ticket',
      isArabic ? 'الحالة' : 'Statut',
    ]],
    body: [[data.clientName, '-', passengerStatus]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [80, 80, 80], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Itinerary table (ticket type)
  if (data.serviceType === 'ticket' && data.destination) {
    const destinations = data.destination.split('-');
    const itineraryRows: string[][] = [];
    for (let i = 0; i < destinations.length - 1; i++) {
      itineraryRows.push([destinations[i], destinations[i + 1], data.company || '-', 'Y']);
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
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [80, 80, 80], textColor: 255, fontStyle: 'bold' },
        theme: 'grid',
        margin: { left: 14, right: 14 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // FINANCIAL SUMMARY
  currentY += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text(isArabic ? 'الملخص المالي' : 'RÉSUMÉ FINANCIER', 14, currentY);
  doc.setTextColor(0, 0, 0);

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
  if (data.remaining > 0) {
    doc.setTextColor(220, 53, 69);
  } else {
    doc.setTextColor(34, 139, 34);
  }
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.remaining.toLocaleString('fr-FR')} DZD`, valueX, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Arabic footer
  drawArabicFooter(doc, info, hasTajawal);

  const fileName = `facture_${data.reference}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ==================== CLIENT INVOICE PDF ====================

export async function generateClientInvoicePdf(data: ClientInvoicePdfData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const isProforma = data.invoiceType === 'proforma';
  const isArabic = data.language === 'ar';

  // Register Tajawal for Arabic text
  const hasTajawal = await registerTajawalFont(doc);

  // Merge agency info
  const info = mergeAgencyInfo(data.agencyInfo);

  // ===== LOGO =====
  try {
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', 14, 8, 30, 22);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // ===== INVOICE TITLE (right side of header) =====
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const titleText = isProforma ? 'FACTURE PROFORMA' : 'FACTURE DÉFINITIVE';
  doc.text(titleText, pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${data.invoiceNumber}`, pageWidth - 14, 26, { align: 'right' });

  // Date below logo on left
  doc.setFontSize(9);
  doc.text(`Date: ${data.invoiceDate}`, 14, 34);
  doc.setTextColor(0, 0, 0);

  // Separator line
  let currentY = 38;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // ===== TWO-COLUMN INFO BLOCK =====
  currentY += 8;
  const colLeft = 14;
  const colRight = pageWidth / 2 + 10;

  // -- EMETTEUR (left) --
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('ÉMETTEUR', colLeft, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  let ey = currentY + 6;
  doc.setFont('helvetica', 'bold');
  doc.text(info.legalName, colLeft, ey);
  doc.setFont('helvetica', 'normal');
  ey += 5;
  doc.text(info.address, colLeft, ey);
  ey += 5;
  doc.text(`Tél: ${info.phone}`, colLeft, ey);
  if (info.mobilePhone) {
    doc.text(`/ ${info.mobilePhone}`, colLeft + doc.getTextWidth(`Tél: ${info.phone}`) + 3, ey);
  }
  ey += 5;
  doc.text(`Email: ${info.email}`, colLeft, ey);
  ey += 5;
  doc.setFontSize(8);
  doc.text(`NIF: ${info.nif}`, colLeft, ey);
  ey += 4;
  doc.text(`NIS: ${info.nis}`, colLeft, ey);
  ey += 4;
  doc.text(`RC: ${info.rc}`, colLeft, ey);

  // -- DESTINATAIRE (right) --
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('DESTINATAIRE', colRight, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  let dy = currentY + 6;
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName, colRight, dy);
  doc.setFont('helvetica', 'normal');
  if (data.clientPassport) {
    dy += 5;
    doc.text(`Passeport: ${data.clientPassport}`, colRight, dy);
  }
  if (data.clientPhone) {
    dy += 5;
    doc.text(`Tél: ${data.clientPhone}`, colRight, dy);
  }

  // Move past the two-column block
  currentY = Math.max(ey, dy) + 10;

  // ===== DESCRIPTION TABLE =====
  const descriptionText = data.serviceName || 'Prestation';
  let fullDescription = descriptionText;
  if (data.destination) {
    const arrow = '→';
    fullDescription += ` — ${data.destination.replace(/-/g, ` ${arrow} `)}`;
  }
  if (data.companyName) {
    fullDescription += ` (${data.companyName})`;
  }
  if (data.departureDate) {
    fullDescription += `\nDépart: ${data.departureDate}`;
    if (data.returnDate) fullDescription += ` — Retour: ${data.returnDate}`;
  }
  if (data.travelClass) {
    const classLabels: Record<string, string> = {
      economique: 'Économique',
      affaires: 'Affaires',
      premiere: 'Première',
    };
    fullDescription += `\nClasse: ${classLabels[data.travelClass] || data.travelClass}`;
  }
  if (!isProforma && data.pnr) {
    fullDescription += `\nPNR: ${data.pnr}`;
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Prix Unitaire', 'Quantité', 'Total']],
    body: [[
      fullDescription,
      `${data.totalAmount.toLocaleString('fr-FR')} DA`,
      '1',
      `${data.totalAmount.toLocaleString('fr-FR')} DA`,
    ]],
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 90, halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'right' },
    },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // ===== FINANCIAL SUMMARY (right-aligned) =====
  const summaryX = pageWidth - 14;
  const summaryLabelX = pageWidth - 90;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Show ticket + fees breakdown if available
  if (data.ticketPrice > 0 || data.agencyFees > 0) {
    doc.text('Prix du billet:', summaryLabelX, currentY);
    doc.text(`${data.ticketPrice.toLocaleString('fr-FR')} DA`, summaryX, currentY, { align: 'right' });
    currentY += 6;
    doc.text('Frais agence:', summaryLabelX, currentY);
    doc.text(`${data.agencyFees.toLocaleString('fr-FR')} DA`, summaryX, currentY, { align: 'right' });
    currentY += 4;
    doc.setDrawColor(180, 180, 180);
    doc.line(summaryLabelX, currentY, summaryX, currentY);
    currentY += 6;
  }

  // TOTAL HT
  doc.text('TOTAL HT:', summaryLabelX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, summaryX, currentY, { align: 'right' });

  // TVA
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('TVA (0%):', summaryLabelX, currentY);
  doc.text('0,00 DA', summaryX, currentY, { align: 'right' });

  // REMISE
  currentY += 6;
  doc.text('REMISE:', summaryLabelX, currentY);
  doc.text('—', summaryX, currentY, { align: 'right' });

  // TOTAL TTC
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL TTC:', summaryLabelX, currentY);
  doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, summaryX, currentY, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // ===== REGLEMENT SECTION (left-aligned) =====
  currentY += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RÈGLEMENT', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (data.paymentMethod) {
    currentY += 6;
    const paymentLabels: Record<string, string> = {
      especes: 'Espèces',
      virement: 'Virement',
      cheque: 'Chèque',
      carte: 'Carte bancaire',
    };
    const paymentLabel = paymentLabels[data.paymentMethod] || data.paymentMethod;
    doc.text(`Mode de paiement: ${paymentLabel}`, 14, currentY);
  }

  if (info.bankName || info.bankAccount) {
    currentY += 6;
    doc.text(`Banque: ${info.bankName || '—'}`, 14, currentY);
    currentY += 5;
    doc.text(`Compte: ${info.bankAccount || '—'}`, 14, currentY);
  }

  // Amount in words
  currentY += 8;
  const amountWords = numberToWords(data.totalAmount);
  const docType = isProforma ? 'proforma' : 'définitive';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const wordsText = `Arrêté la présente facture ${docType} à la somme de: ${amountWords} Dinars Algériens`;
  const wordsLines = doc.splitTextToSize(wordsText, pageWidth - 28);
  doc.text(wordsLines, 14, currentY);

  currentY += wordsLines.length * 5;

  // ===== PROFORMA CONDITIONS =====
  if (isProforma) {
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Conditions:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 5;
    doc.text(`• Paiement avant émission du billet`, 18, currentY);
    currentY += 5;
    doc.text(`• Validité de l'offre: ${data.validityHours} heures`, 18, currentY);

    // Proforma warning
    currentY += 8;
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(200, 180, 100);
    doc.roundedRect(14, currentY - 4, pageWidth - 28, 12, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 100, 0);
    doc.text(
      '⚠ Ceci est une facture proforma, non valable pour la comptabilité',
      pageWidth / 2, currentY + 3, { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    currentY += 12;
  } else {
    // Final invoice note
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Billet émis et non remboursable', 14, currentY);
    doc.setFont('helvetica', 'normal');
  }

  // ===== STAMP & SIGNATURE =====
  currentY += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Cachet et Signature', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth / 2 - 35, currentY, 70, 30, 2, 2, 'FD');

  // ===== ARABIC FOOTER =====
  drawArabicFooter(doc, info, hasTajawal);

  // ===== GENERATION TIMESTAMP =====
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  const timestamp = new Date().toLocaleString('fr-FR');
  doc.text(`Généré le ${timestamp}`, pageWidth - 14, pageHeight - 2, { align: 'right' });

  // Save
  const fileName = `${isProforma ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
