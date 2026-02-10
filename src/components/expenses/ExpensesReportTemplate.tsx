import React, { forwardRef } from 'react';
import logoSrc from '@/assets/logo-elhikma.png';
import { AGENCY_INFO } from '@/constants/agency';

interface ExpenseItem {
  date: string;
  category: string;
  description: string;
  vendor: string;
  paymentMethod: string;
  amount: number;
}

export interface ExpensesPdfData {
  expenses: ExpenseItem[];
  stats: {
    totalThisMonth: number;
    totalThisYear: number;
    totalAll: number;
  };
  language: 'fr' | 'ar';
  filterTotal: number;
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR');
}

function InfoRow({ label, value, isArabic }: { label: string; value: string; isArabic: boolean }) {
  return (
    <div style={{ fontSize: '11px', marginBottom: '4px', display: 'flex', gap: '6px' }} dir={isArabic ? 'rtl' : undefined}>
      <span style={{ color: '#6b7280', minWidth: '70px' }}>{label}:</span>
      <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
    </div>
  );
}

const ACCENT = '#1B4332';
const ACCENT_LIGHT = '#e6f0eb';

const CATEGORY_LABELS: Record<string, { fr: string; ar: string }> = {
  fournitures: { fr: 'Fournitures', ar: 'لوازم' },
  equipement: { fr: 'Équipement', ar: 'معدات' },
  factures: { fr: 'Factures', ar: 'فواتير' },
  transport: { fr: 'Transport', ar: 'نقل' },
  maintenance: { fr: 'Maintenance', ar: 'صيانة' },
  marketing: { fr: 'Marketing', ar: 'تسويق' },
  autre: { fr: 'Autre', ar: 'أخرى' },
};

const PAYMENT_LABELS: Record<string, { fr: string; ar: string }> = {
  especes: { fr: 'Espèces', ar: 'نقدي' },
  virement: { fr: 'Virement', ar: 'تحويل بنكي' },
  cheque: { fr: 'Chèque', ar: 'شيك' },
  carte: { fr: 'Carte bancaire', ar: 'بطاقة بنكية' },
};

interface Props {
  data: ExpensesPdfData;
}

