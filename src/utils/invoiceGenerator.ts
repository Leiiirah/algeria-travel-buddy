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

  // ===== CENTERED LOGO =====
  try {
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', (pageWidth - 35) / 2, 8, 35, 26);
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // ===== AGENCY HEADER (centered underneath logo) =====
  let currentY = 38;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(info.legalName, pageWidth / 2, currentY, { align: 'center' });

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${isArabic ? 'العنوان' : 'Adresse'}: ${info.address}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  const phoneText = info.mobilePhone
    ? `${isArabic ? 'الهاتف' : 'Tél'}: ${info.phone} / ${info.mobilePhone} | Email: ${info.email}`
    : `${isArabic ? 'الهاتف' : 'Tél'}: ${info.phone} | Email: ${info.email}`;
  doc.text(phoneText, pageWidth / 2, currentY, { align: 'center' });

  currentY += 5;
  doc.text(`RC: ${info.rc} | NIF: ${info.nif} | NIS: ${info.nis}`, pageWidth / 2, currentY, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // ===== INVOICE TITLE =====
  currentY += 10;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.8);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  if (isProforma) {
    doc.setTextColor(59, 130, 246);
    doc.text(isArabic ? 'فاتورة مبدئية' : 'FACTURE PROFORMA', pageWidth / 2, currentY, { align: 'center' });
  } else {
    doc.setTextColor(34, 100, 80);
    doc.text(isArabic ? 'فاتورة نهائية' : 'FACTURE DÉFINITIVE', pageWidth / 2, currentY, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);

  currentY += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.invoiceNumber}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 10;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // ===== CLIENT SECTION =====
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'العميل' : 'CLIENT', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${isArabic ? 'التاريخ' : 'Date'}: ${data.invoiceDate}`, pageWidth - 14, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${isArabic ? 'الاسم' : 'Nom'}: ${data.clientName}`, 14, currentY);
  if (data.clientPassport) {
    currentY += 6;
    doc.text(`${isArabic ? 'جواز السفر' : 'Passeport'}: ${data.clientPassport}`, 14, currentY);
  }

  // ===== SERVICE/PRESTATION SECTION =====
  currentY += 14;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'الخدمة' : 'PRESTATION', 14, currentY);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`${data.serviceName}`, 14, currentY);

  if (data.destination) {
    currentY += 6;
    const arrow = isArabic ? '←' : '✈';
    const formattedDestination = data.destination.replace(/-/g, ` ${arrow} `);
    doc.text(`${isArabic ? 'المسار' : 'Itinéraire'}: ${formattedDestination}`, 14, currentY);
  }

  if (data.companyName) {
    currentY += 6;
    doc.text(`${isArabic ? 'الشركة' : 'Compagnie'}: ${data.companyName}`, 14, currentY);
  }

  if (data.departureDate) {
    currentY += 6;
    const departureLbl = isArabic ? 'تاريخ المغادرة' : 'Date de départ';
    doc.text(`${departureLbl}: ${data.departureDate}`, 14, currentY);
    if (data.returnDate) {
      doc.text(`${isArabic ? 'العودة' : 'Retour'}: ${data.returnDate}`, pageWidth / 2, currentY);
    }
  }

  if (data.travelClass) {
    currentY += 6;
    const classLabels: Record<string, { fr: string; ar: string }> = {
      economique: { fr: 'Économique', ar: 'اقتصادية' },
      affaires: { fr: 'Affaires', ar: 'رجال أعمال' },
      premiere: { fr: 'Première', ar: 'الدرجة الأولى' },
    };
    const classLabel = classLabels[data.travelClass]?.[isArabic ? 'ar' : 'fr'] || data.travelClass;
    doc.text(`${isArabic ? 'الدرجة' : 'Classe'}: ${classLabel}`, 14, currentY);
  }

  // PNR only for final invoices
  if (!isProforma && data.pnr) {
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`PNR: ${data.pnr}`, 14, currentY);
    doc.setFont('helvetica', 'normal');
  }

  // ===== FINANCIAL SECTION =====
  currentY += 14;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(isArabic ? 'التفاصيل المالية' : 'DÉTAILS FINANCIERS', 14, currentY);
  doc.setTextColor(0, 0, 0);

  // Financial details box
  currentY += 8;
  const boxX = 14;
  const boxWidth = pageWidth - 28;
  const hasBreakdown = data.ticketPrice > 0 || data.agencyFees > 0;
  const boxHeight = hasBreakdown ? 52 : 36;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, currentY - 2, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const labelX = boxX + 10;
  const valueX = boxX + boxWidth - 10;

  // Show ticket price and agency fees if available
  if (hasBreakdown) {
    currentY += 6;
    doc.text(isArabic ? 'سعر التذكرة:' : 'Prix du billet:', labelX, currentY);
    doc.text(`${data.ticketPrice.toLocaleString('fr-FR')} DA`, valueX, currentY, { align: 'right' });

    currentY += 8;
    doc.text(isArabic ? 'رسوم الوكالة:' : 'Frais agence:', labelX, currentY);
    doc.text(`${data.agencyFees.toLocaleString('fr-FR')} DA`, valueX, currentY, { align: 'right' });

    currentY += 6;
    doc.setDrawColor(180, 180, 180);
    doc.line(labelX, currentY, valueX, currentY);
  }

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  if (!isProforma) {
    doc.text(isArabic ? 'المجموع قبل الضريبة:' : 'Total HT:', labelX, currentY);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, { align: 'right' });

    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(isArabic ? 'ضريبة (0%):' : 'TVA (0%):', labelX, currentY);
    doc.text('0 DA', valueX, currentY, { align: 'right' });

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(isArabic ? 'المجموع الكلي:' : 'Total TTC:', labelX, currentY);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, { align: 'right' });
  } else {
    doc.text(isArabic ? 'المجموع:' : 'Total:', labelX, currentY);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, { align: 'right' });
  }
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  currentY += boxHeight - (hasBreakdown ? 42 : 26);

  // ===== REGLEMENT SECTION =====
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(isArabic ? 'الدفع' : 'RÈGLEMENT', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (data.paymentMethod) {
    currentY += 6;
    const paymentLabels: Record<string, { fr: string; ar: string }> = {
      especes: { fr: 'Espèces', ar: 'نقدي' },
      virement: { fr: 'Virement', ar: 'تحويل بنكي' },
      cheque: { fr: 'Chèque', ar: 'شيك' },
      carte: { fr: 'Carte bancaire', ar: 'بطاقة بنكية' },
    };
    const paymentLabel = paymentLabels[data.paymentMethod]?.[isArabic ? 'ar' : 'fr'] || data.paymentMethod;
    doc.text(`${isArabic ? 'طريقة الدفع' : 'Mode de paiement'}: ${paymentLabel}`, 14, currentY);
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

  // ===== CONDITIONS (Proforma) or PAYMENT INFO (Finale) =====
  if (isProforma) {
    currentY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(isArabic ? 'الشروط:' : 'Conditions:', 14, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 6;
    doc.text(`• ${isArabic ? 'الدفع قبل إصدار التذكرة' : 'Paiement avant émission du billet'}`, 18, currentY);
    currentY += 6;
    doc.text(`• ${isArabic ? 'صلاحية العرض' : "Validité de l'offre"}: ${data.validityHours} ${isArabic ? 'ساعة' : 'heures'}`, 18, currentY);

    // Proforma warning
    currentY += 12;
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(255, 200, 50);
    doc.roundedRect(14, currentY - 4, pageWidth - 28, 14, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 100, 0);
    doc.text(
      isArabic ? '⚠ هذه فاتورة مبدئية، غير صالحة للمحاسبة' : '⚠ Ceci est une facture proforma, non valable pour la comptabilité',
      pageWidth / 2,
      currentY + 4,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    currentY += 14;
  } else {
    // Final invoice - note
    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(isArabic ? 'تذكرة صادرة وغير قابلة للاسترداد' : 'Billet émis et non remboursable', 14, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 12;
  }

  // ===== STAMP & SIGNATURE SECTION =====
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(isArabic ? 'الختم والتوقيع' : 'Cachet et Signature', pageWidth / 2, currentY, { align: 'center' });

  // Empty signature box
  currentY += 6;
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth / 2 - 40, currentY, 80, 35, 2, 2, 'FD');

  // ===== ARABIC FOOTER =====
  drawArabicFooter(doc, info, hasTajawal);

  // ===== GENERATION TIMESTAMP =====
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  const timestamp = new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR');
  doc.text(`${isArabic ? 'تم الإنشاء في' : 'Généré le'} ${timestamp}`, pageWidth - 14, pageHeight - 2, { align: 'right' });

  // Save the PDF
  const fileName = `${isProforma ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
