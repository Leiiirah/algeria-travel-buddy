// ============================================================================
// API surface for Demo Travel Agency
// ----------------------------------------------------------------------------
// This file preserves the EXACT public surface of the original API client
// (all DTOs, interfaces, methods, and return shapes) while routing all calls
// to an in-memory mock store. The 25+ React Query hooks and AuthContext keep
// working unchanged. Reset on full page reload (no persistence).
// ============================================================================

import {
  User, Service, Supplier, Command, Payment, SupplierTransaction, DocumentNode,
  OmraHotel, OmraOrder, OmraVisa, OmraProgram, OmraProgramInventory, OmraRoomType,
  OmraStatus, OmraOrderType, EmployeeTransaction, EmployeeBalance,
  EmployeeTransactionType, Expense, ExpenseStats, ExpenseCategory, PaymentMethod,
  SupplierOrder, SupplierOrderStatus, SupplierReceipt, SupplierInvoice,
  SupplierInvoiceStatus, ServiceTypeEntity, InternalTask, TaskStats, TaskPriority,
  TaskStatus, TaskVisibility, ClientInvoice, ClientInvoiceStats, ClientInvoiceType,
  ClientInvoiceStatus, CaisseSettlement, Company, PaymentType,
} from '@/types';
import { store } from './mock/store';
import { seed } from './mock/seed';
import { delay, uid, paginate } from './mock/helpers';

// Make sure seed is initialized at module load.
seed();

// =====================================================================
// DTOs (preserved verbatim from original)
// =====================================================================

export interface LoginDto { email: string; password: string; }
export interface LoginResponse { accessToken: string; refreshToken: string; user: User; }
export interface CreateUserDto { email: string; password: string; firstName: string; lastName: string; role: 'admin' | 'employee'; }
export interface UpdateUserDto { firstName?: string; lastName?: string; email?: string; password?: string; isActive?: boolean; }
export interface CreateServiceDto { name: string; type: string; description: string; defaultSupplierId?: string; defaultBuyingPrice?: number; }
export interface UpdateServiceDto { name?: string; type?: string; description?: string; isActive?: boolean; defaultSupplierId?: string; defaultBuyingPrice?: number; }
export interface CreateServiceTypeDto { code: string; nameFr: string; nameAr: string; icon?: string; }
export interface UpdateServiceTypeDto { code?: string; nameFr?: string; nameAr?: string; icon?: string; isActive?: boolean; }
export interface CreateSupplierDto { name: string; type?: string; country?: string; city?: string; phone?: string; email?: string; contact?: string; currency?: string; bankAccount?: string; }
export interface UpdateSupplierDto { name?: string; type?: string; country?: string; city?: string; phone?: string; email?: string; contact?: string; currency?: string; bankAccount?: string; isActive?: boolean; }
export interface CreateCommandDto { serviceId: string; supplierId: string; data: Record<string, unknown>; destination: string; sellingPrice: number; amountPaid: number; buyingPrice: number; assignedTo?: string; commandDate?: string; }
export interface UpdateCommandDto { data?: Record<string, unknown>; status?: 'dossier_incomplet' | 'depose' | 'en_traitement' | 'accepte' | 'refuse' | 'visa_delivre' | 'retire'; destination?: string; sellingPrice?: number; amountPaid?: number; buyingPrice?: number; assignedTo?: string; commandDate?: string; }
export interface CreatePaymentDto { commandId: string; amount: number; method: 'especes' | 'virement' | 'cheque' | 'carte'; notes?: string; }
export interface CreateSupplierTransactionDto { supplierId: string; date: string; type: 'sortie' | 'entree'; amount: number; note: string; file?: File; }
export interface UploadDocumentDto { name: string; parentId?: string; file: File; }
export interface CreateFolderDto { name: string; parentId?: string; }
export interface MoveNodeDto { parentId?: string | null; }
export interface DocumentAncestor { id: string; name: string; }
export interface SupplierBalance { totalPurchased: number; totalPaid: number; remainingBalance: number; }
export interface DashboardStats { totalRevenue: number; pendingAmount: number; todayCommands: number; inProgressCommands: number; weeklyData: { name: string; revenue: number }[]; serviceData: { name: string; value: number; color: string }[]; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface CommandFilters { status?: string; serviceId?: string; supplierId?: string; createdBy?: string; fromDate?: string; toDate?: string; search?: string; page?: number; limit?: number; }
export interface PaymentFilters { search?: string; fromDate?: string; toDate?: string; }
export interface SearchResult { id: string; type: 'command' | 'supplier' | 'employee' | 'document' | 'transaction' | 'payment'; label: string; sublabel: string; url: string; }
export interface CreateOmraHotelDto { name: string; location?: string; }
export interface UpdateOmraHotelDto { name?: string; location?: string; isActive?: boolean; }
export interface CreateOmraOrderDto { clientName: string; phone?: string; orderDate: string; periodFrom: string; periodTo: string; hotelId?: string; roomType?: OmraRoomType; omraType?: OmraOrderType; programId?: string; inProgram?: boolean; sellingPrice?: number; amountPaid?: number; buyingPrice?: number; notes?: string; assignedTo?: string; }
export interface UpdateOmraOrderDto extends Partial<CreateOmraOrderDto> { status?: OmraStatus; }
export interface CreateOmraVisaDto { clientName: string; phone?: string; visaDate: string; entryDate: string; hotelId?: string; sellingPrice?: number; amountPaid?: number; buyingPrice?: number; notes?: string; assignedTo?: string; }
export interface UpdateOmraVisaDto extends Partial<CreateOmraVisaDto> { status?: OmraStatus; }
export interface OmraFilters { status?: string; hotelId?: string; omraType?: string; search?: string; fromDate?: string; toDate?: string; page?: number; limit?: number; }
export interface CreateOmraProgramDto { name: string; periodFrom: string; periodTo: string; totalPlaces: number; hotelId?: string; pricing?: Record<string, number>; }
export interface UpdateOmraProgramDto extends Partial<CreateOmraProgramDto> { isActive?: boolean; }
export interface CreateEmployeeTransactionDto { employeeId: string; type: EmployeeTransactionType; amount: number; date: string; month?: string; note?: string; }
export interface CreateExpenseDto { category: ExpenseCategory; description: string; amount: number; date: string; paymentMethod: PaymentMethod; vendor?: string; receiptUrl?: string; note?: string; }
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}
export interface ExpenseFilters { category?: string; paymentMethod?: string; fromDate?: string; toDate?: string; search?: string; }
export interface CreateSupplierOrderDto { supplierId: string; description: string; quantity: number; unitPrice: number; orderDate: string; notes?: string; }
export interface UpdateSupplierOrderDto { description?: string; quantity?: number; unitPrice?: number; orderDate?: string; status?: SupplierOrderStatus; deliveredQuantity?: number; notes?: string; }
export interface CreateSupplierReceiptDto { supplierId: string; orderId?: string; description: string; quantity: number; unitPrice: number; receiptDate: string; notes?: string; }
export interface CreateSupplierInvoiceDto { supplierId: string; invoiceNumber: string; description: string; amount: number; invoiceDate: string; dueDate?: string; fileUrl?: string; notes?: string; }
export interface UpdateSupplierInvoiceDto { invoiceNumber?: string; description?: string; amount?: number; invoiceDate?: string; dueDate?: string; status?: SupplierInvoiceStatus; paidAmount?: number; fileUrl?: string; notes?: string; }
export interface SupplierOrderStats { totalOrders: number; pendingCount: number; deliveredCount: number; totalValue: number; }
export interface SupplierReceiptStats { totalReceipts: number; thisMonthCount: number; totalValue: number; }
export interface SupplierInvoiceStats { totalInvoices: number; unpaidCount: number; overdueCount: number; totalDue: number; }
export interface CreateInternalTaskDto { title: string; description?: string; priority?: TaskPriority; visibility?: TaskVisibility; assignedTo: string; dueDate?: string; }
export interface UpdateInternalTaskDto { title?: string; description?: string; priority?: TaskPriority; status?: TaskStatus; visibility?: TaskVisibility; assignedTo?: string; dueDate?: string; }
export interface InternalTaskFilters { status?: TaskStatus; priority?: TaskPriority; assignedTo?: string; }
export interface CreateClientInvoiceDto { type: ClientInvoiceType; commandId?: string; clientName: string; clientPhone?: string; clientEmail?: string; serviceName: string; serviceType?: string; destination?: string; totalAmount: number; paidAmount?: number; invoiceDate?: string; dueDate?: string; notes?: string; clientPassport?: string; companyName?: string; departureDate?: string; returnDate?: string; pnr?: string; travelClass?: string; ticketPrice?: number; agencyFees?: number; paymentMethod?: string; validityHours?: number; bankName?: string; bankAccount?: string; }
export interface UpdateClientInvoiceDto { type?: ClientInvoiceType; status?: ClientInvoiceStatus; clientName?: string; clientPhone?: string; clientEmail?: string; serviceName?: string; serviceType?: string; destination?: string; totalAmount?: number; paidAmount?: number; invoiceDate?: string; dueDate?: string; notes?: string; clientPassport?: string; companyName?: string; departureDate?: string; returnDate?: string; pnr?: string; travelClass?: string; ticketPrice?: number; agencyFees?: number; paymentMethod?: string; validityHours?: number; bankName?: string; bankAccount?: string; }
export interface ClientInvoiceFilters { type?: ClientInvoiceType; status?: ClientInvoiceStatus; search?: string; fromDate?: string; toDate?: string; }
export interface OmraStats {
  orders: { total: number; totalRevenue: number; totalPaid: number; totalProfit: number; byStatus: Record<string, number>; };
  visas: { total: number; totalRevenue: number; totalPaid: number; totalProfit: number; byStatus: Record<string, number>; };
  combined: { totalRevenue: number; totalPaid: number; totalProfit: number; };
}

export type ApiErrorType = 'network' | 'unauthorized' | 'forbidden' | 'validation' | 'rate_limited' | 'not_found' | 'server_error';

