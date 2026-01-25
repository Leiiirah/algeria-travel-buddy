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
export type PaymentStatus = 'non_paye' | 'partiel' | 'paye';

export interface VisaCommand {
  type: 'visa';
  firstName: string;
  lastName: string;
  phone: string;
  supplierId: string;
  state: string;
  price: number;
}

export interface ResidenceCommand {
  type: 'residence';
  hotelName: string;
  clientFullName: string;
  phone: string;
  price: number;
  attachmentUrl?: string;
}

export interface TicketCommand {
  type: 'ticket';
  clientFullName: string;
  phone: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
}

export interface DossierCommand {
  type: 'dossier';
  clientFullName: string;
  phone: string;
  description: string;
  price: number;
}

export type CommandData = VisaCommand | ResidenceCommand | TicketCommand | DossierCommand;

export interface Command {
  id: string;
  serviceId: string;
  data: CommandData;
  status: CommandStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

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
