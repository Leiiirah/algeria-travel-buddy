// Agency information for official documents (used as fallback when API is unavailable)
export const AGENCY_INFO = {
  name: 'Demo Travel Agency',
  legalName: 'DEMO TRAVEL AGENCY SARL',
  address: '12 Rue des Voyageurs, Alger Centre, Alger',
  phone: '+213 21 00 00 00',
  email: 'contact@demo-travel.dz',
  rc: '16/00-1234567 B 24',
  nif: '000016123456789',
  nis: '000016987654321',
  bankName: 'Banque Nationale d\'Algérie',
  bankAccount: '00400 0123456789 12',
  mobilePhone: '+213 555 00 00 00',
  licenseNumber: 'AG-DZ-2024-001',
  articleFiscal: '16001234567',
  arabicName: 'وكالة ديمو للسياحة و الأسفار',
  arabicAddress: '12 شارع المسافرين، الجزائر الوسطى، الجزائر',
};

// Travel class options
export const TRAVEL_CLASSES = [
  { value: 'economique', labelFr: 'Économique', labelAr: 'اقتصادية' },
  { value: 'affaires', labelFr: 'Affaires', labelAr: 'رجال أعمال' },
  { value: 'premiere', labelFr: 'Première', labelAr: 'الدرجة الأولى' },
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'especes', labelFr: 'Espèces', labelAr: 'نقدي' },
  { value: 'virement', labelFr: 'Virement', labelAr: 'تحويل bancaire' },
  { value: 'cheque', labelFr: 'Chèque', labelAr: 'شيك' },
  { value: 'carte', labelFr: 'Carte bancaire', labelAr: 'بطاقة بنكية' },
];
