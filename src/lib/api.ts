import { User, Service, Supplier, Command, Payment, SupplierTransaction, DocumentNode, OmraHotel, OmraOrder, OmraVisa, OmraProgram, OmraProgramInventory, OmraRoomType, OmraStatus, OmraOrderType, EmployeeTransaction, EmployeeBalance, EmployeeTransactionType, Expense, ExpenseStats, ExpenseCategory, PaymentMethod, SupplierOrder, SupplierOrderStatus, SupplierReceipt, SupplierInvoice, SupplierInvoiceStatus, ServiceTypeEntity, InternalTask, TaskStats, TaskPriority, TaskStatus, TaskVisibility, ClientInvoice, ClientInvoiceStats, ClientInvoiceType, ClientInvoiceStatus, CaisseSettlement, Company, PaymentType } from '@/types';

// API base URL - includes /api prefix to match nginx proxy configuration
const API_URL = (import.meta.env.VITE_API_URL || 'http://69.62.127.134:8080/api')
  .trim()
  .replace(/\/+$/, '');

// DTOs for API requests
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface CreateServiceDto {
  name: string;
  type: string; // Dynamic reference to ServiceType.code
  description: string;
  defaultSupplierId?: string;
  defaultBuyingPrice?: number;
}

export interface UpdateServiceDto {
  name?: string;
  type?: string; // Dynamic reference to ServiceType.code
  description?: string;
  isActive?: boolean;
  defaultSupplierId?: string;
  defaultBuyingPrice?: number;
}

// Service Type DTOs
export interface CreateServiceTypeDto {
  code: string;
  nameFr: string;
  nameAr: string;
  icon?: string;
}

