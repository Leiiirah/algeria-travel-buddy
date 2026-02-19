import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Command, SupplierTransactionType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format currency
export const formatDZD = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' DZD';
};

// Utility function to check if command is editable (within 30 minutes)
export const isCommandEditable = (command: Command, currentUserId: string): boolean => {
  if (command.createdBy !== currentUserId) return false;
  const createdAt = typeof command.createdAt === 'string'
    ? new Date(command.createdAt)
    : command.createdAt;
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation <= 0.5;
};

// Get service type label in French
export const getServiceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    visa: 'Visa',
    residence: 'Résidence',
    ticket: 'Billetterie',
    dossier: 'Dossier',
  };
  return labels[type] || type;
};

// Get command status label in French
export const getCommandStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    en_attente: 'En attente',
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé',
  };
  return labels[status] || status;
};

// Get payment status label in French - derived from amounts
export const getPaymentStatusFromAmounts = (sellingPrice: number, amountPaid: number): { status: string; label: string } => {
  if (amountPaid >= sellingPrice) {
    return { status: 'paye', label: 'Payé' };
  } else if (amountPaid > 0) {
    return { status: 'partiel', label: 'Partiel' };
  }
  return { status: 'non_paye', label: 'Non payé' };
};

// Get payment method label in French
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    especes: 'Espèces',
    virement: 'Virement',
    cheque: 'Chèque',
    carte: 'Carte bancaire',
  };
  return labels[method] || method;
};


// Get transaction type label in French
export const getTransactionTypeLabel = (type: SupplierTransactionType): string => {
  return type === 'sortie' ? 'Paiement envoyé' : 'Remboursement reçu';
};

