// User & Auth Types
export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  isActive: boolean;
}

// Service Types
export type ServiceType = 'visa' | 'residence' | 'ticket' | 'dossier';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description: string;
  isActive: boolean;
  defaultSupplierId?: string;
  defaultBuyingPrice?: number;
  createdAt: Date;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  serviceTypes: ServiceType[];
  isActive: boolean;
  createdAt: Date;
}

// Command Types
export type CommandStatus = 'en_attente' | 'en_cours' | 'termine' | 'annule';

export interface BaseCommandData {
  clientFullName: string;
  phone: string;
}

export interface VisaCommand extends BaseCommandData {
  type: 'visa';
  firstName: string;
  lastName: string;
}

export interface ResidenceCommand extends BaseCommandData {
  type: 'residence';
  hotelName: string;
  attachmentUrl?: string;
}

export interface TicketCommand extends BaseCommandData {
  type: 'ticket';
  departureDate: string;
  returnDate?: string;
}

export interface DossierCommand extends BaseCommandData {
  type: 'dossier';
  description: string;
}

export type CommandData = VisaCommand | ResidenceCommand | TicketCommand | DossierCommand;

export interface Command {
  id: string;
  serviceId: string;
  data: CommandData;
  status: CommandStatus;
  // New accounting fields
  destination: string;           // Ex: "ALG-IST-ALG"
  sellingPrice: number;          // Prix de vente (ce que paie le client)
  amountPaid: number;            // Versement (montant déjà payé)
  buyingPrice: number;           // Prix d'achat (coût fournisseur)
  supplierId: string;            // Fournisseur lié
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Calculated fields (computed at runtime, not stored)
export const calculateRemainingBalance = (sellingPrice: number, amountPaid: number): number => {
  return sellingPrice - amountPaid;
};

export const calculateNetProfit = (sellingPrice: number, buyingPrice: number): number => {
  return sellingPrice - buyingPrice;
};

// Document Types
export type DocumentCategory = 'assurance' | 'cnas' | 'casnos' | 'autre';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export type PaymentMethod = 'especes' | 'virement' | 'cheque' | 'carte';

export interface Payment {
  id: string;
  commandId: string;
  amount: number;
  method: PaymentMethod;
  recordedBy: string;
  createdAt: Date;
  notes?: string;
}

// Supplier Transaction Types
export type SupplierTransactionType = 'sortie' | 'entree';

export interface SupplierTransaction {
  id: string;
  date: Date;
  supplierId: string;
  type: SupplierTransactionType;
  amount: number;
  note: string;
  recordedBy: string;
  createdAt: Date;
}

// Analytics Types
export interface DailyStats {
  date: string;
  revenue: number;
  commandsCount: number;
}

export interface ServiceStats {
  serviceType: ServiceType;
  count: number;
  revenue: number;
}