class ApiError extends Error {
  public readonly type: ApiErrorType;
  constructor(public status: number, message: string, type?: ApiErrorType) {
    super(message);
    this.name = 'ApiError';
    this.type = type || this.determineType(status);
  }
  private determineType(status: number): ApiErrorType {
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not_found';
    if (status === 429) return 'rate_limited';
    if (status === 400 || status === 422) return 'validation';
    if (status >= 500) return 'server_error';
    return 'server_error';
  }
  static networkError(message = 'Impossible de se connecter au serveur'): ApiError {
    return new ApiError(0, message, 'network');
  }
}

// ---------------------------------------------------------------------------
// Helper: simulate network latency
// ---------------------------------------------------------------------------
const SIM_LATENCY = 180;
const tick = () => delay(SIM_LATENCY);
const notFound = (label: string): never => {
  throw new ApiError(404, `${label} not found`, 'not_found');
};

// Hydrate populated relations for entities that include nested objects
function withCreatorAssignee<T extends { createdBy: string; assignedTo?: string }>(item: T): T & { creator?: User; assignee?: User } {
  return {
    ...item,
    creator: store.users.find((u) => u.id === item.createdBy),
    assignee: item.assignedTo ? store.users.find((u) => u.id === item.assignedTo) : undefined,
  };
}

function hydrateCommand(c: Command): Command {
  return {
    ...c,
    creator: store.users.find((u) => u.id === c.createdBy),
    assignee: c.assignedTo ? store.users.find((u) => u.id === c.assignedTo) : undefined,
  };
}

function hydrateOmraOrder(o: OmraOrder): OmraOrder {
  return {
    ...o,
    creator: store.users.find((u) => u.id === o.createdBy),
    assignee: o.assignedTo ? store.users.find((u) => u.id === o.assignedTo) : undefined,
    hotel: store.omraHotels.find((h) => h.id === o.hotelId),
    program: o.programId ? store.omraPrograms.find((p) => p.id === o.programId) : undefined,
  };
}

function hydrateOmraVisa(v: OmraVisa): OmraVisa {
  return {
    ...v,
    creator: store.users.find((u) => u.id === v.createdBy),
    assignee: v.assignedTo ? store.users.find((u) => u.id === v.assignedTo) : undefined,
    hotel: store.omraHotels.find((h) => h.id === v.hotelId),
  };
}

// ---------------------------------------------------------------------------
// Auth state (in-memory)
// ---------------------------------------------------------------------------
const FAKE_TOKEN_PREFIX = 'demo-token-';
const REFRESH_TOKEN_PREFIX = 'demo-refresh-';

