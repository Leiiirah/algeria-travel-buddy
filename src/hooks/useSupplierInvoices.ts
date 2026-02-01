import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierInvoiceDto, UpdateSupplierInvoiceDto } from '@/lib/api';
import { toast } from 'sonner';

export function useSupplierInvoices(supplierId?: string, status?: string) {
  return useQuery({
    queryKey: ['supplier-invoices', supplierId, status],
    queryFn: () => api.getSupplierInvoices(supplierId, status),
  });
}

export function useSupplierInvoiceStats() {
  return useQuery({
    queryKey: ['supplier-invoice-stats'],
    queryFn: () => api.getSupplierInvoiceStats(),
  });
}

export function useCreateSupplierInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierInvoiceDto) => api.createSupplierInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-invoice-stats'] });
      toast.success('Facture créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateSupplierInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierInvoiceDto }) =>
      api.updateSupplierInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-invoice-stats'] });
      toast.success('Facture mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteSupplierInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSupplierInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-invoice-stats'] });
      toast.success('Facture supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