const ExpensesReportTemplate = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const isArabic = data.language === 'ar';
  const lang = isArabic ? 'ar' : 'fr';
  const info = AGENCY_INFO;
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
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT, letterSpacing: '0.5px' }}>
            {info.legalName}
          </div>
          <div style={{ fontSize: '10px', color: '#4a5568', marginTop: '4px', lineHeight: '1.5' }}>
            {info.address}
          </div>
          <div style={{ fontSize: '10px', color: '#4a5568', lineHeight: '1.5' }}>
            Tél: {info.phone}{info.mobilePhone ? ` / ${info.mobilePhone}` : ''}
          </div>
        </div>

        <div style={{ width: '120px', textAlign: 'center', padding: '0 16px' }}>
          <img src={logoSrc} alt="Logo" style={{ width: '100px', height: 'auto' }} crossOrigin="anonymous" />
        </div>

        <div style={{ flex: 1, textAlign: 'right' }} dir="rtl">
          <div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}>
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

      {/* Legal identifiers */}
      <div style={{ textAlign: 'center', fontSize: '9px', color: '#6b7280', marginBottom: '4px', letterSpacing: '0.3px' }}>
        RC: {info.rc} &nbsp;|&nbsp; NIF: {info.nif} &nbsp;|&nbsp; NIS: {info.nis}
        {info.articleFiscal && <> &nbsp;|&nbsp; Art. Fiscal: {info.articleFiscal}</>}
      </div>

      {/* Separator */}
      <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`, marginBottom: '12px' }} />

      {/* ===== TITLE BANNER ===== */}
      <div
        style={{
          backgroundColor: ACCENT,
          borderRadius: '4px',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '1px' }}>
          {isArabic ? 'تقرير المصروفات' : 'RAPPORT DES DÉPENSES'}
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
          {isArabic ? 'التاريخ' : 'Date'}: {new Date().toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR')}
        </span>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: isArabic ? 'هذا الشهر' : 'Ce Mois', value: data.stats.totalThisMonth },
          { label: isArabic ? 'هذا العام' : 'Cette Année', value: data.stats.totalThisYear },
          { label: isArabic ? 'الإجمالي الكلي' : 'Total Global', value: data.stats.totalAll },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: ACCENT_LIGHT,
              borderLeft: `3px solid ${ACCENT}`,
              borderRadius: '0 4px 4px 0',
              padding: '10px 14px',
              textAlign: isArabic ? 'right' : 'left',
            }}
            dir={isArabic ? 'rtl' : undefined}
          >
            <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: ACCENT }}>
              {fmt(card.value)} DA
            </div>
          </div>
        ))}
      </div>

      {/* ===== EXPENSES TABLE ===== */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: ACCENT }}>
            {[
              isArabic ? 'التاريخ' : 'Date',
              isArabic ? 'الفئة' : 'Catégorie',
              isArabic ? 'الوصف' : 'Description',
              isArabic ? 'المورد' : 'Fournisseur',
              isArabic ? 'طريقة الدفع' : 'Mode',
              isArabic ? 'المبلغ (د.ج)' : 'Montant (DZD)',
            ].map((h, i) => (
              <th
                key={i}
                style={{
                  padding: '8px 10px',
                  color: '#ffffff',
                  fontWeight: 600,
                  textAlign: i === 5 ? 'right' : 'left',
                  fontSize: '10px',
                  letterSpacing: '0.3px',
                }}
                dir={isArabic ? 'rtl' : undefined}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.expenses.map((exp, idx) => {
            const catLabel = CATEGORY_LABELS[exp.category]?.[lang] || exp.category;
            const payLabel = PAYMENT_LABELS[exp.paymentMethod]?.[lang] || exp.paymentMethod;
            return (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8faf9',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <td style={{ padding: '7px 10px' }}>{exp.date}</td>
                <td style={{ padding: '7px 10px' }} dir={isArabic ? 'rtl' : undefined}>{catLabel}</td>
                <td style={{ padding: '7px 10px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {exp.description}
                </td>
                <td style={{ padding: '7px 10px' }}>{exp.vendor || '-'}</td>
                <td style={{ padding: '7px 10px' }} dir={isArabic ? 'rtl' : undefined}>{payLabel}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 500 }}>{fmt(exp.amount)} DA</td>
              </tr>
            );
          })}
          {/* Total row */}
          <tr style={{ backgroundColor: ACCENT }}>
            <td
              colSpan={5}
              style={{ padding: '9px 10px', fontWeight: 700, color: '#ffffff', fontSize: '12px' }}
              dir={isArabic ? 'rtl' : undefined}
            >
              {isArabic ? 'إجمالي المصروفات المعروضة' : 'Total des dépenses affichées'}
            </td>
            <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#ffffff', fontSize: '12px' }}>
              {fmt(data.filterTotal)} DA
            </td>
          </tr>
        </tbody>
      </table>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* ===== FOOTER SEPARATOR ===== */}
      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)`, marginBottom: '10px' }} />

      {/* ===== ARABIC FOOTER ===== */}
      <div style={{ textAlign: 'center', marginBottom: '4px' }} dir="rtl">
        <div style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, marginBottom: '3px' }}>
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

      {/* ===== TIMESTAMP ===== */}
      <div style={{ textAlign: 'right', fontSize: '8px', color: '#b0b0b0', marginTop: '6px' }}
        dir={isArabic ? 'rtl' : undefined}
      >
        {isArabic ? 'تم الإنشاء في' : 'Généré le'} {timestamp}
      </div>
    </div>
  );
});

ExpensesReportTemplate.displayName = 'ExpensesReportTemplate';

export default ExpensesReportTemplate;
