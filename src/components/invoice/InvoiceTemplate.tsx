import React, { forwardRef } from 'react';
import logoSrc from '@/assets/logo-elhikma.png';
import { numberToWords } from '@/utils/numberToWords';
import { AGENCY_INFO } from '@/constants/agency';

// Re-use the same interfaces from invoiceGenerator
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

export interface ClientInvoicePdfData {
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

const TRAVEL_CLASS_LABELS: Record<string, { fr: string; ar: string }> = {
  economique: { fr: 'Économique', ar: 'اقتصادية' },
  affaires: { fr: 'Affaires', ar: 'رجال أعمال' },
  premiere: { fr: 'Première', ar: 'الدرجة الأولى' },
};

const PAYMENT_LABELS: Record<string, { fr: string; ar: string }> = {
  especes: { fr: 'Espèces', ar: 'نقدي' },
  virement: { fr: 'Virement', ar: 'تحويل بنكي' },
  cheque: { fr: 'Chèque', ar: 'شيك' },
  carte: { fr: 'Carte bancaire', ar: 'بطاقة بنكية' },
};

function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

interface InvoiceTemplateProps {
  data: ClientInvoicePdfData;
}

/**
 * A4 invoice layout rendered as HTML for html2canvas capture.
 * This component is never shown to the user — it is rendered off-screen.
 */
const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const info = mergeAgencyInfo(data.agencyInfo);
    const isProforma = data.invoiceType === 'proforma';
    const isArabic = data.language === 'ar';
    const lang = isArabic ? 'ar' : 'fr';

    const bannerColor = isProforma ? '#3B82F6' : '#22644A';
    const titleText = isProforma
      ? isArabic ? 'فاتورة مبدئية' : 'FACTURE PROFORMA'
      : isArabic ? 'فاتورة نهائية' : 'FACTURE DÉFINITIVE';

    const hasBreakdown = data.ticketPrice > 0 || data.agencyFees > 0;

    const classLabel = TRAVEL_CLASS_LABELS[data.travelClass]?.[lang] || data.travelClass;
    const paymentLabel = PAYMENT_LABELS[data.paymentMethod]?.[lang] || data.paymentMethod;

    const amountWords = numberToWords(data.totalAmount);
    const docType = isProforma ? 'proforma' : 'définitive';

    const arrow = isArabic ? '←' : '✈';
    const formattedDestination = data.destination?.replace(/-/g, ` ${arrow} `) || '';

    const timestamp = new Date().toLocaleString(isArabic ? 'ar-DZ' : 'fr-FR');

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          minHeight: '1123px',
          fontFamily: "'Tajawal', sans-serif",
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '24px 32px',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ===== HEADER ===== */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <img
            src={logoSrc}
            alt="Logo"
            style={{ width: '120px', height: 'auto', margin: '0 auto 8px' }}
            crossOrigin="anonymous"
          />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>
            {info.legalName}
          </div>
          <div style={{ fontSize: '10px', color: '#505050', marginTop: '2px' }}>
            {isArabic ? 'العنوان' : 'Adresse'}: {info.address}
          </div>
          <div style={{ fontSize: '10px', color: '#505050', marginTop: '2px' }}>
            {isArabic ? 'الهاتف' : 'Tél'}: {info.phone}
            {info.mobilePhone ? ` / ${info.mobilePhone}` : ''} | Email: {info.email}
          </div>
          <div style={{ fontSize: '10px', color: '#505050', marginTop: '2px' }}>
            RC: {info.rc} | NIF: {info.nif} | NIS: {info.nis}
          </div>
        </div>

