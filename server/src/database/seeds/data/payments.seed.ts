import { PaymentMethod } from '../../../payments/entities/payment.entity';

// Payments matching command amountPaid values
export const paymentsSeedData = [
  {
    commandIndex: 0, // Ahmed Benali - Visa
    amount: 50000,
    method: PaymentMethod.ESPECES,
    notes: 'Premier versement visa Schengen',
  },
  {
    commandIndex: 1, // Nadia Hamidi - Visa USA (full payment)
    amount: 120000,
    method: PaymentMethod.VIREMENT,
    notes: 'Paiement intégral visa USA',
  },
  {
    commandIndex: 2, // Youcef Mansouri - Hotel
    amount: 45000,
    method: PaymentMethod.CARTE,
    notes: 'Paiement complet réservation hôtel',
  },
  {
    commandIndex: 3, // Amina Slimani - Ticket (partial)
    amount: 25000,
    method: PaymentMethod.ESPECES,
    notes: 'Acompte billet d\'avion',
  },
  {
    commandIndex: 4, // Omar Boudiaf - Ticket
    amount: 42000,
    method: PaymentMethod.CHEQUE,
    notes: 'Paiement complet billet Turkish Airlines',
  },
  {
    commandIndex: 5, // Leila Cherif - Dossier
    amount: 15000,
    method: PaymentMethod.ESPECES,
    notes: 'Traitement dossier légalisation',
  },
];
