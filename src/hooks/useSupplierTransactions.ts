import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierTransactionDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useSupplierTransactions = () => {
  return useQuery({
    queryKey: ['supplier-transactions'],
    queryFn: () => api.getSupplierTransactions(),
  });
};

export const useSupplierTransactionsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ['supplier-transactions', 'supplier', supplierId],
    queryFn: () => api.getSupplierTransactionsBySupplier(supplierId),
    enabled: !!supplierId,
  });
};

export const useCreateSupplierTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateSupplierTransactionDto) => api.createSupplierTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Transaction enregistrée',
        description: 'La transaction a été ajoutée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSupplierTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteSupplierTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Transaction supprimée',
        description: 'La transaction a été supprimée avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
