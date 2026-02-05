import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.getDashboardStats(),
  });
};

export const useRevenueStats = (fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', fromDate, toDate],
    queryFn: () => api.getRevenueStats(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });
};

export const useSupplierStats = () => {
  return useQuery({
    queryKey: ['analytics', 'suppliers'],
    queryFn: () => api.getSupplierStats(),
  });
};

export const useServiceStats = () => {
  return useQuery({
    queryKey: ['analytics', 'services'],
    queryFn: () => api.getServiceStats(),
  });
};

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['analytics', 'employee-stats'],
    queryFn: () => api.getEmployeeStats(),
  });
};

export const useEmployeeCaisseStats = () => {
  return useQuery({
    queryKey: ['analytics', 'employee-caisses'],
    queryFn: () => api.getEmployeeCaisseStats(),
  });
};
