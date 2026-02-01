import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierOrderDto, UpdateSupplierOrderDto } from '@/lib/api';
import { toast } from 'sonner';

export function useSupplierOrders(supplierId?: string) {
  return useQuery({
    queryKey: ['supplier-orders', supplierId],
    queryFn: () => api.getSupplierOrders(supplierId),
  });
}

export function useSupplierOrderStats() {
  return useQuery({
    queryKey: ['supplier-order-stats'],
    queryFn: () => api.getSupplierOrderStats(),
  });
}

export function useCreateSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierOrderDto) => api.createSupplierOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-order-stats'] });
      toast.success('Commande créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierOrderDto }) =>
      api.updateSupplierOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-order-stats'] });
      toast.success('Commande mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSupplierOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-order-stats'] });
      toast.success('Commande supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
