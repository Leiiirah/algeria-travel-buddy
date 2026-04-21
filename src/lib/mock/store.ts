// In-memory mock store. All collections are module-level singletons.
// Reset on full page reload (no localStorage persistence).

import type {
  User,
  Service,
  ServiceTypeEntity,
  Supplier,
  Command,
  Payment,
  SupplierTransaction,
  DocumentNode,
  OmraHotel,
  OmraOrder,
  OmraVisa,
  OmraProgram,
  EmployeeTransaction,
  Expense,
  SupplierOrder,
  SupplierReceipt,
  SupplierInvoice,
  InternalTask,
  ClientInvoice,
  CaisseSettlement,
  Company,
  PaymentType,
} from '@/types';

export interface MockStore {
  users: User[];
  serviceTypes: ServiceTypeEntity[];
  services: Service[];
  suppliers: Supplier[];
  commands: Command[];
  payments: Payment[];
  supplierTransactions: SupplierTransaction[];
  documents: DocumentNode[];
  omraHotels: OmraHotel[];
  omraOrders: OmraOrder[];
  omraVisas: OmraVisa[];
  omraPrograms: OmraProgram[];
  employeeTransactions: EmployeeTransaction[];
  expenses: Expense[];
  supplierOrders: SupplierOrder[];
  supplierReceipts: SupplierReceipt[];
  supplierInvoices: SupplierInvoice[];
  internalTasks: InternalTask[];
  clientInvoices: ClientInvoice[];
  caisseSettlements: CaisseSettlement[];
  companies: Company[];
  paymentTypes: PaymentType[];
  agencySettings: Record<string, string>;
  // Auth state
  currentUserId: string | null;
}

export const store: MockStore = {
  users: [],
  serviceTypes: [],
  services: [],
  suppliers: [],
  commands: [],
  payments: [],
  supplierTransactions: [],
  documents: [],
  omraHotels: [],
  omraOrders: [],
  omraVisas: [],
  omraPrograms: [],
  employeeTransactions: [],
  expenses: [],
  supplierOrders: [],
  supplierReceipts: [],
  supplierInvoices: [],
  internalTasks: [],
  clientInvoices: [],
  caisseSettlements: [],
  companies: [],
  paymentTypes: [],
  agencySettings: {},
  currentUserId: null,
};

let seeded = false;
export function markSeeded() {
  seeded = true;
}
export function isSeeded() {
  return seeded;
}
