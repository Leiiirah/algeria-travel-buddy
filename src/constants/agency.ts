// Agency information for official documents (used as fallback when API is unavailable)
// TODO: Update these values with the new agency's information
export const AGENCY_INFO = {
  name: 'Nouvelle Agence',
  legalName: 'NOUVELLE AGENCE TOURISME ET VOYAGE',
  address: 'Adresse de l\'agence',
  phone: '000 00 00 00',
  email: 'contact@nouvelleagence.com',
  rc: '',
  nif: '',
  nis: '',
  bankName: '',
  bankAccount: '',
  mobilePhone: '',
  licenseNumber: '',
  articleFiscal: '',
  arabicName: 'الوكالة الجديدة للسياحة و الاسفار',
  arabicAddress: 'عنوان الوكالة',
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
  { value: 'virement', labelFr: 'Virement', labelAr: 'تحويل بنكي' },
  { value: 'cheque', labelFr: 'Chèque', labelAr: 'شيك' },
  { value: 'carte', labelFr: 'Carte bancaire', labelAr: 'بطاقة بنكية' },
];
