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

// Service Type Entity (dynamic from database)
export interface ServiceTypeEntity {
  id: string;
  code: string;
  nameFr: string;
  nameAr: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Service Types - now dynamic string (references ServiceTypeEntity.code)
export type ServiceType = string;

export interface Service {
  id: string;
  name: string;
  type: string; // Dynamic reference to ServiceTypeEntity.code
  description: string;
  isActive: boolean;
  defaultSupplierId?: string;
  defaultBuyingPrice?: number;
  createdAt: Date;
}

// Supplier Types
export type SupplierType = 'airline' | 'hotel' | 'visa' | 'transport' | 'insurance' | 'other';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  contact?: string;
  currency: string;
  bankAccount?: string;
  isActive: boolean;
  createdAt: Date;
}

// Command Types
export type CommandStatus = 'dossier_incomplet' | 'depose' | 'en_traitement' | 'accepte' | 'refuse' | 'visa_delivre' | 'retire';

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
  company: string; // Transport company name (e.g., "Air Algérie", "Algérie Ferries")
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
  passportUrl?: string;          // Scanned passport file for visa commands
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
  receiptUrl?: string;
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

// ==================== OMRA TYPES ====================

export type OmraRoomType = 'chambre_1' | 'chambre_2' | 'chambre_3' | 'chambre_4' | 'chambre_5' | 'suite';
export type OmraStatus = 'en_attente' | 'confirme' | 'termine' | 'annule';

export interface OmraHotel {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OmraOrder {
  id: string;
  clientName: string;
  phone: string;
  orderDate: Date;
  periodFrom: Date;
  periodTo: Date;
  hotelId: string;
  hotel?: OmraHotel;
  roomType: OmraRoomType;
  status: OmraStatus;
  sellingPrice: number;
  amountPaid: number;
  buyingPrice: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OmraVisa {
  id: string;
  clientName: string;
  phone: string;
  visaDate: Date;
  entryDate: Date;
  hotelId: string;
  hotel?: OmraHotel;
  status: OmraStatus;
  sellingPrice: number;
  amountPaid: number;
  buyingPrice: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const omraRoomTypeLabels: Record<OmraRoomType, string> = {
  chambre_1: 'Chambre 1 personne',
  chambre_2: 'Chambre 2 personnes',
  chambre_3: 'Chambre 3 personnes',
  chambre_4: 'Chambre 4 personnes',
  chambre_5: 'Chambre 5 personnes',
  suite: 'Suite',
};

export const omraStatusLabels: Record<OmraStatus, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  termine: 'Terminé',
  annule: 'Annulé',
};

// ==================== EMPLOYEE TRANSACTIONS TYPES ====================

export type EmployeeTransactionType = 'avance' | 'credit' | 'salaire';

export interface EmployeeTransaction {
  id: string;
  employeeId: string;
  employee?: User;
  type: EmployeeTransactionType;
  amount: number;
  date: Date;
  month?: string;
  note?: string;
  recordedBy: string;
  recorder?: User;
  createdAt: Date;
}

export interface EmployeeBalance {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalAvances: number;
  totalCredits: number;
  totalSalaires: number;
  balance: number;
}

export const employeeTransactionTypeLabels: Record<EmployeeTransactionType, string> = {
  avance: 'Avance',
  credit: 'Crédit',
  salaire: 'Salaire',
};

// ==================== EXPENSES TYPES ====================

export type ExpenseCategory = 'fournitures' | 'equipement' | 'factures' | 'transport' | 'maintenance' | 'marketing' | 'autre';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  note?: string;
  recordedBy: string;
  recorder?: User;
  createdAt: Date;
}

export interface ExpenseStats {
  totalThisMonth: number;
  totalThisYear: number;
  totalAll: number;
  byCategory: { category: string; total: number; count: number }[];
}

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  fournitures: 'Fournitures',
  equipement: 'Équipement',
  factures: 'Factures',
  transport: 'Transport',
  maintenance: 'Maintenance',
  marketing: 'Marketing',
  autre: 'Autre',
};

// ==================== SUPPLIER ORDERS/RECEIPTS/INVOICES TYPES ====================

export type SupplierOrderStatus = 'en_attente' | 'livre' | 'partiel' | 'annule';
export type SupplierInvoiceStatus = 'non_paye' | 'partiel' | 'paye';

export interface SupplierOrder {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  orderNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderDate: Date;
  status: SupplierOrderStatus;
  deliveredQuantity: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierReceipt {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  orderId?: string;
  order?: SupplierOrder;
  receiptNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  receiptDate: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface SupplierInvoice {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  invoiceNumber: string;
  internalRef: string;
  description: string;
  amount: number;
  invoiceDate: Date;
  dueDate?: Date;
  status: SupplierInvoiceStatus;
  paidAmount: number;
  fileUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const supplierOrderStatusLabels: Record<SupplierOrderStatus, string> = {
  en_attente: 'En attente',
  livre: 'Livré',
  partiel: 'Partiel',
  annule: 'Annulé',
};

export const supplierInvoiceStatusLabels: Record<SupplierInvoiceStatus, string> = {
  non_paye: 'Non payé',
  partiel: 'Partiellement payé',
  paye: 'Payé',
};

// ==================== INTERNAL TASKS TYPES ====================

export type TaskPriority = 'urgent' | 'normal' | 'critical';
export type TaskStatus = 'in_progress' | 'completed';
export type TaskVisibility = 'clear' | 'unreadable';

export interface InternalTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  visibility: TaskVisibility;
  assignedTo: string;
  assignee?: User;
  createdBy: string;
  creator?: User;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  byEmployee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    inProgress: number;
    completed: number;
  }[];
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  normal: 'Normal',
  critical: 'Critique',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  in_progress: 'En cours',
  completed: 'Terminé',
};

export const taskVisibilityLabels: Record<TaskVisibility, string> = {
  clear: 'Clair',
  unreadable: 'Illisible',
};
