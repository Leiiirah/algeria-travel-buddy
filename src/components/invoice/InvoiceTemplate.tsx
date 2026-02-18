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

const STATUS_LABELS: Record<string, { fr: string; ar: string; color: string; bg: string }> = {
  payee: { fr: 'Payée', ar: 'مدفوعة', color: '#166534', bg: '#dcfce7' },
  partielle: { fr: 'Partielle', ar: 'جزئية', color: '#92400e', bg: '#fef3c7' },
  en_attente: { fr: 'En attente', ar: 'قيد الانتظار', color: '#991b1b', bg: '#fee2e2' },
  annulee: { fr: 'Annulée', ar: 'ملغاة', color: '#6b7280', bg: '#f3f4f6' },
};

function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

interface InvoiceTemplateProps {
  data: ClientInvoicePdfData;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const info = mergeAgencyInfo(data.agencyInfo);
    const isProforma = data.invoiceType === 'proforma';
    const isArabic = data.language === 'ar';
    const lang = isArabic ? 'ar' : 'fr';

    // Normalize financial fields to numbers to prevent string concatenation
    const amount = Number(data.totalAmount) || 0;
    const ticket = Number(data.ticketPrice) || 0;
    const fees = Number(data.agencyFees) || 0;
    const tva = !isProforma && fees > 0 ? Math.round(fees * 0.09 * 100) / 100 : 0;
    const totalTTC = ticket + fees + tva;

    const accent = isProforma ? '#1E3A5F' : '#1B4332';
    const accentLight = isProforma ? '#e8eef5' : '#e6f0eb';

    const titleText = isProforma
      ? isArabic ? 'فاتورة مبدئية' : 'FACTURE PROFORMA'
      : isArabic ? 'فاتورة نهائية' : 'FACTURE DÉFINITIVE';

    const hasBreakdown = ticket > 0 || fees > 0;
    const classLabel = TRAVEL_CLASS_LABELS[data.travelClass]?.[lang] || data.travelClass;
    const paymentLabel = PAYMENT_LABELS[data.paymentMethod]?.[lang] || data.paymentMethod;
    const statusInfo = STATUS_LABELS[data.status] || STATUS_LABELS['en_attente'];

    const amountWords = numberToWords(amount);
    const docType = isProforma ? 'proforma' : 'définitive';

