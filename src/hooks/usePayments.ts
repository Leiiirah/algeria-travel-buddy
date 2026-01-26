import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreatePaymentDto, PaymentFilters } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const usePayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => api.getPayments(filters),
  });
};

export const usePaymentsByCommand = (commandId: string) => {
  return useQuery({
    queryKey: ['payments', 'command', commandId],
    queryFn: () => api.getPaymentsByCommand(commandId),
    enabled: !!commandId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePaymentDto) => api.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Paiement enregistré',
        description: 'Le paiement a été ajouté avec succès',
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

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: 'Paiement supprimé',
        description: 'Le paiement a été supprimé avec succès',
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
