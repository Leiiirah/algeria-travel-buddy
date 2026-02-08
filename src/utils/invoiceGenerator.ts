import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AGENCY_INFO } from '@/constants/agency';
import { registerTajawalFont } from './tajawalFont';
import { numberToWords } from './numberToWords';
import { reshapeArabic, reshapeArabicLabel } from './arabicReshaper';

// ============ Shared types ============

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
  articleFiscal?: string;
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
    articleFiscal: param?.articleFiscal || AGENCY_INFO.articleFiscal,
    arabicName: param?.arabicName || AGENCY_INFO.arabicName,
    arabicAddress: param?.arabicAddress || AGENCY_INFO.arabicAddress,
  };
}

// ============ Arabic Footer ============

function drawArabicFooter(doc: jsPDF, info: ReturnType<typeof mergeAgencyInfo>, hasTajawal: boolean) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const centerX = pageWidth / 2;
  let y = pageHeight - 32;

  // Line 1: Arabic name (Tajawal Bold)
  if (hasTajawal) {
    doc.setFont('Tajawal', 'bold');
  } else {
    doc.setFont('helvetica', 'bold');
  }
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(reshapeArabic(info.arabicName), centerX, y, { align: 'center' });

  // Line 2: Arabic address (Tajawal Regular)
  y += 5;
  if (hasTajawal) {
    doc.setFont('Tajawal', 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }
  doc.setFontSize(8);
  doc.text(reshapeArabic(info.arabicAddress), centerX, y, { align: 'center' });

  // Line 3: RC + NIF + Article Fiscal
  y += 5;
  doc.setFontSize(8);
  const line3Parts: string[] = [];
  if (info.rc) line3Parts.push(reshapeArabicLabel('رقم السجل التجاري', info.rc));
  if (info.nif) line3Parts.push(reshapeArabicLabel('رقم التعريف الجبائي', info.nif));
  if (info.articleFiscal) line3Parts.push(reshapeArabicLabel('رقم المادة الجبائية', info.articleFiscal));
  doc.text(line3Parts.join('   '), centerX, y, { align: 'center' });

  // Line 4: NIS + License Number
  y += 5;
  const line4Parts: string[] = [];
  if (info.nis) line4Parts.push(reshapeArabicLabel('رقم التعريف الإحصائي', info.nis));
  if (info.licenseNumber) line4Parts.push(reshapeArabicLabel('رقم رخصة الوكالة', info.licenseNumber));
  doc.text(line4Parts.join('   '), centerX, y, { align: 'center' });

  // Line 5: Phone numbers
  y += 5;
  const line5Parts: string[] = [];
  if (info.mobilePhone) line5Parts.push(reshapeArabicLabel('الجوال', info.mobilePhone));
  if (info.phone) line5Parts.push(reshapeArabicLabel('المكتب', info.phone));
  doc.text(line5Parts.join('   '), centerX, y, { align: 'center' });

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
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
  if (hasTajawal) {
    doc.setFont('Tajawal', 'bold');
  } else {
    doc.setFont('helvetica', 'bold');
  }
  doc.text(info.legalName, pageWidth / 2, currentY, { align: 'center' });
  doc.setFont('helvetica', 'normal');

  currentY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  if (isArabic) {
    doc.text(`${info.address} :${reshapeArabic('العنوان')}`, pageWidth / 2, currentY, { align: 'center' });
  } else {
    doc.text(`Adresse: ${info.address}`, pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 4;
  if (isArabic) {
    const phoneText = info.mobilePhone
      ? `Email: ${info.email} | ${info.phone} / ${info.mobilePhone} :${reshapeArabic('الهاتف')}`
      : `Email: ${info.email} | ${info.phone} :${reshapeArabic('الهاتف')}`;
    doc.text(phoneText, pageWidth / 2, currentY, { align: 'center' });
  } else {
    const phoneText = info.mobilePhone
      ? `Tél: ${info.phone} / ${info.mobilePhone} | Email: ${info.email}`
      : `Tél: ${info.phone} | Email: ${info.email}`;
    doc.text(phoneText, pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 4;
  doc.text(`RC: ${info.rc} | NIF: ${info.nif} | NIS: ${info.nis}`, pageWidth / 2, currentY, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // ===== INVOICE TITLE BANNER =====
  currentY += 6;
  const bannerHeight = 14;
  if (isProforma) {
    doc.setFillColor(59, 130, 246); // Blue #3B82F6
  } else {
    doc.setFillColor(34, 100, 74); // Green #22644A
  }
  doc.roundedRect(14, currentY, pageWidth - 28, bannerHeight, 2, 2, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const titleText = isProforma
    ? (isArabic ? reshapeArabic('فاتورة مبدئية') : 'FACTURE PROFORMA')
    : (isArabic ? reshapeArabic('فاتورة نهائية') : 'FACTURE DÉFINITIVE');
  doc.text(titleText, pageWidth / 2, currentY + 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  currentY += bannerHeight + 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.invoiceNumber}`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // ===== CLIENT SECTION =====
  currentY += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  if (isArabic) {
    doc.text(reshapeArabic('العميل'), pageWidth - 14, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.invoiceDate} :${reshapeArabic('التاريخ')}`, 14, currentY);
  } else {
    doc.text('CLIENT', 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${data.invoiceDate}`, pageWidth - 14, currentY, { align: 'right' });
  }
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  currentY += 8;
  if (isArabic) {
    doc.text(`${data.clientName} :${reshapeArabic('الاسم')}`, pageWidth - 14, currentY, { align: 'right' });
  } else {
    doc.text(`Nom: ${data.clientName}`, 14, currentY);
  }
  if (data.clientPassport) {
    currentY += 6;
    if (isArabic) {
      doc.text(`${data.clientPassport} :${reshapeArabic('جواز السفر')}`, pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text(`Passeport: ${data.clientPassport}`, 14, currentY);
    }
  }

  // ===== SERVICE/PRESTATION SECTION =====
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  if (isArabic) {
    doc.text(reshapeArabic('الخدمة'), pageWidth - 14, currentY, { align: 'right' });
  } else {
    doc.text('PRESTATION', 14, currentY);
  }
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  if (isArabic) {
    doc.text(`${data.serviceName}`, pageWidth - 14, currentY, { align: 'right' });
  } else {
    doc.text(`${data.serviceName}`, 14, currentY);
  }

  if (data.destination) {
    currentY += 5;
    const arrow = isArabic ? '←' : '✈';
    const formattedDestination = data.destination.replace(/-/g, ` ${arrow} `);
    if (isArabic) {
      doc.text(`${formattedDestination} :${reshapeArabic('المسار')}`, pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text(`Itinéraire: ${formattedDestination}`, 14, currentY);
    }
  }

  if (data.companyName) {
    currentY += 5;
    if (isArabic) {
      doc.text(`${data.companyName} :${reshapeArabic('الشركة')}`, pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text(`Compagnie: ${data.companyName}`, 14, currentY);
    }
  }

  if (data.departureDate) {
    currentY += 5;
    if (isArabic) {
      doc.text(`${data.departureDate} :${reshapeArabic('تاريخ المغادرة')}`, pageWidth - 14, currentY, { align: 'right' });
      if (data.returnDate) {
        doc.text(`${data.returnDate} :${reshapeArabic('العودة')}`, pageWidth / 2, currentY, { align: 'right' });
      }
    } else {
      doc.text(`Date de départ: ${data.departureDate}`, 14, currentY);
      if (data.returnDate) {
        doc.text(`Retour: ${data.returnDate}`, pageWidth / 2, currentY);
      }
    }
  }

  if (data.travelClass) {
    currentY += 5;
    const classLabels: Record<string, { fr: string; ar: string }> = {
      economique: { fr: 'Économique', ar: reshapeArabic('اقتصادية') },
      affaires: { fr: 'Affaires', ar: reshapeArabic('رجال أعمال') },
      premiere: { fr: 'Première', ar: reshapeArabic('الدرجة الأولى') },
    };
    const classLabel = classLabels[data.travelClass]?.[isArabic ? 'ar' : 'fr'] || data.travelClass;
    if (isArabic) {
      doc.text(`${classLabel} :${reshapeArabic('الدرجة')}`, pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text(`Classe: ${classLabel}`, 14, currentY);
    }
  }

  // PNR only for final invoices
  if (!isProforma && data.pnr) {
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    if (isArabic) {
      doc.text(`PNR: ${data.pnr}`, pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text(`PNR: ${data.pnr}`, 14, currentY);
    }
    doc.setFont('helvetica', 'normal');
  }

  // ===== FINANCIAL SECTION =====
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  if (isArabic) {
    doc.text(reshapeArabic('التفاصيل المالية'), pageWidth - 14, currentY, { align: 'right' });
  } else {
    doc.text('DÉTAILS FINANCIERS', 14, currentY);
  }
  doc.setTextColor(0, 0, 0);

  // Financial details box
  currentY += 8;
  const boxX = 14;
  const boxWidth = pageWidth - 28;
  const hasBreakdown = data.ticketPrice > 0 || data.agencyFees > 0;
  const boxHeight = hasBreakdown ? 52 : 36;
  const boxStartY = currentY - 2;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(boxX, boxStartY, boxWidth, boxHeight, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const labelX = isArabic ? boxX + boxWidth - 10 : boxX + 10;
  const valueX = isArabic ? boxX + 10 : boxX + boxWidth - 10;

  // Show ticket price and agency fees if available
  if (hasBreakdown) {
    currentY += 6;
    doc.text(isArabic ? reshapeArabic('سعر التذكرة:') : 'Prix du billet:', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text(`${data.ticketPrice.toLocaleString('fr-FR')} DA`, valueX, currentY, isArabic ? undefined : { align: 'right' });

    currentY += 8;
    doc.text(isArabic ? reshapeArabic('رسوم الوكالة:') : 'Frais agence:', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text(`${data.agencyFees.toLocaleString('fr-FR')} DA`, valueX, currentY, isArabic ? undefined : { align: 'right' });

    currentY += 6;
    doc.setDrawColor(180, 180, 180);
    const lineStartX = boxX + 10;
    const lineEndX = boxX + boxWidth - 10;
    doc.line(lineStartX, currentY, lineEndX, currentY);
  }

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  if (!isProforma) {
    doc.text(isArabic ? reshapeArabic('المجموع قبل الضريبة:') : 'Total HT:', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, isArabic ? undefined : { align: 'right' });

    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(isArabic ? reshapeArabic('ضريبة (0%):') : 'TVA (0%):', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text('0 DA', valueX, currentY, isArabic ? undefined : { align: 'right' });

    currentY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(isArabic ? reshapeArabic('المجموع الكلي:') : 'Total TTC:', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, isArabic ? undefined : { align: 'right' });
  } else {
    doc.text(isArabic ? reshapeArabic('المجموع:') : 'Total:', labelX, currentY, isArabic ? { align: 'right' } : undefined);
    doc.text(`${data.totalAmount.toLocaleString('fr-FR')} DA`, valueX, currentY, isArabic ? undefined : { align: 'right' });
  }
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  currentY = boxStartY + boxHeight;

  // ===== REGLEMENT + CACHET ET SIGNATURE (side by side) =====
  currentY += 6;

  const reglementStartY = currentY;
  const leftColX = 14;

  if (isArabic) {
    // --- Right side: Règlement (RTL layout) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(reshapeArabic('الدفع'), pageWidth - 14, currentY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    if (data.paymentMethod) {
      currentY += 5;
      const paymentLabels: Record<string, string> = {
        especes: reshapeArabic('نقدي'),
        virement: reshapeArabic('تحويل بنكي'),
        cheque: reshapeArabic('شيك'),
        carte: reshapeArabic('بطاقة بنكية'),
      };
      const paymentLabel = paymentLabels[data.paymentMethod] || data.paymentMethod;
      doc.text(`${paymentLabel} :${reshapeArabic('طريقة الدفع')}`, pageWidth - 14, currentY, { align: 'right' });
    }

    if (info.bankName || info.bankAccount) {
      currentY += 5;
      doc.text(`${info.bankName || '—'} :Banque`, pageWidth - 14, currentY, { align: 'right' });
      currentY += 4;
      doc.text(`${info.bankAccount || '—'} :Compte`, pageWidth - 14, currentY, { align: 'right' });
    }

    // Amount in words
    currentY += 5;
    const amountWords = numberToWords(data.totalAmount);
    const docType = isProforma ? 'proforma' : 'définitive';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const wordsText = `Arrêté la présente facture ${docType} à la somme de: ${amountWords} Dinars Algériens`;
    const wordsLines = doc.splitTextToSize(wordsText, pageWidth / 2 - 20);
    doc.text(wordsLines, pageWidth - 14, currentY, { align: 'right' });

    const rightColEndY = currentY + wordsLines.length * 4;

    // --- Left side: Cachet et Signature (RTL layout) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text(reshapeArabic('الختم والتوقيع'), 14, reglementStartY);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    currentY = Math.max(rightColEndY, reglementStartY + 20);
  } else {
    // --- Left side: Règlement (LTR layout) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RÈGLEMENT', leftColX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    if (data.paymentMethod) {
      currentY += 5;
      const paymentLabels: Record<string, string> = {
        especes: 'Espèces',
        virement: 'Virement',
        cheque: 'Chèque',
        carte: 'Carte bancaire',
      };
      const paymentLabel = paymentLabels[data.paymentMethod] || data.paymentMethod;
      doc.text(`Mode de paiement: ${paymentLabel}`, leftColX, currentY);
    }

    if (info.bankName || info.bankAccount) {
      currentY += 5;
      doc.text(`Banque: ${info.bankName || '—'}`, leftColX, currentY);
      currentY += 4;
      doc.text(`Compte: ${info.bankAccount || '—'}`, leftColX, currentY);
    }

    // Amount in words
    currentY += 5;
    const amountWords = numberToWords(data.totalAmount);
    const docType = isProforma ? 'proforma' : 'définitive';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    const wordsText = `Arrêté la présente facture ${docType} à la somme de: ${amountWords} Dinars Algériens`;
    const wordsLines = doc.splitTextToSize(wordsText, pageWidth / 2 - 20);
    doc.text(wordsLines, leftColX, currentY);

    const leftColEndY = currentY + wordsLines.length * 4;

    // --- Right side: Cachet et Signature ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('Cachet et Signature', pageWidth - 14, reglementStartY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    currentY = Math.max(leftColEndY, reglementStartY + 20);
  }

  // ===== CONDITIONS (Proforma) or PAYMENT INFO (Finale) =====
  if (isProforma) {
    currentY += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (isArabic) {
      doc.text(`${reshapeArabic('الدفع قبل إصدار التذكرة')} •`, pageWidth - 14 - 4, currentY, { align: 'right' });
      currentY += 4;
      doc.text(`${data.validityHours} ${reshapeArabic('ساعة')} :${reshapeArabic('صلاحية العرض')} •`, pageWidth - 14 - 4, currentY, { align: 'right' });
    } else {
      doc.text(`• Paiement avant émission du billet`, leftColX + 4, currentY);
      currentY += 4;
      doc.text(`• Validité de l'offre: ${data.validityHours} heures`, leftColX + 4, currentY);
    }

    // Proforma warning
    currentY += 6;
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(255, 200, 50);
    doc.roundedRect(14, currentY - 3, pageWidth - 28, 10, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 100, 0);
    doc.text(
      isArabic ? reshapeArabic('⚠ هذه فاتورة مبدئية، غير صالحة للمحاسبة') : '⚠ Ceci est une facture proforma, non valable pour la comptabilité',
      pageWidth / 2,
      currentY + 3,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  } else {
    // Final invoice - note
    currentY += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    if (isArabic) {
      doc.text(reshapeArabic('تذكرة صادرة وغير قابلة للاسترداد'), pageWidth - 14, currentY, { align: 'right' });
    } else {
      doc.text('Billet émis et non remboursable', leftColX, currentY);
    }
    doc.setFont('helvetica', 'normal');
  }

  // ===== ARABIC FOOTER =====
  drawArabicFooter(doc, info, hasTajawal);

  // ===== GENERATION TIMESTAMP =====
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  const timestamp = new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR');
  doc.text(`${isArabic ? reshapeArabic('تم الإنشاء في') : 'Généré le'} ${timestamp}`, pageWidth - 14, pageHeight - 2, { align: 'right' });

  // Save the PDF
  const fileName = `${isProforma ? 'proforma' : 'facture'}_${data.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
