import { User, Service, Supplier, Command, Document, Payment } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@agence.dz',
    firstName: 'Ahmed',
    lastName: 'Benali',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '2',
    email: 'sarah@agence.dz',
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
];

// Mock Commands
export const mockCommands: Command[] = [
  {
    id: '1',
    serviceId: '1',
    data: {
      type: 'visa',
      firstName: 'Youcef',
      lastName: 'Hamdi',
      phone: '+213 555 111 222',
      supplierId: '1',
      state: 'En traitement',
      price: 25000,
    },
    status: 'en_cours',
    paymentStatus: 'partiel',
    paidAmount: 15000,
    createdBy: '2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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
      price: 45000,
    },
    status: 'termine',
    paymentStatus: 'paye',
    paidAmount: 45000,
    createdBy: '3',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    serviceId: '4',
    data: {
      type: 'ticket',
      clientFullName: 'Omar Taleb',
      phone: '+213 555 555 666',
      destination: 'Paris CDG',
      departureDate: '2025-02-15',
      returnDate: '2025-02-28',
      price: 85000,
    },
    status: 'en_attente',
    paymentStatus: 'non_paye',
    paidAmount: 0,
    createdBy: '2',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '4',
    serviceId: '2',
    data: {
      type: 'visa',
      firstName: 'Leila',
      lastName: 'Mansouri',
      phone: '+213 555 777 888',
      supplierId: '2',
      state: 'Approuvé',
      price: 35000,
    },
    status: 'termine',
    paymentStatus: 'paye',
    paidAmount: 35000,
    createdBy: '3',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 72 hours ago
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
      price: 15000,
    },
    status: 'en_cours',
    paymentStatus: 'paye',
    paidAmount: 15000,
    createdBy: '2',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
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

// Get payment status label in French
export const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    non_paye: 'Non payé',
    partiel: 'Partiel',
    paye: 'Payé',
  };
  return labels[status] || status;
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
