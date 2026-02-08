// Agency information for official documents (used as fallback when API is unavailable)
export const AGENCY_INFO = {
  name: 'Al Hikma Voyages',
  legalName: 'EL HIKMA TOURISME ET VOYAGE',
  address: '02 rue de kolea zaban blida .09001',
  phone: '020475949',
  email: 'elhikmatours@gmail.com',
  rc: '09/00-0807686B12',
  nif: '001209080768687',
  nis: '001209010018958',
  bankName: 'ccp',
  bankAccount: '00799999001499040728',
  mobilePhone: '0770236424',
  licenseNumber: '',
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