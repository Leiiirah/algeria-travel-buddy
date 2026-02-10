import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PaymentType } from '@/types';

export const usePaymentTypes = () => {
  return useQuery({
    queryKey: ['payment-types'],
    queryFn: () => api.getPaymentTypes(),
  });
};

export const useCreatePaymentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { name: string }) => api.createPaymentType(data),
    onSuccess: (pt: PaymentType) => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      toast({
        title: 'Type de paiement ajouté',
        description: `"${pt.name}" a été créé avec succès`,
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

export const useUpdatePaymentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      api.updatePaymentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      toast({
        title: 'Type de paiement modifié',
        description: 'Les informations ont été mises à jour',
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

export const useDeletePaymentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deletePaymentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-types'] });
      toast({
        title: 'Type de paiement supprimé',
        description: 'Le type de paiement a été supprimé avec succès',
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