export interface UpdateServiceTypeDto {
  code?: string;
  nameFr?: string;
  nameAr?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CreateSupplierDto {
  name: string;
  type?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  contact?: string;
  currency?: string;
  bankAccount?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  type?: string;
  country?: string;
  city?: string;
  phone?: string;
  email?: string;
  contact?: string;
  currency?: string;
  bankAccount?: string;
  isActive?: boolean;
}

export interface CreateCommandDto {
  serviceId: string;
  supplierId: string;
  data: Record<string, unknown>;
  destination: string;
  sellingPrice: number;
  amountPaid: number;
  buyingPrice: number;
  assignedTo?: string;
  commandDate?: string;
}

export interface UpdateCommandDto {
  data?: Record<string, unknown>;
  status?: 'dossier_incomplet' | 'depose' | 'en_traitement' | 'accepte' | 'refuse' | 'visa_delivre' | 'retire';
  destination?: string;
  sellingPrice?: number;
  amountPaid?: number;
  buyingPrice?: number;
  assignedTo?: string;
  commandDate?: string;
}

export interface CreatePaymentDto {
  commandId: string;
  amount: number;
  method: 'especes' | 'virement' | 'cheque' | 'carte';
  notes?: string;
}

export interface CreateSupplierTransactionDto {
  supplierId: string;
  date: string;
  type: 'sortie' | 'entree';
  amount: number;
  note: string;
  file?: File;
}

export interface UploadDocumentDto {
  name: string;
  parentId?: string;
  file: File;
}

export interface CreateFolderDto {
  name: string;
  parentId?: string;
}

export interface MoveNodeDto {
  parentId?: string | null;
}

export interface DocumentAncestor {
  id: string;
  name: string;
}

export interface SupplierBalance {
  totalPurchased: number;
  totalPaid: number;
  remainingBalance: number;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  todayCommands: number;
  inProgressCommands: number;
  weeklyData: { name: string; revenue: number }[];
  serviceData: { name: string; value: number; color: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommandFilters {
  status?: string;
  serviceId?: string;
  supplierId?: string;
  createdBy?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SearchResult {
  id: string;
  type: 'command' | 'supplier' | 'employee' | 'document' | 'transaction' | 'payment';
  label: string;
  sublabel: string;
  url: string;
}

// ==================== OMRA DTOs ====================

export interface CreateOmraHotelDto {
  name: string;
  location?: string;
}

export interface UpdateOmraHotelDto {
  name?: string;
  location?: string;
  isActive?: boolean;
}

export interface CreateOmraOrderDto {
  clientName: string;
  phone?: string;
  orderDate: string;
  periodFrom: string;
  periodTo: string;
  hotelId?: string;
  roomType?: OmraRoomType;
  omraType?: OmraOrderType;
  programId?: string;
  inProgram?: boolean;
  sellingPrice?: number;
  amountPaid?: number;
  buyingPrice?: number;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateOmraOrderDto extends Partial<CreateOmraOrderDto> {
  status?: OmraStatus;
}

export interface CreateOmraVisaDto {
  clientName: string;
  phone?: string;
  visaDate: string;
  entryDate: string;
  hotelId?: string;
  sellingPrice?: number;
  amountPaid?: number;
  buyingPrice?: number;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateOmraVisaDto extends Partial<CreateOmraVisaDto> {
  status?: OmraStatus;
}

export interface OmraFilters {
  status?: string;
  hotelId?: string;
  omraType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// ==================== OMRA PROGRAM DTOs ====================

export interface CreateOmraProgramDto {
  name: string;
  periodFrom: string;
  periodTo: string;
  totalPlaces: number;
  hotelId?: string;
  pricing?: Record<string, number>;
}

export interface UpdateOmraProgramDto extends Partial<CreateOmraProgramDto> {
  isActive?: boolean;
}

// ==================== EMPLOYEE TRANSACTIONS DTOs ====================

export interface CreateEmployeeTransactionDto {
  employeeId: string;
  type: EmployeeTransactionType;
  amount: number;
  date: string;
  month?: string;
  note?: string;
}

// ==================== EXPENSES DTOs ====================

export interface CreateExpenseDto {
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  vendor?: string;
  receiptUrl?: string;
  note?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface ExpenseFilters {
  category?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// ==================== SUPPLIER ORDERS/RECEIPTS/INVOICES DTOs ====================

export interface CreateSupplierOrderDto {
  supplierId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  orderDate: string;
  notes?: string;
}

export interface UpdateSupplierOrderDto {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  orderDate?: string;
  status?: SupplierOrderStatus;
  deliveredQuantity?: number;
  notes?: string;
}

export interface CreateSupplierReceiptDto {
  supplierId: string;
  orderId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  receiptDate: string;
  notes?: string;
}

export interface CreateSupplierInvoiceDto {
  supplierId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  invoiceDate: string;
  dueDate?: string;
  fileUrl?: string;
  notes?: string;
}

export interface UpdateSupplierInvoiceDto {
  invoiceNumber?: string;
  description?: string;
  amount?: number;
  invoiceDate?: string;
  dueDate?: string;
  status?: SupplierInvoiceStatus;
  paidAmount?: number;
  fileUrl?: string;
  notes?: string;
}

export interface SupplierOrderStats {
  totalOrders: number;
  pendingCount: number;
  deliveredCount: number;
  totalValue: number;
}

export interface SupplierReceiptStats {
  totalReceipts: number;
  thisMonthCount: number;
  totalValue: number;
}

export interface SupplierInvoiceStats {
  totalInvoices: number;
  unpaidCount: number;
  overdueCount: number;
  totalDue: number;
}

// ==================== INTERNAL TASKS DTOs ====================

export interface CreateInternalTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  visibility?: TaskVisibility;
  assignedTo: string;
  dueDate?: string;
}

export interface UpdateInternalTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  visibility?: TaskVisibility;
  assignedTo?: string;
  dueDate?: string;
}

export interface InternalTaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
}

// ==================== CLIENT INVOICES DTOs ====================

export interface CreateClientInvoiceDto {
  type: ClientInvoiceType;
  commandId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  serviceType?: string;
  destination?: string;
  totalAmount: number;
  paidAmount?: number;
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  clientPassport?: string;
  companyName?: string;
  departureDate?: string;
  returnDate?: string;
  pnr?: string;
  travelClass?: string;
  ticketPrice?: number;
  agencyFees?: number;
  paymentMethod?: string;
  validityHours?: number;
  bankName?: string;
  bankAccount?: string;
}

export interface UpdateClientInvoiceDto {
  type?: ClientInvoiceType;
  status?: ClientInvoiceStatus;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName?: string;
  serviceType?: string;
  destination?: string;
  totalAmount?: number;
  paidAmount?: number;
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
  clientPassport?: string;
  companyName?: string;
  departureDate?: string;
  returnDate?: string;
  pnr?: string;
  travelClass?: string;
  ticketPrice?: number;
  agencyFees?: number;
  paymentMethod?: string;
  validityHours?: number;
  bankName?: string;
  bankAccount?: string;
}

export interface ClientInvoiceFilters {
  type?: ClientInvoiceType;
  status?: ClientInvoiceStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface OmraStats {
  orders: {
    total: number;
    totalRevenue: number;
    totalPaid: number;
    totalProfit: number;
    byStatus: Record<string, number>;
  };
  visas: {
    total: number;
    totalRevenue: number;
    totalPaid: number;
    totalProfit: number;
    byStatus: Record<string, number>;
  };
  combined: {
    totalRevenue: number;
    totalPaid: number;
    totalProfit: number;
  };
}

export type ApiErrorType =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'rate_limited'
  | 'not_found'
  | 'server_error';

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
    const error = new ApiError(0, message, 'network');
    return error;
  }
}

class ApiClient {
  private token: string | null = null;
  private refreshTokenValue: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Restore tokens from localStorage on init
    this.token = localStorage.getItem('authToken');
    this.refreshTokenValue = localStorage.getItem('refreshToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setRefreshToken(token: string | null) {
    this.refreshTokenValue = token;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getRefreshToken(): string | null {
    return this.refreshTokenValue;
  }

  clearTokens() {
    this.setToken(null);
    this.setRefreshToken(null);
  }

  private async attemptRefresh(): Promise<boolean> {
    console.log('Attempting token refresh...');
    if (!this.refreshTokenValue) {
      console.log('No refresh token available');
      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing) {
      console.log('Refresh already in progress, waiting...');
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('Sending refresh request...');
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
        });

        if (!response.ok) {
          console.error('Refresh failed with status:', response.status);
          if (response.status === 401 || response.status === 403) {
            this.clearTokens();
          }
          return false;
        }

        const data = await response.json();
        console.log('Refresh successful, new tokens received');
        this.setToken(data.accessToken);
        this.setRefreshToken(data.refreshToken);
        return true;
      } catch (e) {
        console.error('Refresh error:', e);
        // Network error or other issue, don't clear tokens immediately
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false, skipAuthRetry = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (error) {
      // Network error (offline, server unreachable, DNS failure, etc.)
      throw ApiError.networkError();
    }

    if (!response.ok) {
      if (response.status === 401 && !isRetry && !skipAuthRetry) {
        // Try to refresh the token
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, true);
        }

        // If refresh failed but we still have tokens (e.g. 500 error on refresh),
        // DO NOT logout. Just throw the original error.
        if (this.getToken()) {
          throw new ApiError(401, 'Session refresh failed temporary');
        }

        // Only redirect if we definitely have no valid session
        this.clearTokens();
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  private async requestWithFormData<T>(endpoint: string, formData: FormData, isRetry = false): Promise<T> {
    const headers: HeadersInit = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    let response: Response;
    try {
      response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (error) {
      throw ApiError.networkError();
    }

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          return this.requestWithFormData<T>(endpoint, formData, true);
        }

        if (this.getToken()) {
          throw new ApiError(401, 'Session refresh failed temporary');
        }

        this.clearTokens();
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // ==================== AUTH ====================

  login = (data: LoginDto): Promise<LoginResponse> =>
    this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false, true);

  refreshToken = (): Promise<{ accessToken: string; refreshToken: string }> =>
    this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshTokenValue }),
    });

  logout = (): Promise<void> =>
    this.request('/auth/logout', { method: 'POST' });

  getMe = (): Promise<User> =>
    this.request('/auth/me');

  // ==================== USERS ====================

  getUsers = (): Promise<User[]> =>
    this.request('/users');

  getUser = (id: string): Promise<User> =>
    this.request(`/users/${id}`);

  createUser = (data: CreateUserDto): Promise<User> =>
    this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateUser = (id: string, data: UpdateUserDto): Promise<User> =>
    this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  toggleUserStatus = (id: string): Promise<User> =>
    this.request(`/users/${id}/status`, { method: 'PATCH' });

  deleteUser = (id: string): Promise<void> =>
    this.request(`/users/${id}`, { method: 'DELETE' });

  getActiveEmployees = (): Promise<User[]> =>
    this.request('/users/employees');

  // ==================== SERVICES ====================

  getServices = (): Promise<Service[]> =>
    this.request('/services');

  getActiveServices = (): Promise<Service[]> =>
    this.request('/services/active');

  createService = (data: CreateServiceDto): Promise<Service> =>
    this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateService = (id: string, data: UpdateServiceDto): Promise<Service> =>
    this.request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  toggleServiceStatus = (id: string): Promise<Service> =>
    this.request(`/services/${id}/status`, { method: 'PATCH' });

  deleteService = (id: string): Promise<void> =>
    this.request(`/services/${id}`, { method: 'DELETE' });

  // ==================== SERVICE TYPES ====================

  serviceTypes = {
    getAll: (): Promise<ServiceTypeEntity[]> =>
      this.request('/service-types'),

    getActive: (): Promise<ServiceTypeEntity[]> =>
      this.request('/service-types/active'),

    getOne: (id: string): Promise<ServiceTypeEntity> =>
      this.request(`/service-types/${id}`),

    create: (data: CreateServiceTypeDto): Promise<ServiceTypeEntity> =>
      this.request('/service-types', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateServiceTypeDto): Promise<ServiceTypeEntity> =>
      this.request(`/service-types/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    toggleStatus: (id: string): Promise<ServiceTypeEntity> =>
      this.request(`/service-types/${id}/toggle`, { method: 'PATCH' }),

    delete: (id: string): Promise<void> =>
      this.request(`/service-types/${id}`, { method: 'DELETE' }),
  };
  // Suppliers
  getSuppliers = (): Promise<Supplier[]> =>
    this.request('/suppliers');

  getSuppliersWithBalance = (): Promise<(Supplier & {
    totalBuyingPrice: number;
    totalTransactionsSortie: number;
    totalTransactionsEntree: number;
    balance: number;
  })[]> =>
    this.request('/suppliers/accounting');

  getSupplier = (id: string): Promise<Supplier> =>
    this.request(`/suppliers/${id}`);

  getSupplierBalance = (id: string): Promise<SupplierBalance> =>
    this.request(`/suppliers/${id}/balance`);

  createSupplier = (data: CreateSupplierDto): Promise<Supplier> =>
    this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateSupplier = (id: string, data: UpdateSupplierDto): Promise<Supplier> =>
    this.request(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteSupplier = (id: string): Promise<void> =>
    this.request(`/suppliers/${id}`, { method: 'DELETE' });

  // ==================== COMMANDS ====================

  getCommands = (filters?: CommandFilters): Promise<PaginatedResponse<Command>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/commands${query ? `?${query}` : ''}`);
  };

  getCommand = (id: string): Promise<Command> =>
    this.request(`/commands/${id}`);

  getCommandStats = (): Promise<{
    totalPaid: number;
    totalRemaining: number;
    totalProfit: number;
    byStatus: Record<string, number>;
  }> =>
    this.request('/commands/stats');

  createCommand = (data: CreateCommandDto): Promise<Command> =>
    this.request('/commands', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateCommand = (id: string, data: UpdateCommandDto): Promise<Command> =>
    this.request(`/commands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  updateCommandStatus = (id: string, status: string): Promise<Command> =>
    this.request(`/commands/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

  deleteCommand = (id: string): Promise<void> =>
    this.request(`/commands/${id}`, { method: 'DELETE' });

  // Create command with passport file (for visa commands)
  createCommandWithPassport = (data: CreateCommandDto, passportFile: File): Promise<Command> => {
    const formData = new FormData();
    formData.append('serviceId', data.serviceId);
    formData.append('supplierId', data.supplierId);
    formData.append('data', JSON.stringify(data.data));
    formData.append('destination', data.destination || '');
    formData.append('sellingPrice', data.sellingPrice.toString());
    formData.append('amountPaid', data.amountPaid.toString());
    formData.append('buyingPrice', data.buyingPrice.toString());
    if (data.assignedTo) {
      formData.append('assignedTo', data.assignedTo);
    }
    if (data.commandDate) {
      formData.append('commandDate', data.commandDate);
    }
    formData.append('passport', passportFile);
    return this.requestWithFormData('/commands/with-passport', formData);
  };

  // Fetch passport as blob for viewing (authenticated)
  getCommandPassportBlob = async (commandId: string, mode: 'view' | 'download' = 'view'): Promise<Blob> => {
    const endpoint = mode === 'view' ? 'view' : 'download';
    const response = await fetch(`${API_URL}/commands/${commandId}/passport/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch passport');
    }

    return response.blob();
  };

  // ==================== PAYMENTS ====================

  getPayments = (filters?: PaymentFilters): Promise<Payment[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/payments${query ? `?${query}` : ''}`);
  };

  getPaymentsByCommand = (commandId: string): Promise<Payment[]> =>
    this.request(`/payments/command/${commandId}`);

  createPayment = (data: CreatePaymentDto): Promise<Payment> =>
    this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  deletePayment = (id: string): Promise<void> =>
    this.request(`/payments/${id}`, { method: 'DELETE' });

  // ==================== SUPPLIER TRANSACTIONS ====================

  getSupplierTransactions = (): Promise<SupplierTransaction[]> =>
    this.request('/supplier-transactions');

  getSupplierTransactionsBySupplier = (supplierId: string): Promise<SupplierTransaction[]> =>
    this.request(`/supplier-transactions/supplier/${supplierId}`);

  createSupplierTransaction = (data: CreateSupplierTransactionDto): Promise<SupplierTransaction> => {
    // If file is provided, use multipart form data
    if (data.file) {
      const formData = new FormData();
      formData.append('supplierId', data.supplierId);
      formData.append('date', data.date);
      formData.append('type', data.type);
      formData.append('amount', data.amount.toString());
      formData.append('note', data.note || '');
      formData.append('file', data.file);
      return this.requestWithFormData('/supplier-transactions/with-file', formData);
    }
    // Otherwise, use JSON
    return this.request('/supplier-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  deleteSupplierTransaction = (id: string): Promise<void> =>
    this.request(`/supplier-transactions/${id}`, { method: 'DELETE' });

  getTransactionReceiptUrl = (transactionId: string): string =>
    `${API_URL}/supplier-transactions/${transactionId}/download`;

  getTransactionReceiptViewUrl = (transactionId: string): string =>
    `${API_URL}/supplier-transactions/${transactionId}/view`;

  // Fetch PDF as blob with authentication (for iframe viewing and downloading)
  getTransactionReceiptBlob = async (transactionId: string, mode: 'view' | 'download' = 'view'): Promise<Blob> => {
    const endpoint = mode === 'view' ? 'view' : 'download';
    const response = await fetch(`${API_URL}/supplier-transactions/${transactionId}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch receipt');
    }
    
    return response.blob();
  };

  // ==================== DOCUMENTS ====================

  getDocuments = (parentId?: string): Promise<DocumentNode[]> => {
    const query = parentId ? `?parentId=${encodeURIComponent(parentId)}` : '';
    return this.request(`/documents${query}`);
  };

  getDocumentAncestors = (id: string): Promise<DocumentAncestor[]> =>
    this.request(`/documents/${id}/ancestors`);

  createFolder = (data: CreateFolderDto): Promise<DocumentNode> =>
    this.request('/documents/folder', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  uploadDocument = (data: UploadDocumentDto): Promise<DocumentNode> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.parentId) formData.append('parentId', data.parentId);
    formData.append('file', data.file);
    return this.requestWithFormData('/documents/upload', formData);
  };

  updateDocument = (id: string, data: { name?: string }): Promise<DocumentNode> =>
    this.request(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  moveDocument = (id: string, data: MoveNodeDto): Promise<DocumentNode> =>
    this.request(`/documents/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteDocument = (id: string): Promise<void> =>
    this.request(`/documents/${id}`, { method: 'DELETE' });

  getDocumentDownloadUrl = (id: string): string =>
    `${API_URL}/documents/${id}/download`;

  // ==================== ANALYTICS ====================

  getDashboardStats = (): Promise<DashboardStats> =>
    this.request('/analytics/dashboard');

  getRevenueStats = (fromDate: string, toDate: string): Promise<{ date: string; revenue: number }[]> =>
    this.request(`/analytics/revenue?from=${fromDate}&to=${toDate}`);

  getSupplierStats = (): Promise<{
    supplierId: string;
    name: string;
    balance: SupplierBalance
  }[]> =>
    this.request('/analytics/suppliers');

  getServiceStats = (): Promise<{
    serviceType: string;
    count: number;
    revenue: number
  }[]> =>
    this.request('/analytics/services');

  getEmployeeStats = (): Promise<{
    totalCommands: number;
    totalRevenue: number;
    totalProfit: number;
    pendingAmount: number;
    byStatus: {
      en_attente: number;
      en_cours: number;
      termine: number;
    };
  }> =>
    this.request('/analytics/employee-stats');

  // Get employee stats by ID (admin only)
  getEmployeeStatsById = (employeeId: string): Promise<{
    totalCommands: number;
    totalRevenue: number;
    totalProfit: number;
    pendingAmount: number;
  }> =>
    this.request(`/analytics/employee-stats/${employeeId}`);

  // Get commands by employee ID (admin only)
  getCommandsByEmployee = (employeeId: string): Promise<PaginatedResponse<Command>> =>
    this.request(`/commands/by-employee/${employeeId}`);

  // Employee caisse stats (admin only)
  getEmployeeCaisseStats = (): Promise<{
    employees: {
      employeeId: string;
      firstName: string;
      lastName: string;
      totalCaisse: number;
      totalImpayes: number;
      totalBenefices: number;
      commandCount: number;
    }[];
    global: {
      totalCaisse: number;
      totalImpayes: number;
      totalBenefices: number;
      totalCommands: number;
    };
  }> =>
    this.request('/analytics/employee-caisses');

  // ==================== CAISSE HISTORY ====================

  createCaisseSettlement = (data: { employeeId: string; newCaisse?: number; newImpayes?: number; newBenefices?: number; notes?: string }): Promise<CaisseSettlement> =>
    this.request('/caisse-history/settle', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  getCaisseSettlements = (employeeId: string): Promise<CaisseSettlement[]> =>
    this.request(`/caisse-history/employee/${employeeId}`);

  getCaisseLastResets = (): Promise<Record<string, { resetDate: string; newBalance: number }>> =>
    this.request('/caisse-history/last-resets');

  // ==================== SEARCH ====================

  search = (query: string, limit?: number): Promise<SearchResult[]> =>
    this.request(`/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`);

  // ==================== OMRA ====================

  // Hotels
  getOmraHotels = (): Promise<OmraHotel[]> =>
    this.request('/omra/hotels');

  getActiveOmraHotels = (): Promise<OmraHotel[]> =>
    this.request('/omra/hotels/active');

  createOmraHotel = (data: CreateOmraHotelDto): Promise<OmraHotel> =>
    this.request('/omra/hotels', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateOmraHotel = (id: string, data: UpdateOmraHotelDto): Promise<OmraHotel> =>
    this.request(`/omra/hotels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteOmraHotel = (id: string): Promise<void> =>
    this.request(`/omra/hotels/${id}`, { method: 'DELETE' });

  // Orders
  getOmraOrders = (filters?: OmraFilters): Promise<PaginatedResponse<OmraOrder>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/omra/orders${query ? `?${query}` : ''}`);
  };

  getOmraOrder = (id: string): Promise<OmraOrder> =>
    this.request(`/omra/orders/${id}`);

  createOmraOrder = (data: CreateOmraOrderDto): Promise<OmraOrder> =>
    this.request('/omra/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateOmraOrder = (id: string, data: UpdateOmraOrderDto): Promise<OmraOrder> =>
    this.request(`/omra/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  updateOmraOrderStatus = (id: string, status: string): Promise<OmraOrder> =>
    this.request(`/omra/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

  deleteOmraOrder = (id: string): Promise<void> =>
    this.request(`/omra/orders/${id}`, { method: 'DELETE' });

  // Visas
  getOmraVisas = (filters?: OmraFilters): Promise<PaginatedResponse<OmraVisa>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/omra/visas${query ? `?${query}` : ''}`);
  };

  getOmraVisa = (id: string): Promise<OmraVisa> =>
    this.request(`/omra/visas/${id}`);

  createOmraVisa = (data: CreateOmraVisaDto): Promise<OmraVisa> =>
    this.request('/omra/visas', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateOmraVisa = (id: string, data: UpdateOmraVisaDto): Promise<OmraVisa> =>
    this.request(`/omra/visas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  updateOmraVisaStatus = (id: string, status: string): Promise<OmraVisa> =>
    this.request(`/omra/visas/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

  deleteOmraVisa = (id: string): Promise<void> =>
    this.request(`/omra/visas/${id}`, { method: 'DELETE' });

  // Stats
  getOmraStats = (): Promise<OmraStats> =>
    this.request('/omra/stats');

  // Programs
  getOmraPrograms = (): Promise<OmraProgram[]> =>
    this.request('/omra/programs');

  getActiveOmraPrograms = (): Promise<OmraProgram[]> =>
    this.request('/omra/programs/active');

  getOmraProgram = (id: string): Promise<OmraProgram> =>
    this.request(`/omra/programs/${id}`);

  createOmraProgram = (data: CreateOmraProgramDto): Promise<OmraProgram> =>
    this.request('/omra/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateOmraProgram = (id: string, data: UpdateOmraProgramDto): Promise<OmraProgram> =>
    this.request(`/omra/programs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteOmraProgram = (id: string): Promise<void> =>
    this.request(`/omra/programs/${id}`, { method: 'DELETE' });

  getOmraProgramInventory = (): Promise<OmraProgramInventory[]> =>
    this.request('/omra/programs/inventory');

  // ==================== EMPLOYEE TRANSACTIONS ====================

  getEmployeeTransactions = (): Promise<EmployeeTransaction[]> =>
    this.request('/employee-transactions');

  getEmployeeTransactionsByEmployee = (employeeId: string): Promise<EmployeeTransaction[]> =>
    this.request(`/employee-transactions/employee/${employeeId}`);

  getEmployeeBalance = (employeeId: string): Promise<EmployeeBalance> =>
    this.request(`/employee-transactions/employee/${employeeId}/balance`);

  getAllEmployeeBalances = (): Promise<EmployeeBalance[]> =>
    this.request('/employee-transactions/balances');

  createEmployeeTransaction = (data: CreateEmployeeTransactionDto): Promise<EmployeeTransaction> =>
    this.request('/employee-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  deleteEmployeeTransaction = (id: string): Promise<void> =>
    this.request(`/employee-transactions/${id}`, { method: 'DELETE' });

  // ==================== EXPENSES ====================

  getExpenses = (filters?: ExpenseFilters): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/expenses${query ? `?${query}` : ''}`);
  };

  getExpenseStats = (): Promise<ExpenseStats> =>
    this.request('/expenses/stats');

  getExpense = (id: string): Promise<Expense> =>
    this.request(`/expenses/${id}`);

  createExpense = (data: CreateExpenseDto): Promise<Expense> =>
    this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateExpense = (id: string, data: UpdateExpenseDto): Promise<Expense> =>
    this.request(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteExpense = (id: string): Promise<void> =>
    this.request(`/expenses/${id}`, { method: 'DELETE' });

  // ==================== SUPPLIER ORDERS ====================

  getSupplierOrders = (supplierId?: string): Promise<SupplierOrder[]> => {
    const query = supplierId ? `?supplierId=${supplierId}` : '';
    return this.request(`/supplier-orders${query}`);
  };

  getSupplierOrderStats = (): Promise<SupplierOrderStats> =>
    this.request('/supplier-orders/stats');

  getSupplierOrder = (id: string): Promise<SupplierOrder> =>
    this.request(`/supplier-orders/${id}`);

  createSupplierOrder = (data: CreateSupplierOrderDto): Promise<SupplierOrder> =>
    this.request('/supplier-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateSupplierOrder = (id: string, data: UpdateSupplierOrderDto): Promise<SupplierOrder> =>
    this.request(`/supplier-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteSupplierOrder = (id: string): Promise<void> =>
    this.request(`/supplier-orders/${id}`, { method: 'DELETE' });

  // ==================== SUPPLIER RECEIPTS ====================

  getSupplierReceipts = (supplierId?: string, orderId?: string): Promise<SupplierReceipt[]> => {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplierId', supplierId);
    if (orderId) params.append('orderId', orderId);
    const query = params.toString();
    return this.request(`/supplier-receipts${query ? `?${query}` : ''}`);
  };

  getSupplierReceiptStats = (): Promise<SupplierReceiptStats> =>
    this.request('/supplier-receipts/stats');

  getSupplierReceipt = (id: string): Promise<SupplierReceipt> =>
    this.request(`/supplier-receipts/${id}`);

  createSupplierReceipt = (data: CreateSupplierReceiptDto): Promise<SupplierReceipt> =>
    this.request('/supplier-receipts', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  deleteSupplierReceipt = (id: string): Promise<void> =>
    this.request(`/supplier-receipts/${id}`, { method: 'DELETE' });

  // ==================== SUPPLIER INVOICES ====================

  getSupplierInvoices = (supplierId?: string, status?: string): Promise<SupplierInvoice[]> => {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplierId', supplierId);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request(`/supplier-invoices${query ? `?${query}` : ''}`);
  };

  getSupplierInvoiceStats = (): Promise<SupplierInvoiceStats> =>
    this.request('/supplier-invoices/stats');

  getSupplierInvoice = (id: string): Promise<SupplierInvoice> =>
    this.request(`/supplier-invoices/${id}`);

  createSupplierInvoice = (data: CreateSupplierInvoiceDto): Promise<SupplierInvoice> =>
    this.request('/supplier-invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateSupplierInvoice = (id: string, data: UpdateSupplierInvoiceDto): Promise<SupplierInvoice> =>
    this.request(`/supplier-invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteSupplierInvoice = (id: string): Promise<void> =>
    this.request(`/supplier-invoices/${id}`, { method: 'DELETE' });

  // ==================== INTERNAL TASKS ====================

  getInternalTasks = (): Promise<InternalTask[]> =>
    this.request('/internal-tasks');

  getInternalTaskStats = (): Promise<TaskStats> =>
    this.request('/internal-tasks/stats');

  getInternalTask = (id: string): Promise<InternalTask> =>
    this.request(`/internal-tasks/${id}`);

  createInternalTask = (data: CreateInternalTaskDto): Promise<InternalTask> =>
    this.request('/internal-tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateInternalTask = (id: string, data: UpdateInternalTaskDto): Promise<InternalTask> =>
    this.request(`/internal-tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteInternalTask = (id: string): Promise<void> =>
    this.request(`/internal-tasks/${id}`, { method: 'DELETE' });

  getUnseenTaskCount = (): Promise<{ count: number }> =>
    this.request('/internal-tasks/unseen-count');

  markTasksAsSeen = (): Promise<void> =>
    this.request('/internal-tasks/mark-seen', { method: 'PATCH' });

  // ==================== CLIENT INVOICES ====================

  getClientInvoices = (filters?: ClientInvoiceFilters): Promise<ClientInvoice[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    return this.request(`/client-invoices${query ? `?${query}` : ''}`);
  };

  getClientInvoice = (id: string): Promise<ClientInvoice> =>
    this.request(`/client-invoices/${id}`);

  getClientInvoiceStats = (): Promise<ClientInvoiceStats> =>
    this.request('/client-invoices/stats');

  getClientInvoicesByCommand = (commandId: string): Promise<ClientInvoice[]> =>
    this.request(`/client-invoices/command/${commandId}`);

  createClientInvoice = (data: CreateClientInvoiceDto): Promise<ClientInvoice> =>
    this.request('/client-invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  createClientInvoiceFromCommand = (commandId: string, type: ClientInvoiceType): Promise<ClientInvoice> =>
    this.request(`/client-invoices/from-command/${commandId}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });

  updateClientInvoice = (id: string, data: UpdateClientInvoiceDto): Promise<ClientInvoice> =>
    this.request(`/client-invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteClientInvoice = (id: string): Promise<void> =>
    this.request(`/client-invoices/${id}`, { method: 'DELETE' });

  // ==================== AGENCY SETTINGS ====================

  getAgencySettings = (): Promise<Record<string, string>> =>
    this.request('/agency-settings');

  updateAgencySettings = (settings: Record<string, string>): Promise<Record<string, string>> =>
    this.request('/agency-settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });

  // ==================== COMPANIES ====================

  getCompanies = (): Promise<Company[]> =>
    this.request('/companies');

  createCompany = (data: { name: string }): Promise<Company> =>
    this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updateCompany = (id: string, data: { name?: string; isActive?: boolean }): Promise<Company> =>
    this.request(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deleteCompany = (id: string): Promise<void> =>
    this.request(`/companies/${id}`, { method: 'DELETE' });

  // ==================== PAYMENT TYPES ====================

  getPaymentTypes = (): Promise<PaymentType[]> =>
    this.request('/payment-types');

  createPaymentType = (data: { name: string }): Promise<PaymentType> =>
    this.request('/payment-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  updatePaymentType = (id: string, data: { name?: string; isActive?: boolean }): Promise<PaymentType> =>
    this.request(`/payment-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

  deletePaymentType = (id: string): Promise<void> =>
    this.request(`/payment-types/${id}`, { method: 'DELETE' });
}

export const api = new ApiClient();
export { ApiError };
