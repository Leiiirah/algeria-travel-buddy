import { User, Service, Supplier, Command, Payment, SupplierTransaction, Document } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  isActive?: boolean;
}

export interface CreateServiceDto {
  name: string;
  type: 'visa' | 'residence' | 'ticket' | 'dossier';
  description: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateSupplierDto {
  name: string;
  contact: string;
  phone: string;
  email: string;
  serviceTypes: string[];
}

export interface UpdateSupplierDto {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  serviceTypes?: string[];
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
}

export interface UpdateCommandDto {
  data?: Record<string, unknown>;
  status?: 'en_attente' | 'en_cours' | 'termine' | 'annule';
  destination?: string;
  sellingPrice?: number;
  amountPaid?: number;
  buyingPrice?: number;
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
}

export interface UploadDocumentDto {
  name: string;
  category: 'assurance' | 'cnas' | 'casnos' | 'autre';
  file: File;
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
}

export interface CommandFilters {
  status?: string;
  serviceId?: string;
  supplierId?: string;
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

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
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
      if (response.status === 401 && !isRetry) {
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
    });

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

  // ==================== SUPPLIERS ====================

  getSuppliers = (): Promise<Supplier[]> =>
    this.request('/suppliers');

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

  createSupplierTransaction = (data: CreateSupplierTransactionDto): Promise<SupplierTransaction> =>
    this.request('/supplier-transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  deleteSupplierTransaction = (id: string): Promise<void> =>
    this.request(`/supplier-transactions/${id}`, { method: 'DELETE' });

  // ==================== DOCUMENTS ====================

  getDocuments = (category?: string): Promise<Document[]> => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/documents${query}`);
  };

  uploadDocument = (data: UploadDocumentDto): Promise<Document> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('file', data.file);
    return this.requestWithFormData('/documents/upload', formData);
  };

  updateDocument = (id: string, data: { name?: string; category?: string }): Promise<Document> =>
    this.request(`/documents/${id}`, {
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

  // ==================== SEARCH ====================

  search = (query: string, limit?: number): Promise<SearchResult[]> =>
    this.request(`/search?q=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`);
}

export const api = new ApiClient();
export { ApiError };