        {/* ===== TITLE BANNER ===== */}
        <div
          style={{
            backgroundColor: bannerColor,
            borderRadius: '6px',
            padding: '10px 0',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          <span
            style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}
            dir={isArabic ? 'rtl' : undefined}
          >
            {titleText}
          </span>
        </div>

        {/* ===== INVOICE NUMBER ===== */}
        <div style={{ textAlign: 'center', margin: '8px 0 4px', fontSize: '13px' }}>
          N° {data.invoiceNumber}
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #b4b4b4', margin: '0 0 10px' }} />

        {/* ===== CLIENT SECTION ===== */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#333' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'العميل' : 'CLIENT'}
            </span>
            <span style={{ fontSize: '12px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'التاريخ' : 'Date'}: {data.invoiceDate}
            </span>
          </div>
          <div style={{ fontSize: '12px', marginTop: '6px' }} dir={isArabic ? 'rtl' : undefined}>
            {isArabic ? 'الاسم' : 'Nom'}: {data.clientName}
          </div>
          {data.clientPassport && (
            <div style={{ fontSize: '12px', marginTop: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'جواز السفر' : 'Passeport'}: {data.clientPassport}
            </div>
          )}
        </div>

        {/* ===== PRESTATION SECTION ===== */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '6px' }} dir={isArabic ? 'rtl' : undefined}>
            {isArabic ? 'الخدمة' : 'PRESTATION'}
          </div>
          <div style={{ fontSize: '12px' }}>{data.serviceName}</div>

          {formattedDestination && (
            <div style={{ fontSize: '12px', marginTop: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'المسار' : 'Itinéraire'}: {formattedDestination}
            </div>
          )}

          {data.companyName && (
            <div style={{ fontSize: '12px', marginTop: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'الشركة' : 'Compagnie'}: {data.companyName}
            </div>
          )}

          {data.departureDate && (
            <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', gap: '24px' }}>
              <span dir={isArabic ? 'rtl' : undefined}>
                {isArabic ? 'تاريخ المغادرة' : 'Date de départ'}: {data.departureDate}
              </span>
              {data.returnDate && (
                <span dir={isArabic ? 'rtl' : undefined}>
                  {isArabic ? 'العودة' : 'Retour'}: {data.returnDate}
                </span>
              )}
            </div>
          )}

          {data.travelClass && (
            <div style={{ fontSize: '12px', marginTop: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'الدرجة' : 'Classe'}: {classLabel}
            </div>
          )}

          {!isProforma && data.pnr && (
            <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 700 }}>
              PNR: {data.pnr}
            </div>
          )}
        </div>

        {/* ===== FINANCIAL SECTION ===== */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '6px' }} dir={isArabic ? 'rtl' : undefined}>
            {isArabic ? 'التفاصيل المالية' : 'DÉTAILS FINANCIERS'}
          </div>

          <div
            style={{
              border: '1px solid #c8c8c8',
              borderRadius: '6px',
              backgroundColor: '#fafafa',
              padding: '12px 16px',
            }}
          >
            {hasBreakdown && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span dir={isArabic ? 'rtl' : undefined}>
                    {isArabic ? 'سعر التذكرة:' : 'Prix du billet:'}
                  </span>
                  <span>{fmt(data.ticketPrice)} DA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span dir={isArabic ? 'rtl' : undefined}>
                    {isArabic ? 'رسوم الوكالة:' : 'Frais agence:'}
                  </span>
                  <span>{fmt(data.agencyFees)} DA</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #b4b4b4', margin: '4px 0 8px' }} />
              </>
            )}

            {!isProforma ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span dir={isArabic ? 'rtl' : undefined}>
                    {isArabic ? 'المجموع قبل الضريبة:' : 'Total HT:'}
                  </span>
                  <span>{fmt(data.totalAmount)} DA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span dir={isArabic ? 'rtl' : undefined}>
                    {isArabic ? 'ضريبة (0%):' : 'TVA (0%):'}
                  </span>
                  <span>0 DA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                  <span dir={isArabic ? 'rtl' : undefined}>
                    {isArabic ? 'المجموع الكلي:' : 'Total TTC:'}
                  </span>
                  <span>{fmt(data.totalAmount)} DA</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                <span dir={isArabic ? 'rtl' : undefined}>
                  {isArabic ? 'المجموع:' : 'Total:'}
                </span>
                <span>{fmt(data.totalAmount)} DA</span>
              </div>
            )}
          </div>
        </div>

        {/* ===== PAYMENT + SIGNATURE SIDE BY SIDE ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '24px' }}>
          {/* Left: Règlement */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'الدفع' : 'RÈGLEMENT'}
            </div>

            {data.paymentMethod && (
              <div style={{ fontSize: '11px', marginBottom: '3px' }} dir={isArabic ? 'rtl' : undefined}>
                {isArabic ? 'طريقة الدفع' : 'Mode de paiement'}: {paymentLabel}
              </div>
            )}

            {(info.bankName || info.bankAccount) && (
              <>
                <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                  Banque: {info.bankName || '—'}
                </div>
                <div style={{ fontSize: '11px', marginBottom: '3px' }}>
                  Compte: {info.bankAccount || '—'}
                </div>
              </>
            )}

            <div style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '4px', lineHeight: '1.4' }}>
              Arrêté la présente facture {docType} à la somme de: {amountWords} Dinars Algériens
            </div>
          </div>

