import { User, Service, Supplier, Command, Payment, SupplierTransaction, Document } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// DTOs for API requests
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
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

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Restore token from localStorage on init
    this.token = localStorage.getItem('authToken');
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  private async requestWithFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
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

  refreshToken = (): Promise<{ accessToken: string }> =>
    this.request('/auth/refresh', { method: 'POST' });

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
  
  getPayments = (search?: string): Promise<Payment[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/payments${query}`);
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
}

export const api = new ApiClient();
export { ApiError };