    const arrow = isArabic ? '←' : '→';
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
          color: '#1a1a1a',
          padding: '32px',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ===== BILINGUAL LETTERHEAD ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          {/* French side */}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: accent, letterSpacing: '0.5px' }}>
              {info.legalName}
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '4px', lineHeight: '1.5' }}>
              {info.address}
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>
              Tél: {info.phone}{info.mobilePhone ? ` / ${info.mobilePhone}` : ''}
            </div>
          </div>

          {/* Logo center */}
          <div style={{ width: '120px', textAlign: 'center', padding: '0 16px' }}>
            <img
              src={logoSrc}
              alt="Logo"
              style={{ width: '100px', height: 'auto' }}
              crossOrigin="anonymous"
            />
          </div>

          {/* Arabic side */}
          <div style={{ flex: 1, textAlign: 'right' }} dir="rtl">
            <div style={{ fontSize: '16px', fontWeight: 700, color: accent }}>
              {info.arabicName}
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '4px', lineHeight: '1.5' }}>
              {info.arabicAddress}
            </div>
            <div style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>
              البريد: {info.email}
            </div>
          </div>
        </div>

        {/* Legal identifiers row */}
        <div style={{ textAlign: 'center', fontSize: '9px', color: '#6b7280', marginBottom: '4px', letterSpacing: '0.3px' }}>
          RC: {info.rc} &nbsp;|&nbsp; NIF: {info.nif} &nbsp;|&nbsp; NIS: {info.nis}
          {info.articleFiscal && <> &nbsp;|&nbsp; Art. Fiscal: {info.articleFiscal}</>}
        </div>

        {/* Separator */}
        <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, marginBottom: '12px' }} />

        {/* ===== TITLE BANNER ===== */}
        <div
          style={{
            backgroundColor: accent,
            borderRadius: '4px',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px' }}
            dir={isArabic ? 'rtl' : undefined}
          >
            {titleText}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
            N° {data.invoiceNumber}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}
            dir={isArabic ? 'rtl' : undefined}
          >
            {isArabic ? 'التاريخ' : 'Date'}: {data.invoiceDate}
          </span>
        </div>


        {/* ===== TWO-COLUMN INFO CARDS ===== */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
          {/* Client Card */}
          <div
            style={{
              flex: 1,
              borderLeft: `3px solid ${accent}`,
              backgroundColor: '#fafbfc',
              borderRadius: '0 4px 4px 0',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
              dir={isArabic ? 'rtl' : undefined}
            >
              {isArabic ? 'العميل' : 'Client'}
            </div>
            <InfoRow label={isArabic ? 'الاسم' : 'Nom'} value={data.clientName} isArabic={isArabic} />
            {data.clientPassport && (
              <InfoRow label={isArabic ? 'جواز السفر' : 'Passeport'} value={data.clientPassport} isArabic={isArabic} />
            )}
            {data.clientPhone && (
              <InfoRow label={isArabic ? 'الهاتف' : 'Tél'} value={data.clientPhone} isArabic={isArabic} />
            )}
          </div>

          {/* Prestation Card */}
          <div
            style={{
              flex: 1,
              borderLeft: `3px solid ${accent}`,
              backgroundColor: '#fafbfc',
              borderRadius: '0 4px 4px 0',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
              dir={isArabic ? 'rtl' : undefined}
            >
              {isArabic ? 'الخدمة' : 'Prestation'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>{data.serviceName}</div>
            {formattedDestination && (
              <InfoRow label={isArabic ? 'المسار' : 'Itinéraire'} value={formattedDestination} isArabic={isArabic} />
            )}
            {data.companyName && (
              <InfoRow
                label={isArabic ? 'الشركة' : 'Compagnie'}
                value={`${data.companyName}${classLabel ? ` — ${classLabel}` : ''}`}
                isArabic={isArabic}
              />
            )}
            {data.departureDate && (
              <InfoRow
                label={isArabic ? 'المغادرة' : 'Départ'}
                value={`${data.departureDate}${data.returnDate ? `  →  ${data.returnDate}` : ''}`}
                isArabic={isArabic}
              />
            )}
            {!isProforma && data.pnr && (
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: accentLight,
                  color: accent,
                  padding: '2px 10px',
                  borderRadius: '4px',
                  letterSpacing: '1px',
                }}>
                  PNR: {data.pnr}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===== FINANCIAL TABLE ===== */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
            dir={isArabic ? 'rtl' : undefined}
          >
            {isArabic ? 'التفاصيل المالية' : 'Détails Financiers'}
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#475569', borderBottom: `2px solid ${accent}` }}
                  dir={isArabic ? 'rtl' : undefined}
                >
                  {isArabic ? 'البيان' : 'Désignation'}
                </th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600, color: '#475569', borderBottom: `2px solid ${accent}`, width: '160px' }}
                  dir={isArabic ? 'rtl' : undefined}
                >
                  {isArabic ? 'المبلغ (د.ج)' : 'Montant (DA)'}
                </th>
              </tr>
            </thead>
            <tbody>
              {hasBreakdown && (
                <>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '7px 12px' }} dir={isArabic ? 'rtl' : undefined}>
                      {isArabic ? 'سعر التذكرة' : 'Prix du billet'}
                    </td>
                    <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(ticket)} DA</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '7px 12px' }} dir={isArabic ? 'rtl' : undefined}>
                      {isArabic ? 'رسوم الوكالة (خ.ض.م)' : "Frais d'agence HT"}
                    </td>
                    <td style={{ padding: '7px 12px', textAlign: 'right' }}>{fmt(fees)} DA</td>
                  </tr>
                  {!isProforma && tva > 0 && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                      <td style={{ padding: '7px 12px', fontStyle: 'italic', color: '#92400e' }} dir={isArabic ? 'rtl' : undefined}>
                        {isArabic ? 'ضريبة القيمة المضافة 9% (رسوم الوكالة)' : "TVA 9% (Frais d'agence)"}
                      </td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontStyle: 'italic', color: '#92400e' }}>{fmt(tva)} DA</td>
                    </tr>
                  )}
                </>
              )}

              {/* TOTAL row — becomes TOTAL TTC for finale invoices */}
              <tr style={{ backgroundColor: accent }}>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#ffffff', fontSize: '13px' }}
                  dir={isArabic ? 'rtl' : undefined}
                >
                  {isProforma
                    ? (isArabic ? 'المجموع' : 'TOTAL')
                    : (isArabic ? 'المجموع الشامل' : 'TOTAL TTC')}
                </td>
                <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>
                  {fmt(hasBreakdown && !isProforma ? totalTTC : amount)} DA
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== PAYMENT + SIGNATURE SIDE BY SIDE ===== */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          {/* Payment */}
          <div
            style={{
              flex: 1,
              borderLeft: `3px solid ${accent}`,
              backgroundColor: '#fafbfc',
              borderRadius: '0 4px 4px 0',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
              dir={isArabic ? 'rtl' : undefined}
            >
              {isArabic ? 'الدفع' : 'Règlement'}
            </div>

            {data.paymentMethod && (
              <InfoRow label={isArabic ? 'طريقة الدفع' : 'Mode'} value={paymentLabel} isArabic={isArabic} />
            )}
            {info.bankName && (
              <InfoRow label={isArabic ? 'البنك' : 'Banque'} value={info.bankName} isArabic={isArabic} />
            )}
            {info.bankAccount && (
              <InfoRow label={isArabic ? 'الحساب' : 'Compte'} value={info.bankAccount} isArabic={isArabic} />
            )}

            <div style={{ fontSize: '10px', fontStyle: 'italic', marginTop: '8px', lineHeight: '1.5', color: '#4a5568' }}>
              Arrêté la présente facture {docType} à la somme de :{' '}
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{amountWords} Dinars Algériens</span>
            </div>
          </div>

          {/* Signature */}
          <div
            style={{
              width: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}
              dir={isArabic ? 'rtl' : undefined}
            >
              {isArabic ? 'الختم والتوقيع' : 'Cachet et Signature'}
            </div>
            <div
              style={{
                width: '100%',
                height: '80px',
                border: `2px dashed ${accent}40`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '6px',
              }}
            >
              <span style={{ fontSize: '8px', color: '#9ca3af' }}>
                {isArabic ? 'التوقيع هنا' : 'Signature ici'}
              </span>
            </div>
          </div>
        </div>

        {/* ===== CONDITIONS ===== */}
        {isProforma ? (
          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                backgroundColor: accentLight,
                border: `1px solid ${accent}30`,
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '11px',
                color: '#1a1a1a',
                lineHeight: '1.6',
              }}
            >
              <div style={{ marginBottom: '3px' }} dir={isArabic ? 'rtl' : undefined}>
                • {isArabic ? 'الدفع قبل إصدار التذكرة' : 'Paiement avant émission du billet'}
              </div>
              <div dir={isArabic ? 'rtl' : undefined}>
                • {isArabic ? 'صلاحية العرض' : "Validité de l'offre"}: <strong>{data.validityHours} {isArabic ? 'ساعة' : 'heures'}</strong>
              </div>
            </div>
            {/* Warning banner */}
            <div
              style={{
                marginTop: '8px',
                backgroundColor: '#FFF8DC',
                border: '1px solid #FFC832',
                borderRadius: '4px',
                padding: '6px 14px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: '#92400e',
              }}
            >
              <span dir={isArabic ? 'rtl' : undefined}>
                ⚠ {isArabic
                  ? 'هذه فاتورة مبدئية، غير صالحة للمحاسبة'
                  : 'Ceci est une facture proforma, non valable pour la comptabilité'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#4a5568', marginBottom: '10px', textAlign: 'center' }}
            dir={isArabic ? 'rtl' : undefined}
          >
            {isArabic ? 'تذكرة صادرة وغير قابلة للاسترداد' : 'Billet émis et non remboursable'}
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div style={{ flex: 1 }} />

        {/* ===== FOOTER SEPARATOR ===== */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`, marginBottom: '10px' }} />

        {/* ===== ARABIC FOOTER ===== */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }} dir="rtl">
          <div style={{ fontSize: '12px', fontWeight: 700, color: accent, marginBottom: '3px' }}>
            {info.arabicName}
          </div>
          <div style={{ fontSize: '9px', color: '#4a5568', marginBottom: '2px' }}>
            {info.arabicAddress}
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '2px' }}>
            {info.rc && `رقم السجل التجاري: ${info.rc}`}
            {info.nif && `  ·  رقم التعريف الجبائي: ${info.nif}`}
            {info.articleFiscal && `  ·  رقم المادة الجبائية: ${info.articleFiscal}`}
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '2px' }}>
            {info.nis && `رقم التعريف الإحصائي: ${info.nis}`}
            {info.licenseNumber && `  ·  رقم رخصة الوكالة: ${info.licenseNumber}`}
          </div>
          <div style={{ fontSize: '8px', color: '#6b7280' }}>
            {info.mobilePhone && `الجوال: ${info.mobilePhone}`}
            {info.phone && `  ·  المكتب: ${info.phone}`}
          </div>
        </div>

        {/* ===== GENERATION TIMESTAMP ===== */}
        <div style={{ textAlign: 'right', fontSize: '8px', color: '#b0b0b0', marginTop: '6px' }}
          dir={isArabic ? 'rtl' : undefined}
        >
          {isArabic ? 'تم الإنشاء في' : 'Généré le'} {timestamp}
        </div>
      </div>
    );
  }
);

/** Small helper for label:value rows */
function InfoRow({ label, value, isArabic }: { label: string; value: string; isArabic: boolean }) {
  return (
    <div style={{ fontSize: '11px', marginBottom: '4px', display: 'flex', gap: '6px' }}
      dir={isArabic ? 'rtl' : undefined}
    >
      <span style={{ color: '#6b7280', minWidth: '70px' }}>{label}:</span>
      <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
    </div>
  );
}

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
