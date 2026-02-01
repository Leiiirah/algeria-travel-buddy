import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierReceiptDto } from '@/lib/api';
import { toast } from 'sonner';

export function useSupplierReceipts(supplierId?: string, orderId?: string) {
  return useQuery({
    queryKey: ['supplier-receipts', supplierId, orderId],
    queryFn: () => api.getSupplierReceipts(supplierId, orderId),
  });
}

export function useSupplierReceiptStats() {
  return useQuery({
    queryKey: ['supplier-receipt-stats'],
    queryFn: () => api.getSupplierReceiptStats(),
  });
}

export function useCreateSupplierReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierReceiptDto) => api.createSupplierReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-receipt-stats'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-order-stats'] });
      toast.success('Reçu créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteSupplierReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSupplierReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-receipt-stats'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-order-stats'] });
      toast.success('Reçu supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
