// Agency information for official documents (used as fallback when API is unavailable)
export const AGENCY_INFO = {
  name: 'Al Hikma Voyages',
  legalName: 'EL HIKMA TOURISME ET VOYAGE',
  address: '02 rue de kolea zaban blida .09001',
  phone: '025 17 29 68',
  email: 'elhikmatours@gmail.com',
  rc: '12ب0807686-09/00',
  nif: '001209080768687',
  nis: '001209010019858',
  bankName: 'ccp',
  bankAccount: '00799999001499040728',
  mobilePhone: '0540 40 00 80',
  licenseNumber: '1500',
  articleFiscal: '00120908076',
  arabicName: 'الحكمة لسياحة و الأسفار',
  arabicAddress: '02، طريق القليعة، زعبانة، 09001، البليدة، الجزائر',
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