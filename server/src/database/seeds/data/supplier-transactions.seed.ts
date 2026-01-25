import { TransactionType } from '../../../supplier-transactions/entities/supplier-transaction.entity';

export const supplierTransactionsSeedData = [
  {
    supplierIndex: 0, // VFS Global
    type: TransactionType.SORTIE,
    amount: 65000,
    note: 'Paiement frais visa Schengen - Ahmed Benali',
    daysAgo: 5,
  },
  {
    supplierIndex: 1, // TLS Contact
    type: TransactionType.SORTIE,
    amount: 95000,
    note: 'Paiement frais visa USA - Nadia Hamidi',
    daysAgo: 10,
  },
  {
    supplierIndex: 2, // Booking Partner
    type: TransactionType.SORTIE,
    amount: 35000,
    note: 'Paiement réservation Hilton Istanbul',
    daysAgo: 7,
  },
  {
    supplierIndex: 3, // Air Algérie
    type: TransactionType.ENTREE,
    amount: 5000,
    note: 'Remboursement partiel annulation vol',
    daysAgo: 3,
  },
  {
    supplierIndex: 4, // Turkish Airlines
    type: TransactionType.SORTIE,
    amount: 32000,
    note: 'Paiement billet Omar Boudiaf',
    daysAgo: 2,
  },
];