class ApiClient {
  private token: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
    // Restore current user from token (token encodes the userId)
    if (this.token && this.token.startsWith(FAKE_TOKEN_PREFIX)) {
      const userId = this.token.slice(FAKE_TOKEN_PREFIX.length);
      if (store.users.find((u) => u.id === userId)) {
        store.currentUserId = userId;
      }
    }
  }

  // ---- token mgmt ----
  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
  }
  getToken(): string | null { return this.token; }
  setRefreshToken(token: string | null) {
    this.refreshTokenValue = token;
    if (token) localStorage.setItem('refreshToken', token);
    else localStorage.removeItem('refreshToken');
  }
  getRefreshToken(): string | null { return this.refreshTokenValue; }
  clearTokens() {
    this.setToken(null);
    this.setRefreshToken(null);
    store.currentUserId = null;
  }

  private requireUser(): User {
    if (!store.currentUserId) throw new ApiError(401, 'Unauthorized', 'unauthorized');
    const u = store.users.find((x) => x.id === store.currentUserId);
    if (!u) throw new ApiError(401, 'Unauthorized', 'unauthorized');
    return u;
  }

  // ==================== AUTH ====================
  login = async (data: LoginDto): Promise<LoginResponse> => {
    await delay(500);
    // Find user by email; fall back to admin if email is unknown.
    const lower = data.email.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === lower);
    if (!user) user = store.users.find((u) => u.role === 'admin')!;
    if (!user.isActive) throw new ApiError(401, 'Account deactivated', 'unauthorized');
    store.currentUserId = user.id;
    return {
      accessToken: `${FAKE_TOKEN_PREFIX}${user.id}`,
      refreshToken: `${REFRESH_TOKEN_PREFIX}${user.id}`,
      user,
    };
  };

  refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
    await tick();
    const u = this.requireUser();
    return { accessToken: `${FAKE_TOKEN_PREFIX}${u.id}`, refreshToken: `${REFRESH_TOKEN_PREFIX}${u.id}` };
  };

  logout = async (): Promise<void> => {
    await tick();
    store.currentUserId = null;
  };

  getMe = async (): Promise<User> => {
    await tick();
    return this.requireUser();
  };

  // ==================== USERS ====================
  getUsers = async (): Promise<User[]> => { await tick(); return [...store.users]; };
  getUser = async (id: string): Promise<User> => { await tick(); const u = store.users.find((x) => x.id === id); if (!u) notFound('User'); return u!; };
  createUser = async (data: CreateUserDto): Promise<User> => {
    await tick();
    const u: User = { id: uid(), email: data.email, firstName: data.firstName, lastName: data.lastName, role: data.role, isActive: true, createdAt: new Date() };
    store.users.push(u);
    return u;
  };
  updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
    await tick();
    const u = store.users.find((x) => x.id === id); if (!u) notFound('User');
    Object.assign(u!, { firstName: data.firstName ?? u!.firstName, lastName: data.lastName ?? u!.lastName, email: data.email ?? u!.email, isActive: data.isActive ?? u!.isActive });
    return u!;
  };
  toggleUserStatus = async (id: string): Promise<User> => {
    await tick();
    const u = store.users.find((x) => x.id === id); if (!u) notFound('User');
    u!.isActive = !u!.isActive;
    return u!;
  };
  deleteUser = async (id: string): Promise<void> => { await tick(); store.users = store.users.filter((u) => u.id !== id); };
  getActiveEmployees = async (): Promise<User[]> => { await tick(); return store.users.filter((u) => u.role === 'employee' && u.isActive); };

  // ==================== SERVICES ====================
  getServices = async (): Promise<Service[]> => { await tick(); return [...store.services]; };
  getActiveServices = async (): Promise<Service[]> => { await tick(); return store.services.filter((s) => s.isActive); };
  createService = async (data: CreateServiceDto): Promise<Service> => {
    await tick();
    const s: Service = { id: uid(), name: data.name, type: data.type, description: data.description, isActive: true, defaultSupplierId: data.defaultSupplierId, defaultBuyingPrice: data.defaultBuyingPrice, createdAt: new Date() };
    store.services.push(s); return s;
  };
  updateService = async (id: string, data: UpdateServiceDto): Promise<Service> => {
    await tick();
    const s = store.services.find((x) => x.id === id); if (!s) notFound('Service');
    Object.assign(s!, { name: data.name ?? s!.name, type: data.type ?? s!.type, description: data.description ?? s!.description, isActive: data.isActive ?? s!.isActive, defaultSupplierId: data.defaultSupplierId ?? s!.defaultSupplierId, defaultBuyingPrice: data.defaultBuyingPrice ?? s!.defaultBuyingPrice });
    return s!;
  };
  toggleServiceStatus = async (id: string): Promise<Service> => {
    await tick();
    const s = store.services.find((x) => x.id === id); if (!s) notFound('Service');
    s!.isActive = !s!.isActive; return s!;
  };
  deleteService = async (id: string): Promise<void> => { await tick(); store.services = store.services.filter((s) => s.id !== id); };

  // ==================== SERVICE TYPES ====================
  serviceTypes = {
    getAll: async (): Promise<ServiceTypeEntity[]> => { await tick(); return [...store.serviceTypes]; },
    getActive: async (): Promise<ServiceTypeEntity[]> => { await tick(); return store.serviceTypes.filter((s) => s.isActive); },
    getOne: async (id: string): Promise<ServiceTypeEntity> => { await tick(); const s = store.serviceTypes.find((x) => x.id === id); if (!s) notFound('ServiceType'); return s!; },
    create: async (data: CreateServiceTypeDto): Promise<ServiceTypeEntity> => {
      await tick();
      const s: ServiceTypeEntity = { id: uid(), code: data.code, nameFr: data.nameFr, nameAr: data.nameAr, icon: data.icon ?? 'Folder', isActive: true, createdAt: new Date(), updatedAt: new Date() };
      store.serviceTypes.push(s); return s;
    },
    update: async (id: string, data: UpdateServiceTypeDto): Promise<ServiceTypeEntity> => {
      await tick();
      const s = store.serviceTypes.find((x) => x.id === id); if (!s) notFound('ServiceType');
      Object.assign(s!, { code: data.code ?? s!.code, nameFr: data.nameFr ?? s!.nameFr, nameAr: data.nameAr ?? s!.nameAr, icon: data.icon ?? s!.icon, isActive: data.isActive ?? s!.isActive, updatedAt: new Date() });
      return s!;
    },
    toggleStatus: async (id: string): Promise<ServiceTypeEntity> => {
      await tick();
      const s = store.serviceTypes.find((x) => x.id === id); if (!s) notFound('ServiceType');
      s!.isActive = !s!.isActive; s!.updatedAt = new Date(); return s!;
    },
    delete: async (id: string): Promise<void> => { await tick(); store.serviceTypes = store.serviceTypes.filter((s) => s.id !== id); },
  };

  // ==================== SUPPLIERS ====================
  getSuppliers = async (): Promise<Supplier[]> => { await tick(); return [...store.suppliers]; };
  getSuppliersWithBalance = async () => {
    await tick();
    return store.suppliers.map((sup) => {
      const totalBuyingPrice = store.commands.filter((c) => c.supplierId === sup.id).reduce((s, c) => s + Number(c.buyingPrice), 0);
      const txs = store.supplierTransactions.filter((t) => t.supplierId === sup.id);
      const totalTransactionsSortie = txs.filter((t) => t.type === 'sortie').reduce((s, t) => s + Number(t.amount), 0);
      const totalTransactionsEntree = txs.filter((t) => t.type === 'entree').reduce((s, t) => s + Number(t.amount), 0);
      const balance = totalBuyingPrice + totalTransactionsEntree - totalTransactionsSortie;
      return { ...sup, totalBuyingPrice, totalTransactionsSortie, totalTransactionsEntree, balance };
    });
  };
  getSupplier = async (id: string): Promise<Supplier> => { await tick(); const s = store.suppliers.find((x) => x.id === id); if (!s) notFound('Supplier'); return s!; };
  getSupplierBalance = async (id: string): Promise<SupplierBalance> => {
    await tick();
    const totalPurchased = store.commands.filter((c) => c.supplierId === id).reduce((s, c) => s + Number(c.buyingPrice), 0);
    const txs = store.supplierTransactions.filter((t) => t.supplierId === id);
    const totalPaid = txs.filter((t) => t.type === 'sortie').reduce((s, t) => s + Number(t.amount), 0);
    const totalReceived = txs.filter((t) => t.type === 'entree').reduce((s, t) => s + Number(t.amount), 0);
    return { totalPurchased, totalPaid, remainingBalance: totalPurchased + totalReceived - totalPaid };
  };
  createSupplier = async (data: CreateSupplierDto): Promise<Supplier> => {
    await tick();
    const s: Supplier = { id: uid(), name: data.name, type: (data.type as Supplier['type']) || 'other', country: data.country, city: data.city, phone: data.phone, email: data.email, contact: data.contact, currency: data.currency || 'DZD', bankAccount: data.bankAccount, isActive: true, createdAt: new Date() };
    store.suppliers.push(s); return s;
  };
  updateSupplier = async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
    await tick();
    const s = store.suppliers.find((x) => x.id === id); if (!s) notFound('Supplier');
    Object.assign(s!, { name: data.name ?? s!.name, type: (data.type as Supplier['type']) ?? s!.type, country: data.country ?? s!.country, city: data.city ?? s!.city, phone: data.phone ?? s!.phone, email: data.email ?? s!.email, contact: data.contact ?? s!.contact, currency: data.currency ?? s!.currency, bankAccount: data.bankAccount ?? s!.bankAccount, isActive: data.isActive ?? s!.isActive });
    return s!;
  };
  deleteSupplier = async (id: string): Promise<void> => { await tick(); store.suppliers = store.suppliers.filter((s) => s.id !== id); };

  // ==================== COMMANDS ====================
  getCommands = async (filters?: CommandFilters): Promise<PaginatedResponse<Command>> => {
    await tick();
    let list = store.commands.map(hydrateCommand);
    const me = store.currentUserId ? store.users.find((u) => u.id === store.currentUserId) : null;
    // Employee-scope filtering (data isolation)
    if (me && me.role !== 'admin') {
      list = list.filter((c) => c.createdBy === me.id || c.assignedTo === me.id);
    }
    if (filters?.status) list = list.filter((c) => c.status === filters.status);
    if (filters?.serviceId) list = list.filter((c) => c.serviceId === filters.serviceId);
    if (filters?.supplierId) list = list.filter((c) => c.supplierId === filters.supplierId);
    if (filters?.createdBy) list = list.filter((c) => c.createdBy === filters.createdBy || c.assignedTo === filters.createdBy);
    if (filters?.fromDate) { const d = new Date(filters.fromDate); list = list.filter((c) => (c.commandDate ?? c.createdAt) >= d); }
    if (filters?.toDate) { const d = new Date(filters.toDate); list = list.filter((c) => (c.commandDate ?? c.createdAt) <= d); }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((c) => c.data.clientFullName?.toLowerCase().includes(q) || c.destination?.toLowerCase().includes(q));
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(list, filters?.page ?? 1, filters?.limit ?? 50);
  };
  getCommand = async (id: string): Promise<Command> => {
    await tick();
    const c = store.commands.find((x) => x.id === id); if (!c) notFound('Command');
    return hydrateCommand(c!);
  };
  getCommandStats = async () => {
    await tick();
    const me = store.currentUserId ? store.users.find((u) => u.id === store.currentUserId) : null;
    let list = store.commands;
    if (me && me.role !== 'admin') list = list.filter((c) => c.createdBy === me.id || c.assignedTo === me.id);
    const totalPaid = list.reduce((s, c) => s + Number(c.amountPaid), 0);
    const totalRemaining = list.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0);
    const totalProfit = list.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.buyingPrice)), 0);
    const byStatus: Record<string, number> = {};
    list.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
    return { totalPaid, totalRemaining, totalProfit, byStatus };
  };
  createCommand = async (data: CreateCommandDto): Promise<Command> => {
    await tick();
    const me = this.requireUser();
    const c: Command = {
      id: uid(),
      serviceId: data.serviceId,
      supplierId: data.supplierId,
      data: data.data as unknown as Command['data'],
      status: 'dossier_incomplet',
      destination: data.destination,
      sellingPrice: data.sellingPrice,
      amountPaid: data.amountPaid,
      buyingPrice: data.buyingPrice,
      assignedTo: data.assignedTo,
      commandDate: data.commandDate ? new Date(data.commandDate) : new Date(),
      createdBy: me.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.commands.push(c);
    return hydrateCommand(c);
  };
  updateCommand = async (id: string, data: UpdateCommandDto): Promise<Command> => {
    await tick();
    const c = store.commands.find((x) => x.id === id); if (!c) notFound('Command');
    Object.assign(c!, {
      data: data.data ? (data.data as unknown as Command['data']) : c!.data,
      status: data.status ?? c!.status,
      destination: data.destination ?? c!.destination,
      sellingPrice: data.sellingPrice ?? c!.sellingPrice,
      amountPaid: data.amountPaid ?? c!.amountPaid,
      buyingPrice: data.buyingPrice ?? c!.buyingPrice,
      assignedTo: data.assignedTo ?? c!.assignedTo,
      commandDate: data.commandDate ? new Date(data.commandDate) : c!.commandDate,
      updatedAt: new Date(),
    });
    return hydrateCommand(c!);
  };
  updateCommandStatus = async (id: string, status: string): Promise<Command> => {
    await tick();
    const c = store.commands.find((x) => x.id === id); if (!c) notFound('Command');
    c!.status = status as Command['status']; c!.updatedAt = new Date();
    return hydrateCommand(c!);
  };
  deleteCommand = async (id: string): Promise<void> => {
    await tick();
    store.commands = store.commands.filter((c) => c.id !== id);
    store.payments = store.payments.filter((p) => p.commandId !== id);
  };
  createCommandWithPassport = async (data: CreateCommandDto, _file: File): Promise<Command> => {
    void _file;
    const created = await this.createCommand(data);
    created.passportUrl = `/mock/passport-${created.id}.pdf`;
    const c = store.commands.find((x) => x.id === created.id); if (c) c.passportUrl = created.passportUrl;
    return created;
  };
  getCommandPassportBlob = async (_commandId: string, _mode: 'view' | 'download' = 'view'): Promise<Blob> => {
    await tick();
    void _mode;
    return new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' });
  };

  // ==================== PAYMENTS ====================
  getPayments = async (filters?: PaymentFilters): Promise<Payment[]> => {
    await tick();
    let list = [...store.payments];
    if (filters?.fromDate) { const d = new Date(filters.fromDate); list = list.filter((p) => p.createdAt >= d); }
    if (filters?.toDate) { const d = new Date(filters.toDate); list = list.filter((p) => p.createdAt <= d); }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((p) => {
        const cmd = store.commands.find((c) => c.id === p.commandId);
        return cmd?.data.clientFullName?.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  getPaymentsByCommand = async (commandId: string): Promise<Payment[]> => {
    await tick();
    return store.payments.filter((p) => p.commandId === commandId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
    await tick();
    const me = this.requireUser();
    const p: Payment = { id: uid(), commandId: data.commandId, amount: data.amount, method: data.method, recordedBy: me.id, createdAt: new Date(), notes: data.notes };
    store.payments.push(p);
    // Update command amountPaid
    const cmd = store.commands.find((c) => c.id === data.commandId);
    if (cmd) cmd.amountPaid = Number(cmd.amountPaid) + Number(data.amount);
    return p;
  };
  deletePayment = async (id: string): Promise<void> => {
    await tick();
    const p = store.payments.find((x) => x.id === id);
    if (p) {
      const cmd = store.commands.find((c) => c.id === p.commandId);
      if (cmd) cmd.amountPaid = Math.max(0, Number(cmd.amountPaid) - Number(p.amount));
    }
    store.payments = store.payments.filter((x) => x.id !== id);
  };

  // ==================== SUPPLIER TRANSACTIONS ====================
  getSupplierTransactions = async (): Promise<SupplierTransaction[]> => {
    await tick();
    return [...store.supplierTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  getSupplierTransactionsBySupplier = async (supplierId: string): Promise<SupplierTransaction[]> => {
    await tick();
    return store.supplierTransactions.filter((t) => t.supplierId === supplierId).sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  createSupplierTransaction = async (data: CreateSupplierTransactionDto): Promise<SupplierTransaction> => {
    await tick();
    const me = this.requireUser();
    const t: SupplierTransaction = {
      id: uid(),
      date: new Date(data.date),
      supplierId: data.supplierId,
      type: data.type,
      amount: data.amount,
      note: data.note,
      receiptUrl: data.file ? `/mock/receipt-${uid()}.pdf` : undefined,
      recordedBy: me.id,
      createdAt: new Date(),
    };
    store.supplierTransactions.push(t);
    return t;
  };
  deleteSupplierTransaction = async (id: string): Promise<void> => {
    await tick();
    store.supplierTransactions = store.supplierTransactions.filter((t) => t.id !== id);
  };
  getTransactionReceiptUrl = (transactionId: string): string => `#/mock/receipt/${transactionId}/download`;
  getTransactionReceiptViewUrl = (transactionId: string): string => `#/mock/receipt/${transactionId}/view`;
  getTransactionReceiptBlob = async (_transactionId: string, _mode: 'view' | 'download' = 'view'): Promise<Blob> => {
    await tick();
    void _mode;
    return new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' });
  };

  // ==================== DOCUMENTS ====================
  getDocuments = async (parentId?: string): Promise<DocumentNode[]> => {
    await tick();
    const pid = parentId ?? null;
    return store.documents
      .filter((d) => (d.parentId ?? null) === pid)
      .map((d) => ({ ...d, uploader: store.users.find((u) => u.id === d.uploadedBy) }))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
  };
  getDocumentAncestors = async (id: string): Promise<DocumentAncestor[]> => {
    await tick();
    const out: DocumentAncestor[] = [];
    let current = store.documents.find((d) => d.id === id);
    while (current && current.parentId) {
      const parent = store.documents.find((d) => d.id === current!.parentId);
      if (!parent) break;
      out.unshift({ id: parent.id, name: parent.name });
      current = parent;
    }
    return out;
  };
  createFolder = async (data: CreateFolderDto): Promise<DocumentNode> => {
    await tick();
    const me = this.requireUser();
    const node: DocumentNode = { id: uid(), name: data.name, type: 'folder', parentId: data.parentId ?? null, fileUrl: null, uploadedBy: me.id, createdAt: new Date(), updatedAt: new Date() };
    store.documents.push(node);
    return node;
  };
  uploadDocument = async (data: UploadDocumentDto): Promise<DocumentNode> => {
    await tick();
    const me = this.requireUser();
    const node: DocumentNode = { id: uid(), name: data.name, type: 'file', parentId: data.parentId ?? null, fileUrl: `/mock/documents/${data.name}`, uploadedBy: me.id, createdAt: new Date(), updatedAt: new Date() };
    store.documents.push(node);
    return node;
  };
  updateDocument = async (id: string, data: { name?: string }): Promise<DocumentNode> => {
    await tick();
    const d = store.documents.find((x) => x.id === id); if (!d) notFound('Document');
    if (data.name) d!.name = data.name;
    d!.updatedAt = new Date();
    return d!;
  };
  moveDocument = async (id: string, data: MoveNodeDto): Promise<DocumentNode> => {
    await tick();
    const d = store.documents.find((x) => x.id === id); if (!d) notFound('Document');
    d!.parentId = data.parentId ?? null;
    d!.updatedAt = new Date();
    return d!;
  };
  deleteDocument = async (id: string): Promise<void> => {
    await tick();
    // Also delete descendants
    const toDelete = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of store.documents) {
        if (d.parentId && toDelete.has(d.parentId) && !toDelete.has(d.id)) { toDelete.add(d.id); changed = true; }
      }
    }
    store.documents = store.documents.filter((d) => !toDelete.has(d.id));
  };
  getDocumentDownloadUrl = (id: string): string => `#/mock/documents/${id}/download`;

  // ==================== ANALYTICS ====================
  getDashboardStats = async (): Promise<DashboardStats> => {
    await tick();
    const me = this.requireUser();
    let cmds = store.commands;
    if (me.role !== 'admin') cmds = cmds.filter((c) => c.createdBy === me.id || c.assignedTo === me.id);
    const totalRevenue = cmds.reduce((s, c) => s + Number(c.amountPaid), 0);
    const pendingAmount = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCommands = cmds.filter((c) => (c.commandDate ?? c.createdAt) >= today).length;
    const inProgressCommands = cmds.filter((c) => ['depose', 'en_traitement'].includes(c.status)).length;
    // Weekly data: last 7 days
    const weeklyData: { name: string; revenue: number }[] = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const dEnd = new Date(d); dEnd.setDate(dEnd.getDate() + 1);
      const rev = store.payments.filter((p) => p.createdAt >= d && p.createdAt < dEnd).reduce((s, p) => s + Number(p.amount), 0);
      weeklyData.push({ name: dayNames[d.getDay()], revenue: rev });
    }
    // Service distribution
    const colors = ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];
    const counts: Record<string, number> = {};
    cmds.forEach((c) => { const svc = store.services.find((s) => s.id === c.serviceId); const name = svc?.name ?? 'Autre'; counts[name] = (counts[name] || 0) + 1; });
    const serviceData = Object.entries(counts).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
    return { totalRevenue, pendingAmount, todayCommands, inProgressCommands, weeklyData, serviceData };
  };
  getRevenueStats = async (fromDate: string, toDate: string) => {
    await tick();
    const start = new Date(fromDate); const end = new Date(toDate);
    const out: { date: string; revenue: number }[] = [];
    const cur = new Date(start); cur.setHours(0, 0, 0, 0);
    while (cur <= end) {
      const next = new Date(cur); next.setDate(next.getDate() + 1);
      const rev = store.payments.filter((p) => p.createdAt >= cur && p.createdAt < next).reduce((s, p) => s + Number(p.amount), 0);
      out.push({ date: cur.toISOString().slice(0, 10), revenue: rev });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };
  getSupplierStats = async () => {
    await tick();
    return store.suppliers.map((sup) => ({ supplierId: sup.id, name: sup.name, balance: { totalPurchased: 0, totalPaid: 0, remainingBalance: 0 } as SupplierBalance }));
  };
  getServiceStats = async () => {
    await tick();
    const map: Record<string, { count: number; revenue: number }> = {};
    store.commands.forEach((c) => {
      const svc = store.services.find((s) => s.id === c.serviceId);
      const t = svc?.type ?? 'other';
      if (!map[t]) map[t] = { count: 0, revenue: 0 };
      map[t].count += 1;
      map[t].revenue += Number(c.amountPaid);
    });
    return Object.entries(map).map(([serviceType, v]) => ({ serviceType, count: v.count, revenue: v.revenue }));
  };
  getEmployeeStats = async () => {
    await tick();
    const me = this.requireUser();
    const cmds = store.commands.filter((c) => c.createdBy === me.id || c.assignedTo === me.id);
    const totalCommands = cmds.length;
    const totalRevenue = cmds.reduce((s, c) => s + Number(c.amountPaid), 0);
    const totalProfit = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.buyingPrice)), 0);
    const pendingAmount = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0);
    return {
      totalCommands, totalRevenue, totalProfit, pendingAmount,
      byStatus: {
        en_attente: cmds.filter((c) => ['dossier_incomplet'].includes(c.status)).length,
        en_cours: cmds.filter((c) => ['depose', 'en_traitement'].includes(c.status)).length,
        termine: cmds.filter((c) => ['accepte', 'visa_delivre', 'retire'].includes(c.status)).length,
      },
    };
  };
  getEmployeeStatsById = async (employeeId: string) => {
    await tick();
    const cmds = store.commands.filter((c) => c.createdBy === employeeId || c.assignedTo === employeeId);
    return {
      totalCommands: cmds.length,
      totalRevenue: cmds.reduce((s, c) => s + Number(c.amountPaid), 0),
      totalProfit: cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.buyingPrice)), 0),
      pendingAmount: cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0),
    };
  };
  getCommandsByEmployee = async (employeeId: string): Promise<PaginatedResponse<Command>> => {
    await tick();
    const list = store.commands.filter((c) => c.createdBy === employeeId || c.assignedTo === employeeId).map(hydrateCommand).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(list, 1, 50);
  };
  getEmployeeCaisseStats = async () => {
    await tick();
    const employees = store.users.filter((u) => u.role === 'employee').map((emp) => {
      const cmds = store.commands.filter((c) => c.createdBy === emp.id || c.assignedTo === emp.id);
      // Subtract caisse settlements (resets)
      const settlements = store.caisseSettlements.filter((s) => s.employeeId === emp.id);
      const totalCaisse = cmds.reduce((s, c) => s + Number(c.amountPaid), 0) - settlements.reduce((s, x) => s + (Number(x.caisseAmount) - Number(x.newCaisse)), 0);
      const totalImpayes = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0) - settlements.reduce((s, x) => s + (Number(x.impayesAmount) - Number(x.newImpayes)), 0);
      const totalBenefices = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.buyingPrice)), 0) - settlements.reduce((s, x) => s + (Number(x.beneficesAmount) - Number(x.newBenefices)), 0);
      return { employeeId: emp.id, firstName: emp.firstName, lastName: emp.lastName, totalCaisse, totalImpayes, totalBenefices, commandCount: cmds.length };
    });
    const global = {
      totalCaisse: employees.reduce((s, e) => s + e.totalCaisse, 0),
      totalImpayes: employees.reduce((s, e) => s + e.totalImpayes, 0),
      totalBenefices: employees.reduce((s, e) => s + e.totalBenefices, 0),
      totalCommands: employees.reduce((s, e) => s + e.commandCount, 0),
    };
    return { employees, global };
  };

  // ==================== CAISSE HISTORY ====================
  createCaisseSettlement = async (data: { employeeId: string; newCaisse?: number; newImpayes?: number; newBenefices?: number; notes?: string }): Promise<CaisseSettlement> => {
    await tick();
    const me = this.requireUser();
    const cmds = store.commands.filter((c) => c.createdBy === data.employeeId || c.assignedTo === data.employeeId);
    const caisseAmount = cmds.reduce((s, c) => s + Number(c.amountPaid), 0);
    const impayesAmount = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.amountPaid)), 0);
    const beneficesAmount = cmds.reduce((s, c) => s + (Number(c.sellingPrice) - Number(c.buyingPrice)), 0);
    const settlement: CaisseSettlement = {
      id: uid(),
      employeeId: data.employeeId,
      caisseAmount, impayesAmount, beneficesAmount,
      commandCount: cmds.length,
      newCaisse: data.newCaisse ?? 0,
      newImpayes: data.newImpayes ?? 0,
      newBenefices: data.newBenefices ?? 0,
      adminId: me.id,
      admin: { firstName: me.firstName, lastName: me.lastName },
      notes: data.notes ?? null,
      resetDate: new Date(),
      createdAt: new Date(),
    };
    store.caisseSettlements.push(settlement);
    return settlement;
  };
  getCaisseSettlements = async (employeeId: string): Promise<CaisseSettlement[]> => {
    await tick();
    return store.caisseSettlements
      .filter((s) => s.employeeId === employeeId)
      .map((s) => ({ ...s, admin: store.users.find((u) => u.id === s.adminId) ? { firstName: store.users.find((u) => u.id === s.adminId)!.firstName, lastName: store.users.find((u) => u.id === s.adminId)!.lastName } : undefined }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  getCaisseLastResets = async (): Promise<Record<string, { resetDate: string; newBalance: number }>> => {
    await tick();
    const out: Record<string, { resetDate: string; newBalance: number }> = {};
    store.caisseSettlements.forEach((s) => {
      const cur = out[s.employeeId];
      if (!cur || new Date(cur.resetDate) < s.resetDate) {
        out[s.employeeId] = { resetDate: s.resetDate.toISOString(), newBalance: s.newCaisse };
      }
    });
    return out;
  };

  // ==================== SEARCH ====================
  search = async (query: string, limit = 10): Promise<SearchResult[]> => {
    await tick();
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const results: SearchResult[] = [];
    store.commands.forEach((c) => {
      if (c.data.clientFullName?.toLowerCase().includes(q) || c.destination?.toLowerCase().includes(q)) {
        results.push({ id: c.id, type: 'command', label: c.data.clientFullName, sublabel: c.destination, url: `/commandes?id=${c.id}` });
      }
    });
    store.suppliers.forEach((s) => {
      if (s.name.toLowerCase().includes(q)) results.push({ id: s.id, type: 'supplier', label: s.name, sublabel: s.country ?? '', url: `/fournisseurs` });
    });
    store.users.forEach((u) => {
      if (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        results.push({ id: u.id, type: 'employee', label: `${u.firstName} ${u.lastName}`, sublabel: u.email, url: `/employes` });
      }
    });
    store.documents.forEach((d) => {
      if (d.name.toLowerCase().includes(q)) results.push({ id: d.id, type: 'document', label: d.name, sublabel: d.type, url: `/documents` });
    });
    return results.slice(0, limit);
  };

  // ==================== OMRA ====================
  getOmraHotels = async (): Promise<OmraHotel[]> => { await tick(); return [...store.omraHotels]; };
  getActiveOmraHotels = async (): Promise<OmraHotel[]> => { await tick(); return store.omraHotels.filter((h) => h.isActive); };
  createOmraHotel = async (data: CreateOmraHotelDto): Promise<OmraHotel> => {
    await tick();
    const h: OmraHotel = { id: uid(), name: data.name, location: data.location || '', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    store.omraHotels.push(h); return h;
  };
  updateOmraHotel = async (id: string, data: UpdateOmraHotelDto): Promise<OmraHotel> => {
    await tick();
    const h = store.omraHotels.find((x) => x.id === id); if (!h) notFound('OmraHotel');
    Object.assign(h!, { name: data.name ?? h!.name, location: data.location ?? h!.location, isActive: data.isActive ?? h!.isActive, updatedAt: new Date() });
    return h!;
  };
  deleteOmraHotel = async (id: string): Promise<void> => { await tick(); store.omraHotels = store.omraHotels.filter((h) => h.id !== id); };

  getOmraOrders = async (filters?: OmraFilters): Promise<PaginatedResponse<OmraOrder>> => {
    await tick();
    let list = store.omraOrders.map(hydrateOmraOrder);
    const me = store.currentUserId ? store.users.find((u) => u.id === store.currentUserId) : null;
    if (me && me.role !== 'admin') list = list.filter((o) => o.createdBy === me.id || o.assignedTo === me.id);
    if (filters?.status) list = list.filter((o) => o.status === filters.status);
    if (filters?.hotelId) list = list.filter((o) => o.hotelId === filters.hotelId);
    if (filters?.omraType) list = list.filter((o) => o.omraType === filters.omraType);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((o) => o.clientName.toLowerCase().includes(q));
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(list, filters?.page ?? 1, filters?.limit ?? 50);
  };
  getOmraOrder = async (id: string): Promise<OmraOrder> => {
    await tick(); const o = store.omraOrders.find((x) => x.id === id); if (!o) notFound('OmraOrder'); return hydrateOmraOrder(o!);
  };
  createOmraOrder = async (data: CreateOmraOrderDto): Promise<OmraOrder> => {
    await tick();
    const me = this.requireUser();
    const o: OmraOrder = {
      id: uid(),
      clientName: data.clientName, phone: data.phone || '',
      orderDate: new Date(data.orderDate),
      periodFrom: new Date(data.periodFrom), periodTo: new Date(data.periodTo),
      hotelId: data.hotelId || '',
      roomType: (data.roomType as OmraRoomType) || 'chambre_2',
      status: 'en_attente',
      omraType: (data.omraType as OmraOrderType) || 'libre',
      programId: data.programId,
      inProgram: !!data.inProgram,
      sellingPrice: data.sellingPrice ?? 0,
      amountPaid: data.amountPaid ?? 0,
      buyingPrice: data.buyingPrice ?? 0,
      notes: data.notes,
      assignedTo: data.assignedTo,
      createdBy: me.id,
      createdAt: new Date(), updatedAt: new Date(),
    };
    store.omraOrders.push(o);
    return hydrateOmraOrder(o);
  };
  updateOmraOrder = async (id: string, data: UpdateOmraOrderDto): Promise<OmraOrder> => {
    await tick();
    const o = store.omraOrders.find((x) => x.id === id); if (!o) notFound('OmraOrder');
    Object.assign(o!, {
      clientName: data.clientName ?? o!.clientName,
      phone: data.phone ?? o!.phone,
      orderDate: data.orderDate ? new Date(data.orderDate) : o!.orderDate,
      periodFrom: data.periodFrom ? new Date(data.periodFrom) : o!.periodFrom,
      periodTo: data.periodTo ? new Date(data.periodTo) : o!.periodTo,
      hotelId: data.hotelId ?? o!.hotelId,
      roomType: (data.roomType as OmraRoomType) ?? o!.roomType,
      status: (data.status as OmraStatus) ?? o!.status,
      omraType: (data.omraType as OmraOrderType) ?? o!.omraType,
      programId: data.programId ?? o!.programId,
      inProgram: data.inProgram ?? o!.inProgram,
      sellingPrice: data.sellingPrice ?? o!.sellingPrice,
      amountPaid: data.amountPaid ?? o!.amountPaid,
      buyingPrice: data.buyingPrice ?? o!.buyingPrice,
      notes: data.notes ?? o!.notes,
      assignedTo: data.assignedTo ?? o!.assignedTo,
      updatedAt: new Date(),
    });
    return hydrateOmraOrder(o!);
  };
  updateOmraOrderStatus = async (id: string, status: string): Promise<OmraOrder> => {
    await tick();
    const o = store.omraOrders.find((x) => x.id === id); if (!o) notFound('OmraOrder');
    o!.status = status as OmraStatus; o!.updatedAt = new Date();
    return hydrateOmraOrder(o!);
  };
  deleteOmraOrder = async (id: string): Promise<void> => { await tick(); store.omraOrders = store.omraOrders.filter((o) => o.id !== id); };

  getOmraVisas = async (filters?: OmraFilters): Promise<PaginatedResponse<OmraVisa>> => {
    await tick();
    let list = store.omraVisas.map(hydrateOmraVisa);
    const me = store.currentUserId ? store.users.find((u) => u.id === store.currentUserId) : null;
    if (me && me.role !== 'admin') list = list.filter((v) => v.createdBy === me.id || v.assignedTo === me.id);
    if (filters?.status) list = list.filter((v) => v.status === filters.status);
    if (filters?.hotelId) list = list.filter((v) => v.hotelId === filters.hotelId);
    if (filters?.search) { const q = filters.search.toLowerCase(); list = list.filter((v) => v.clientName.toLowerCase().includes(q)); }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return paginate(list, filters?.page ?? 1, filters?.limit ?? 50);
  };
  getOmraVisa = async (id: string): Promise<OmraVisa> => {
    await tick(); const v = store.omraVisas.find((x) => x.id === id); if (!v) notFound('OmraVisa'); return hydrateOmraVisa(v!);
  };
  createOmraVisa = async (data: CreateOmraVisaDto): Promise<OmraVisa> => {
    await tick();
    const me = this.requireUser();
    const v: OmraVisa = {
      id: uid(),
      clientName: data.clientName, phone: data.phone || '',
      visaDate: new Date(data.visaDate),
      entryDate: new Date(data.entryDate),
      hotelId: data.hotelId || '',
      status: 'en_attente',
      sellingPrice: data.sellingPrice ?? 0,
      amountPaid: data.amountPaid ?? 0,
      buyingPrice: data.buyingPrice ?? 0,
      notes: data.notes,
      assignedTo: data.assignedTo,
      createdBy: me.id,
      createdAt: new Date(), updatedAt: new Date(),
    };
    store.omraVisas.push(v);
    return hydrateOmraVisa(v);
  };
  updateOmraVisa = async (id: string, data: UpdateOmraVisaDto): Promise<OmraVisa> => {
    await tick();
    const v = store.omraVisas.find((x) => x.id === id); if (!v) notFound('OmraVisa');
    Object.assign(v!, {
      clientName: data.clientName ?? v!.clientName,
      phone: data.phone ?? v!.phone,
      visaDate: data.visaDate ? new Date(data.visaDate) : v!.visaDate,
      entryDate: data.entryDate ? new Date(data.entryDate) : v!.entryDate,
      hotelId: data.hotelId ?? v!.hotelId,
      status: (data.status as OmraStatus) ?? v!.status,
      sellingPrice: data.sellingPrice ?? v!.sellingPrice,
      amountPaid: data.amountPaid ?? v!.amountPaid,
      buyingPrice: data.buyingPrice ?? v!.buyingPrice,
      notes: data.notes ?? v!.notes,
      assignedTo: data.assignedTo ?? v!.assignedTo,
      updatedAt: new Date(),
    });
    return hydrateOmraVisa(v!);
  };
  updateOmraVisaStatus = async (id: string, status: string): Promise<OmraVisa> => {
    await tick();
    const v = store.omraVisas.find((x) => x.id === id); if (!v) notFound('OmraVisa');
    v!.status = status as OmraStatus; v!.updatedAt = new Date();
    return hydrateOmraVisa(v!);
  };
  deleteOmraVisa = async (id: string): Promise<void> => { await tick(); store.omraVisas = store.omraVisas.filter((v) => v.id !== id); };

  getOmraStats = async (): Promise<OmraStats> => {
    await tick();
    const me = this.requireUser();
    let orders = store.omraOrders;
    let visas = store.omraVisas;
    if (me.role !== 'admin') {
      orders = orders.filter((o) => o.createdBy === me.id || o.assignedTo === me.id);
      visas = visas.filter((v) => v.createdBy === me.id || v.assignedTo === me.id);
    }
    const aggregate = (list: { sellingPrice: number; amountPaid: number; buyingPrice: number; status: OmraStatus }[]) => {
      const byStatus: Record<string, number> = {};
      list.forEach((x) => { byStatus[x.status] = (byStatus[x.status] || 0) + 1; });
      return {
        total: list.length,
        totalRevenue: list.reduce((s, x) => s + Number(x.sellingPrice), 0),
        totalPaid: list.reduce((s, x) => s + Number(x.amountPaid), 0),
        totalProfit: list.reduce((s, x) => s + (Number(x.sellingPrice) - Number(x.buyingPrice)), 0),
        byStatus,
      };
    };
    const o = aggregate(orders); const v = aggregate(visas);
    return { orders: o, visas: v, combined: { totalRevenue: o.totalRevenue + v.totalRevenue, totalPaid: o.totalPaid + v.totalPaid, totalProfit: o.totalProfit + v.totalProfit } };
  };

  getOmraPrograms = async (): Promise<OmraProgram[]> => {
    await tick();
    return store.omraPrograms.map((p) => ({ ...p, hotel: store.omraHotels.find((h) => h.id === p.hotelId), creator: store.users.find((u) => u.id === p.createdBy) }));
  };
  getActiveOmraPrograms = async (): Promise<OmraProgram[]> => {
    await tick();
    return store.omraPrograms.filter((p) => p.isActive).map((p) => ({ ...p, hotel: store.omraHotels.find((h) => h.id === p.hotelId), creator: store.users.find((u) => u.id === p.createdBy) }));
  };
  getOmraProgram = async (id: string): Promise<OmraProgram> => {
    await tick();
    const p = store.omraPrograms.find((x) => x.id === id); if (!p) notFound('OmraProgram');
    return { ...p!, hotel: store.omraHotels.find((h) => h.id === p!.hotelId), creator: store.users.find((u) => u.id === p!.createdBy) };
  };
  createOmraProgram = async (data: CreateOmraProgramDto): Promise<OmraProgram> => {
    await tick();
    const me = this.requireUser();
    const p: OmraProgram = { id: uid(), name: data.name, periodFrom: new Date(data.periodFrom), periodTo: new Date(data.periodTo), totalPlaces: data.totalPlaces, hotelId: data.hotelId, pricing: data.pricing ?? {}, isActive: true, createdBy: me.id, createdAt: new Date(), updatedAt: new Date() };
    store.omraPrograms.push(p); return p;
  };
  updateOmraProgram = async (id: string, data: UpdateOmraProgramDto): Promise<OmraProgram> => {
    await tick();
    const p = store.omraPrograms.find((x) => x.id === id); if (!p) notFound('OmraProgram');
    Object.assign(p!, { name: data.name ?? p!.name, periodFrom: data.periodFrom ? new Date(data.periodFrom) : p!.periodFrom, periodTo: data.periodTo ? new Date(data.periodTo) : p!.periodTo, totalPlaces: data.totalPlaces ?? p!.totalPlaces, hotelId: data.hotelId ?? p!.hotelId, pricing: data.pricing ?? p!.pricing, isActive: data.isActive ?? p!.isActive, updatedAt: new Date() });
    return p!;
  };
  deleteOmraProgram = async (id: string): Promise<void> => { await tick(); store.omraPrograms = store.omraPrograms.filter((p) => p.id !== id); };
  getOmraProgramInventory = async (): Promise<OmraProgramInventory[]> => {
    await tick();
    return store.omraPrograms.map((p) => {
      const confirmed = store.omraOrders.filter((o) => o.programId === p.id && o.status === 'confirme').length;
      return { programId: p.id, confirmed, remaining: Math.max(0, p.totalPlaces - confirmed), total: p.totalPlaces };
    });
  };

  // ==================== EMPLOYEE TRANSACTIONS ====================
  getEmployeeTransactions = async (): Promise<EmployeeTransaction[]> => {
    await tick();
    return store.employeeTransactions.map((t) => ({ ...t, employee: store.users.find((u) => u.id === t.employeeId), recorder: store.users.find((u) => u.id === t.recordedBy) })).sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  getEmployeeTransactionsByEmployee = async (employeeId: string): Promise<EmployeeTransaction[]> => {
    await tick();
    return store.employeeTransactions.filter((t) => t.employeeId === employeeId).map((t) => ({ ...t, employee: store.users.find((u) => u.id === t.employeeId), recorder: store.users.find((u) => u.id === t.recordedBy) })).sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  getEmployeeBalance = async (employeeId: string): Promise<EmployeeBalance> => {
    await tick();
    const emp = store.users.find((u) => u.id === employeeId);
    const txs = store.employeeTransactions.filter((t) => t.employeeId === employeeId);
    const totalAvances = txs.filter((t) => t.type === 'avance').reduce((s, t) => s + Number(t.amount), 0);
    const totalCredits = txs.filter((t) => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const totalSalaires = txs.filter((t) => t.type === 'salaire').reduce((s, t) => s + Number(t.amount), 0);
    return { employeeId, firstName: emp?.firstName || '', lastName: emp?.lastName || '', totalAvances, totalCredits, totalSalaires, balance: totalSalaires - totalAvances - totalCredits };
  };
  getAllEmployeeBalances = async (): Promise<EmployeeBalance[]> => {
    await tick();
    return Promise.all(store.users.filter((u) => u.role === 'employee').map((e) => this.getEmployeeBalance(e.id)));
  };
  createEmployeeTransaction = async (data: CreateEmployeeTransactionDto): Promise<EmployeeTransaction> => {
    await tick();
    const me = this.requireUser();
    const t: EmployeeTransaction = { id: uid(), employeeId: data.employeeId, type: data.type, amount: data.amount, date: new Date(data.date), month: data.month, note: data.note, recordedBy: me.id, createdAt: new Date() };
    store.employeeTransactions.push(t);
    return t;
  };
  deleteEmployeeTransaction = async (id: string): Promise<void> => { await tick(); store.employeeTransactions = store.employeeTransactions.filter((t) => t.id !== id); };

  // ==================== EXPENSES ====================
  getExpenses = async (filters?: ExpenseFilters): Promise<Expense[]> => {
    await tick();
    let list = store.expenses.map((e) => ({ ...e, recorder: store.users.find((u) => u.id === e.recordedBy) }));
    if (filters?.category) list = list.filter((e) => e.category === filters.category);
    if (filters?.paymentMethod) list = list.filter((e) => e.paymentMethod === filters.paymentMethod);
    if (filters?.fromDate) { const d = new Date(filters.fromDate); list = list.filter((e) => e.date >= d); }
    if (filters?.toDate) { const d = new Date(filters.toDate); list = list.filter((e) => e.date <= d); }
    if (filters?.search) { const q = filters.search.toLowerCase(); list = list.filter((e) => e.description.toLowerCase().includes(q) || (e.vendor?.toLowerCase().includes(q) ?? false)); }
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  getExpenseStats = async (): Promise<ExpenseStats> => {
    await tick();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const totalThisMonth = store.expenses.filter((e) => e.date >= monthStart).reduce((s, e) => s + Number(e.amount), 0);
    const totalThisYear = store.expenses.filter((e) => e.date >= yearStart).reduce((s, e) => s + Number(e.amount), 0);
    const totalAll = store.expenses.reduce((s, e) => s + Number(e.amount), 0);
    const map: Record<string, { total: number; count: number }> = {};
    store.expenses.forEach((e) => { if (!map[e.category]) map[e.category] = { total: 0, count: 0 }; map[e.category].total += Number(e.amount); map[e.category].count += 1; });
    const byCategory = Object.entries(map).map(([category, v]) => ({ category, total: v.total, count: v.count }));
    return { totalThisMonth, totalThisYear, totalAll, byCategory };
  };
  getExpense = async (id: string): Promise<Expense> => {
    await tick(); const e = store.expenses.find((x) => x.id === id); if (!e) notFound('Expense'); return { ...e!, recorder: store.users.find((u) => u.id === e!.recordedBy) };
  };
  createExpense = async (data: CreateExpenseDto): Promise<Expense> => {
    await tick();
    const me = this.requireUser();
    const e: Expense = { id: uid(), category: data.category, description: data.description, amount: data.amount, date: new Date(data.date), paymentMethod: data.paymentMethod, vendor: data.vendor, receiptUrl: data.receiptUrl, note: data.note, recordedBy: me.id, createdAt: new Date() };
    store.expenses.push(e); return e;
  };
  updateExpense = async (id: string, data: UpdateExpenseDto): Promise<Expense> => {
    await tick();
    const e = store.expenses.find((x) => x.id === id); if (!e) notFound('Expense');
    Object.assign(e!, { category: data.category ?? e!.category, description: data.description ?? e!.description, amount: data.amount ?? e!.amount, date: data.date ? new Date(data.date) : e!.date, paymentMethod: data.paymentMethod ?? e!.paymentMethod, vendor: data.vendor ?? e!.vendor, receiptUrl: data.receiptUrl ?? e!.receiptUrl, note: data.note ?? e!.note });
    return e!;
  };
  deleteExpense = async (id: string): Promise<void> => { await tick(); store.expenses = store.expenses.filter((e) => e.id !== id); };

  // ==================== SUPPLIER ORDERS ====================
  getSupplierOrders = async (supplierId?: string): Promise<SupplierOrder[]> => {
    await tick();
    let list = store.supplierOrders.map((o) => ({ ...o, supplier: store.suppliers.find((s) => s.id === o.supplierId) }));
    if (supplierId) list = list.filter((o) => o.supplierId === supplierId);
    return list.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  };
  getSupplierOrderStats = async (): Promise<SupplierOrderStats> => {
    await tick();
    return {
      totalOrders: store.supplierOrders.length,
      pendingCount: store.supplierOrders.filter((o) => o.status === 'en_attente').length,
      deliveredCount: store.supplierOrders.filter((o) => o.status === 'livre').length,
      totalValue: store.supplierOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
    };
  };
  getSupplierOrder = async (id: string): Promise<SupplierOrder> => {
    await tick(); const o = store.supplierOrders.find((x) => x.id === id); if (!o) notFound('SupplierOrder'); return { ...o!, supplier: store.suppliers.find((s) => s.id === o!.supplierId) };
  };
  createSupplierOrder = async (data: CreateSupplierOrderDto): Promise<SupplierOrder> => {
    await tick();
    const me = this.requireUser();
    const o: SupplierOrder = { id: uid(), supplierId: data.supplierId, orderNumber: `SO-${Date.now()}`, description: data.description, quantity: data.quantity, unitPrice: data.unitPrice, totalAmount: data.quantity * data.unitPrice, orderDate: new Date(data.orderDate), status: 'en_attente', deliveredQuantity: 0, notes: data.notes, createdBy: me.id, createdAt: new Date(), updatedAt: new Date() };
    store.supplierOrders.push(o); return o;
  };
  updateSupplierOrder = async (id: string, data: UpdateSupplierOrderDto): Promise<SupplierOrder> => {
    await tick();
    const o = store.supplierOrders.find((x) => x.id === id); if (!o) notFound('SupplierOrder');
    Object.assign(o!, { description: data.description ?? o!.description, quantity: data.quantity ?? o!.quantity, unitPrice: data.unitPrice ?? o!.unitPrice, orderDate: data.orderDate ? new Date(data.orderDate) : o!.orderDate, status: data.status ?? o!.status, deliveredQuantity: data.deliveredQuantity ?? o!.deliveredQuantity, notes: data.notes ?? o!.notes, updatedAt: new Date() });
    o!.totalAmount = Number(o!.quantity) * Number(o!.unitPrice);
    return o!;
  };
  deleteSupplierOrder = async (id: string): Promise<void> => { await tick(); store.supplierOrders = store.supplierOrders.filter((o) => o.id !== id); };

  // ==================== SUPPLIER RECEIPTS ====================
  getSupplierReceipts = async (supplierId?: string, orderId?: string): Promise<SupplierReceipt[]> => {
    await tick();
    let list = store.supplierReceipts.map((r) => ({ ...r, supplier: store.suppliers.find((s) => s.id === r.supplierId), order: r.orderId ? store.supplierOrders.find((o) => o.id === r.orderId) : undefined }));
    if (supplierId) list = list.filter((r) => r.supplierId === supplierId);
    if (orderId) list = list.filter((r) => r.orderId === orderId);
    return list.sort((a, b) => b.receiptDate.getTime() - a.receiptDate.getTime());
  };
  getSupplierReceiptStats = async (): Promise<SupplierReceiptStats> => {
    await tick();
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      totalReceipts: store.supplierReceipts.length,
      thisMonthCount: store.supplierReceipts.filter((r) => r.receiptDate >= monthStart).length,
      totalValue: store.supplierReceipts.reduce((s, r) => s + Number(r.totalAmount), 0),
    };
  };
  getSupplierReceipt = async (id: string): Promise<SupplierReceipt> => {
    await tick(); const r = store.supplierReceipts.find((x) => x.id === id); if (!r) notFound('SupplierReceipt'); return { ...r!, supplier: store.suppliers.find((s) => s.id === r!.supplierId) };
  };
  createSupplierReceipt = async (data: CreateSupplierReceiptDto): Promise<SupplierReceipt> => {
    await tick();
    const me = this.requireUser();
    const r: SupplierReceipt = { id: uid(), supplierId: data.supplierId, orderId: data.orderId, receiptNumber: `BR-${Date.now()}`, description: data.description, quantity: data.quantity, unitPrice: data.unitPrice, totalAmount: data.quantity * data.unitPrice, receiptDate: new Date(data.receiptDate), notes: data.notes, createdBy: me.id, createdAt: new Date() };
    store.supplierReceipts.push(r); return r;
  };
  deleteSupplierReceipt = async (id: string): Promise<void> => { await tick(); store.supplierReceipts = store.supplierReceipts.filter((r) => r.id !== id); };

  // ==================== SUPPLIER INVOICES ====================
  getSupplierInvoices = async (supplierId?: string, status?: string): Promise<SupplierInvoice[]> => {
    await tick();
    let list = store.supplierInvoices.map((i) => ({ ...i, supplier: store.suppliers.find((s) => s.id === i.supplierId) }));
    if (supplierId) list = list.filter((i) => i.supplierId === supplierId);
    if (status) list = list.filter((i) => i.status === status);
    return list.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  };
  getSupplierInvoiceStats = async (): Promise<SupplierInvoiceStats> => {
    await tick();
    const now = new Date();
    return {
      totalInvoices: store.supplierInvoices.length,
      unpaidCount: store.supplierInvoices.filter((i) => i.status !== 'paye').length,
      overdueCount: store.supplierInvoices.filter((i) => i.dueDate && i.dueDate < now && i.status !== 'paye').length,
      totalDue: store.supplierInvoices.reduce((s, i) => s + (Number(i.amount) - Number(i.paidAmount)), 0),
    };
  };
  getSupplierInvoice = async (id: string): Promise<SupplierInvoice> => {
    await tick(); const i = store.supplierInvoices.find((x) => x.id === id); if (!i) notFound('SupplierInvoice'); return { ...i!, supplier: store.suppliers.find((s) => s.id === i!.supplierId) };
  };
  createSupplierInvoice = async (data: CreateSupplierInvoiceDto): Promise<SupplierInvoice> => {
    await tick();
    const me = this.requireUser();
    const i: SupplierInvoice = { id: uid(), supplierId: data.supplierId, invoiceNumber: data.invoiceNumber, internalRef: `INT-${Date.now()}`, description: data.description, amount: data.amount, invoiceDate: new Date(data.invoiceDate), dueDate: data.dueDate ? new Date(data.dueDate) : undefined, status: 'non_paye', paidAmount: 0, fileUrl: data.fileUrl, notes: data.notes, createdBy: me.id, createdAt: new Date(), updatedAt: new Date() };
    store.supplierInvoices.push(i); return i;
  };
  updateSupplierInvoice = async (id: string, data: UpdateSupplierInvoiceDto): Promise<SupplierInvoice> => {
    await tick();
    const i = store.supplierInvoices.find((x) => x.id === id); if (!i) notFound('SupplierInvoice');
    Object.assign(i!, { invoiceNumber: data.invoiceNumber ?? i!.invoiceNumber, description: data.description ?? i!.description, amount: data.amount ?? i!.amount, invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : i!.invoiceDate, dueDate: data.dueDate ? new Date(data.dueDate) : i!.dueDate, status: data.status ?? i!.status, paidAmount: data.paidAmount ?? i!.paidAmount, fileUrl: data.fileUrl ?? i!.fileUrl, notes: data.notes ?? i!.notes, updatedAt: new Date() });
    return i!;
  };
  deleteSupplierInvoice = async (id: string): Promise<void> => { await tick(); store.supplierInvoices = store.supplierInvoices.filter((i) => i.id !== id); };

  // ==================== INTERNAL TASKS ====================
  getInternalTasks = async (): Promise<InternalTask[]> => {
    await tick();
    const me = this.requireUser();
    let list = store.internalTasks.map((t) => ({ ...t, assignee: store.users.find((u) => u.id === t.assignedTo), creator: store.users.find((u) => u.id === t.createdBy) }));
    if (me.role !== 'admin') list = list.filter((t) => t.assignedTo === me.id);
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };
  getInternalTaskStats = async (): Promise<TaskStats> => {
    await tick();
    const total = store.internalTasks.length;
    const inProgress = store.internalTasks.filter((t) => t.status === 'in_progress').length;
    const completed = store.internalTasks.filter((t) => t.status === 'completed').length;
    const byEmployee = store.users.filter((u) => u.role === 'employee').map((emp) => ({
      employeeId: emp.id, firstName: emp.firstName, lastName: emp.lastName,
      inProgress: store.internalTasks.filter((t) => t.assignedTo === emp.id && t.status === 'in_progress').length,
      completed: store.internalTasks.filter((t) => t.assignedTo === emp.id && t.status === 'completed').length,
    }));
    return { total, inProgress, completed, byEmployee };
  };
  getInternalTask = async (id: string): Promise<InternalTask> => {
    await tick(); const t = store.internalTasks.find((x) => x.id === id); if (!t) notFound('InternalTask');
    return { ...t!, assignee: store.users.find((u) => u.id === t!.assignedTo), creator: store.users.find((u) => u.id === t!.createdBy) };
  };
  createInternalTask = async (data: CreateInternalTaskDto): Promise<InternalTask> => {
    await tick();
    const me = this.requireUser();
    const t: InternalTask = { id: uid(), title: data.title, description: data.description, priority: data.priority ?? 'normal', status: 'in_progress', visibility: data.visibility ?? 'clear', assignedTo: data.assignedTo, createdBy: me.id, dueDate: data.dueDate ? new Date(data.dueDate) : undefined, seen: false, createdAt: new Date(), updatedAt: new Date() };
    store.internalTasks.push(t); return t;
  };
  updateInternalTask = async (id: string, data: UpdateInternalTaskDto): Promise<InternalTask> => {
    await tick();
    const t = store.internalTasks.find((x) => x.id === id); if (!t) notFound('InternalTask');
    Object.assign(t!, { title: data.title ?? t!.title, description: data.description ?? t!.description, priority: data.priority ?? t!.priority, status: data.status ?? t!.status, visibility: data.visibility ?? t!.visibility, assignedTo: data.assignedTo ?? t!.assignedTo, dueDate: data.dueDate ? new Date(data.dueDate) : t!.dueDate, updatedAt: new Date() });
    return t!;
  };
  deleteInternalTask = async (id: string): Promise<void> => { await tick(); store.internalTasks = store.internalTasks.filter((t) => t.id !== id); };
  getUnseenTaskCount = async (): Promise<{ count: number }> => {
    await tick();
    const me = this.requireUser();
    if (me.role === 'admin') return { count: 0 };
    return { count: store.internalTasks.filter((t) => t.assignedTo === me.id && !t.seen).length };
  };
  markTasksAsSeen = async (): Promise<void> => {
    await tick();
    const me = this.requireUser();
    store.internalTasks.forEach((t) => { if (t.assignedTo === me.id) t.seen = true; });
  };

  // ==================== CLIENT INVOICES ====================
  getClientInvoices = async (filters?: ClientInvoiceFilters): Promise<ClientInvoice[]> => {
    await tick();
    const me = this.requireUser();
    let list = store.clientInvoices.map((i) => ({ ...i, creator: store.users.find((u) => u.id === i.createdBy), command: i.commandId ? store.commands.find((c) => c.id === i.commandId) : undefined }));
    if (me.role !== 'admin') list = list.filter((i) => i.createdBy === me.id);
    if (filters?.type) list = list.filter((i) => i.type === filters.type);
    if (filters?.status) list = list.filter((i) => i.status === filters.status);
    if (filters?.search) { const q = filters.search.toLowerCase(); list = list.filter((i) => i.clientName.toLowerCase().includes(q) || i.invoiceNumber.toLowerCase().includes(q)); }
    if (filters?.fromDate) { const d = new Date(filters.fromDate); list = list.filter((i) => i.invoiceDate >= d); }
    if (filters?.toDate) { const d = new Date(filters.toDate); list = list.filter((i) => i.invoiceDate <= d); }
    return list.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  };
  getClientInvoice = async (id: string): Promise<ClientInvoice> => {
    await tick(); const i = store.clientInvoices.find((x) => x.id === id); if (!i) notFound('ClientInvoice'); return { ...i!, creator: store.users.find((u) => u.id === i!.createdBy), command: i!.commandId ? store.commands.find((c) => c.id === i!.commandId) : undefined };
  };
  getClientInvoiceStats = async (): Promise<ClientInvoiceStats> => {
    await tick();
    const me = this.requireUser();
    const list = me.role === 'admin' ? store.clientInvoices : store.clientInvoices.filter((i) => i.createdBy === me.id);
    return {
      total: list.length,
      pending: list.filter((i) => i.status === 'envoyee' || i.status === 'brouillon').length,
      paid: list.filter((i) => i.status === 'payee').length,
      cancelled: list.filter((i) => i.status === 'annulee').length,
      totalAmount: list.reduce((s, i) => s + Number(i.totalAmount), 0),
      totalPaid: list.reduce((s, i) => s + Number(i.paidAmount), 0),
      totalRemaining: list.reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
    };
  };
  getClientInvoicesByCommand = async (commandId: string): Promise<ClientInvoice[]> => {
    await tick();
    return store.clientInvoices.filter((i) => i.commandId === commandId);
  };
  createClientInvoice = async (data: CreateClientInvoiceDto): Promise<ClientInvoice> => {
    await tick();
    const me = this.requireUser();
    const seq = store.clientInvoices.length + 1;
    const i: ClientInvoice = {
      id: uid(),
      invoiceNumber: `${data.type === 'proforma' ? 'PROF' : 'FACT'}-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`,
      type: data.type, status: 'brouillon',
      commandId: data.commandId, clientName: data.clientName, clientPhone: data.clientPhone, clientEmail: data.clientEmail,
      serviceName: data.serviceName, serviceType: data.serviceType, destination: data.destination,
      totalAmount: data.totalAmount, paidAmount: data.paidAmount ?? 0,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes, clientPassport: data.clientPassport, companyName: data.companyName,
      departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
      returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
      pnr: data.pnr, travelClass: data.travelClass, ticketPrice: data.ticketPrice, agencyFees: data.agencyFees,
      paymentMethod: data.paymentMethod, validityHours: data.validityHours,
      bankName: data.bankName ?? null, bankAccount: data.bankAccount ?? null,
      createdBy: me.id, createdAt: new Date(), updatedAt: new Date(),
    };
    store.clientInvoices.push(i); return i;
  };
  createClientInvoiceFromCommand = async (commandId: string, type: ClientInvoiceType): Promise<ClientInvoice> => {
    await tick();
    const c = store.commands.find((x) => x.id === commandId); if (!c) notFound('Command');
    const svc = store.services.find((s) => s.id === c!.serviceId);
    return this.createClientInvoice({
      type, commandId: c!.id, clientName: c!.data.clientFullName, clientPhone: c!.data.phone,
      serviceName: svc?.name ?? 'Service', serviceType: svc?.type, destination: c!.destination,
      totalAmount: Number(c!.sellingPrice), paidAmount: Number(c!.amountPaid),
      ticketPrice: Number(c!.buyingPrice), agencyFees: Number(c!.sellingPrice) - Number(c!.buyingPrice),
    });
  };
  updateClientInvoice = async (id: string, data: UpdateClientInvoiceDto): Promise<ClientInvoice> => {
    await tick();
    const i = store.clientInvoices.find((x) => x.id === id); if (!i) notFound('ClientInvoice');
    Object.assign(i!, {
      type: data.type ?? i!.type, status: data.status ?? i!.status,
      clientName: data.clientName ?? i!.clientName, clientPhone: data.clientPhone ?? i!.clientPhone, clientEmail: data.clientEmail ?? i!.clientEmail,
      serviceName: data.serviceName ?? i!.serviceName, serviceType: data.serviceType ?? i!.serviceType, destination: data.destination ?? i!.destination,
      totalAmount: data.totalAmount ?? i!.totalAmount, paidAmount: data.paidAmount ?? i!.paidAmount,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : i!.invoiceDate,
      dueDate: data.dueDate ? new Date(data.dueDate) : i!.dueDate,
      notes: data.notes ?? i!.notes, clientPassport: data.clientPassport ?? i!.clientPassport, companyName: data.companyName ?? i!.companyName,
      departureDate: data.departureDate ? new Date(data.departureDate) : i!.departureDate,
      returnDate: data.returnDate ? new Date(data.returnDate) : i!.returnDate,
      pnr: data.pnr ?? i!.pnr, travelClass: data.travelClass ?? i!.travelClass, ticketPrice: data.ticketPrice ?? i!.ticketPrice, agencyFees: data.agencyFees ?? i!.agencyFees,
      paymentMethod: data.paymentMethod ?? i!.paymentMethod, validityHours: data.validityHours ?? i!.validityHours,
      bankName: data.bankName ?? i!.bankName, bankAccount: data.bankAccount ?? i!.bankAccount,
      updatedAt: new Date(),
    });
    return i!;
  };
  deleteClientInvoice = async (id: string): Promise<void> => { await tick(); store.clientInvoices = store.clientInvoices.filter((i) => i.id !== id); };

  // ==================== AGENCY SETTINGS ====================
  getAgencySettings = async (): Promise<Record<string, string>> => { await tick(); return { ...store.agencySettings }; };
  updateAgencySettings = async (settings: Record<string, string>): Promise<Record<string, string>> => {
    await tick();
    store.agencySettings = { ...store.agencySettings, ...settings };
    return { ...store.agencySettings };
  };

  // ==================== COMPANIES ====================
  getCompanies = async (): Promise<Company[]> => { await tick(); return [...store.companies]; };
  createCompany = async (data: { name: string }): Promise<Company> => {
    await tick();
    const c: Company = { id: uid(), name: data.name, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    store.companies.push(c); return c;
  };
  updateCompany = async (id: string, data: { name?: string; isActive?: boolean }): Promise<Company> => {
    await tick();
    const c = store.companies.find((x) => x.id === id); if (!c) notFound('Company');
    Object.assign(c!, { name: data.name ?? c!.name, isActive: data.isActive ?? c!.isActive, updatedAt: new Date() });
    return c!;
  };
  deleteCompany = async (id: string): Promise<void> => { await tick(); store.companies = store.companies.filter((c) => c.id !== id); };

  // ==================== PAYMENT TYPES ====================
  getPaymentTypes = async (): Promise<PaymentType[]> => { await tick(); return [...store.paymentTypes]; };
  createPaymentType = async (data: { name: string }): Promise<PaymentType> => {
    await tick();
    const p: PaymentType = { id: uid(), name: data.name, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    store.paymentTypes.push(p); return p;
  };
  updatePaymentType = async (id: string, data: { name?: string; isActive?: boolean }): Promise<PaymentType> => {
    await tick();
    const p = store.paymentTypes.find((x) => x.id === id); if (!p) notFound('PaymentType');
    Object.assign(p!, { name: data.name ?? p!.name, isActive: data.isActive ?? p!.isActive, updatedAt: new Date() });
    return p!;
  };
  deletePaymentType = async (id: string): Promise<void> => { await tick(); store.paymentTypes = store.paymentTypes.filter((p) => p.id !== id); };
}

// Suppress unused-helper warnings (these utilities support optional callers)
void withCreatorAssignee;

export const api = new ApiClient();
export { ApiError };