          {/* Right: Cachet et Signature */}
          <div style={{ width: '200px', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '4px' }} dir={isArabic ? 'rtl' : undefined}>
              {isArabic ? 'الختم والتوقيع' : 'Cachet et Signature'}
            </div>
            <div style={{ height: '60px' }} />
          </div>
        </div>

        {/* ===== CONDITIONS ===== */}
        {isProforma ? (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', marginBottom: '3px' }} dir={isArabic ? 'rtl' : undefined}>
              • {isArabic ? 'الدفع قبل إصدار التذكرة' : 'Paiement avant émission du billet'}
            </div>
            <div style={{ fontSize: '11px', marginBottom: '6px' }} dir={isArabic ? 'rtl' : undefined}>
              • {isArabic ? 'صلاحية العرض' : "Validité de l'offre"}: {data.validityHours} {isArabic ? 'ساعة' : 'heures'}
            </div>
            {/* Warning banner */}
            <div
              style={{
                backgroundColor: '#FFF8DC',
                border: '1px solid #FFC832',
                borderRadius: '6px',
                padding: '6px 12px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: '#966400',
              }}
            >
              <span dir={isArabic ? 'rtl' : undefined}>
                ⚠ {isArabic ? 'هذه فاتورة مبدئية، غير صالحة للمحاسبة' : 'Ceci est une facture proforma, non valable pour la comptabilité'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '8px' }} dir={isArabic ? 'rtl' : undefined}>
            {isArabic ? 'تذكرة صادرة وغير قابلة للاسترداد' : 'Billet émis et non remboursable'}
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div style={{ flex: 1 }} />

        {/* ===== ARABIC FOOTER ===== */}
        <div style={{ textAlign: 'center', marginTop: '12px' }} dir="rtl">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#3c3c3c', marginBottom: '4px' }}>
            {info.arabicName}
          </div>
          <div style={{ fontSize: '10px', color: '#3c3c3c', marginBottom: '3px' }}>
            {info.arabicAddress}
          </div>
          <div style={{ fontSize: '9px', color: '#3c3c3c', marginBottom: '3px' }}>
            {info.rc && `رقم السجل التجاري: ${info.rc}`}
            {info.nif && `   رقم التعريف الجبائي: ${info.nif}`}
            {info.articleFiscal && `   رقم المادة الجبائية: ${info.articleFiscal}`}
          </div>
          <div style={{ fontSize: '9px', color: '#3c3c3c', marginBottom: '3px' }}>
            {info.nis && `رقم التعريف الإحصائي: ${info.nis}`}
            {info.licenseNumber && `   رقم رخصة الوكالة: ${info.licenseNumber}`}
          </div>
          <div style={{ fontSize: '9px', color: '#3c3c3c' }}>
            {info.mobilePhone && `الجوال: ${info.mobilePhone}`}
            {info.phone && `   المكتب: ${info.phone}`}
          </div>
        </div>

        {/* ===== GENERATION TIMESTAMP ===== */}
        <div style={{ textAlign: 'right', fontSize: '9px', color: '#a0a0a0', marginTop: '8px' }} dir={isArabic ? 'rtl' : undefined}>
          {isArabic ? 'تم الإنشاء في' : 'Généré le'} {timestamp}
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
