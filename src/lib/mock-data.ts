import { User, Service, Supplier, Command, Document, Payment, SupplierTransaction, SupplierTransactionType } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@elhikma.dz',
    firstName: 'Ahmed',
    lastName: 'Benali',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '2',
    email: 'sarah@elhikma.dz',
    firstName: 'Sarah',
    lastName: 'Meziane',
    role: 'employee',
    createdAt: new Date('2024-02-15'),
    isActive: true,
  },
  {
    id: '3',
    email: 'karim@agence.dz',
    firstName: 'Karim',
    lastName: 'Hadj',
    role: 'employee',
    createdAt: new Date('2024-03-10'),
    isActive: true,
  },
  {
    id: '4',
    email: 'nadia@agence.dz',
    firstName: 'Nadia',
    lastName: 'Amrani',
    role: 'employee',
    createdAt: new Date('2024-04-20'),
    isActive: false,
  },
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Visa Schengen',
    type: 'visa',
    description: 'Traitement des demandes de visa Schengen',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Visa USA',
    type: 'visa',
    description: 'Traitement des demandes de visa américain',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Réservation Hôtel',
    type: 'residence',
    description: 'Réservation d\'hôtels et hébergements',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Billets d\'avion',
    type: 'ticket',
    description: 'Achat de billets d\'avion',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Traitement Dossier',
    type: 'dossier',
    description: 'Traitement de dossiers administratifs',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'VFS Global',
    contact: 'Mohamed Kaci',
    phone: '+213 555 123 456',
    email: 'contact@vfsglobal.dz',
    serviceTypes: ['visa'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'TLS Contact',
    contact: 'Fatima Zeroual',
    phone: '+213 555 789 012',
    email: 'contact@tlscontact.dz',
    serviceTypes: ['visa'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Booking Partner',
    contact: 'Rachid Benmoussa',
    phone: '+213 555 345 678',
    email: 'partner@booking.dz',
    serviceTypes: ['residence'],
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Air Algérie',
    contact: 'Samia Lounis',
    phone: '+213 555 901 234',
    email: 'reservations@airalgerie.dz',
    serviceTypes: ['ticket'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    name: 'Turkish Airlines',
    contact: 'Ali Yilmaz',
    phone: '+213 555 567 890',
    email: 'reservations@turkishairlines.dz',
    serviceTypes: ['ticket'],
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
];

// Mock Commands with new accounting fields
export const mockCommands: Command[] = [
  {
    id: '1',
    serviceId: '1',
    data: {
      type: 'visa',
      firstName: 'Youcef',
      lastName: 'Hamdi',
      clientFullName: 'Youcef Hamdi',
      phone: '+213 555 111 222',
    },
    status: 'en_cours',
    destination: 'France',
    sellingPrice: 25000,
    amountPaid: 15000,
    buyingPrice: 18000,
    supplierId: '1',
    createdBy: '2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    serviceId: '3',
    data: {
      type: 'residence',
      hotelName: 'Sofitel Alger',
      clientFullName: 'Amina Cherif',
      phone: '+213 555 333 444',
    },
    status: 'termine',
    destination: 'Istanbul',
    sellingPrice: 45000,
    amountPaid: 45000,
    buyingPrice: 35000,
    supplierId: '3',
    createdBy: '3',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    serviceId: '4',
    data: {
      type: 'ticket',
      clientFullName: 'Omar Taleb',
      phone: '+213 555 555 666',
      departureDate: '2025-02-15',
      returnDate: '2025-02-28',
    },
    status: 'en_attente',
    destination: 'ALG-PAR-ALG',
    sellingPrice: 85000,
    amountPaid: 25000,
    buyingPrice: 70000,
    supplierId: '4',
    createdBy: '2',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '4',
    serviceId: '2',
    data: {
      type: 'visa',
      firstName: 'Leila',
      lastName: 'Mansouri',
      clientFullName: 'Leila Mansouri',
      phone: '+213 555 777 888',
    },
    status: 'termine',
    destination: 'USA',
    sellingPrice: 35000,
    amountPaid: 35000,
    buyingPrice: 28000,
    supplierId: '2',
    createdBy: '3',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '5',
    serviceId: '5',
    data: {
      type: 'dossier',
      clientFullName: 'Mourad Bensalah',
      phone: '+213 555 999 000',
      description: 'Légalisation de documents pour études à l\'étranger',
    },
    status: 'en_cours',
    destination: '-',
    sellingPrice: 15000,
    amountPaid: 15000,
    buyingPrice: 8000,
    supplierId: '1',
    createdBy: '2',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '6',
    serviceId: '4',
    data: {
      type: 'ticket',
      clientFullName: 'Karim Boudiaf',
      phone: '+213 555 222 333',
      departureDate: '2025-03-01',
      returnDate: '2025-03-15',
    },
    status: 'en_cours',
    destination: 'ALG-IST-ALG',
    sellingPrice: 65000,
    amountPaid: 30000,
    buyingPrice: 52000,
    supplierId: '5',
    createdBy: '2',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Attestation Assurance 2025',
    category: 'assurance',
    fileUrl: '/documents/assurance-2025.pdf',
    uploadedBy: '1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    name: 'Déclaration CNAS Q1 2025',
    category: 'cnas',
    fileUrl: '/documents/cnas-q1-2025.pdf',
    uploadedBy: '1',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: '3',
    name: 'Attestation CASNOS',
    category: 'casnos',
    fileUrl: '/documents/casnos-2025.pdf',
    uploadedBy: '1',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: '4',
    name: 'Contrat Location Bureau',
    category: 'autre',
    fileUrl: '/documents/contrat-bureau.pdf',
    uploadedBy: '1',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    commandId: '1',
    amount: 15000,
    method: 'especes',
    recordedBy: '2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    notes: 'Acompte initial',
  },
  {
    id: '2',
    commandId: '2',
    amount: 45000,
    method: 'virement',
    recordedBy: '3',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
  },
  {
    id: '3',
    commandId: '4',
    amount: 35000,
    method: 'cheque',
    recordedBy: '3',
    createdAt: new Date(Date.now() - 60 * 60 * 60 * 1000),
  },
  {
    id: '4',
    commandId: '5',
    amount: 15000,
    method: 'especes',
    recordedBy: '2',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// Mock Supplier Transactions
export const mockSupplierTransactions: SupplierTransaction[] = [
  {
    id: '1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    supplierId: '1', // VFS Global
    type: 'sortie',
    amount: 50000,
    note: 'Versement espèces - commandes visa',
    recordedBy: '1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    supplierId: '4', // Air Algérie
    type: 'sortie',
    amount: 20000,
    note: 'Virement bancaire - billets',
    recordedBy: '1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    supplierId: '3', // Booking Partner
    type: 'entree',
    amount: 5000,
    note: 'Remboursement annulation réservation',
    recordedBy: '2',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    supplierId: '5', // Turkish Airlines
    type: 'sortie',
    amount: 30000,
    note: 'Paiement partiel billets Istanbul',
    recordedBy: '1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Calculate supplier balance
export const calculateSupplierBalance = (
  supplierId: string,
  commands: Command[],
  transactions: SupplierTransaction[]
): { totalPurchased: number; totalPaid: number; remainingBalance: number } => {
  // Total Purchases = Sum of buyingPrice for this supplier
  const totalPurchased = commands
    .filter(cmd => cmd.supplierId === supplierId)
    .reduce((sum, cmd) => sum + cmd.buyingPrice, 0);

  // Total Paid = Sum of 'sortie' - Sum of 'entree'
  const totalPaid = transactions
    .filter(t => t.supplierId === supplierId)
    .reduce((sum, t) => {
      return t.type === 'sortie' ? sum + t.amount : sum - t.amount;
    }, 0);

  // Remaining Balance = Total Purchases - Total Paid
  const remainingBalance = totalPurchased - totalPaid;

  return { totalPurchased, totalPaid, remainingBalance };
};

// Utility function to format currency
export const formatDZD = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' DZD';
};

// Utility function to check if command is editable (within 24 hours)
export const isCommandEditable = (command: Command, currentUserId: string): boolean => {
  if (command.createdBy !== currentUserId) return false;
  const hoursSinceCreation = (Date.now() - command.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation <= 24;
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

// Get document category label in French
export const getDocumentCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    assurance: 'Assurance',
    cnas: 'CNAS',
    casnos: 'CASNOS',
    autre: 'Autre',
  };
  return labels[category] || category;
};

// Get supplier name by ID
export const getSupplierName = (supplierId: string): string => {
  const supplier = mockSuppliers.find(s => s.id === supplierId);
  return supplier?.name || '-';
};

// Get transaction type label in French
export const getTransactionTypeLabel = (type: SupplierTransactionType): string => {
  return type === 'sortie' ? 'Paiement envoyé' : 'Remboursement reçu';
};
