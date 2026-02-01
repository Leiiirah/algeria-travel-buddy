import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateExpenseDto, UpdateExpenseDto, ExpenseFilters } from '@/lib/api';
import { Expense, ExpenseStats } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: () => api.getExpenses(filters),
  });
}

export function useExpenseStats() {
  return useQuery<ExpenseStats>({
    queryKey: ['expenses', 'stats'],
    queryFn: () => api.getExpenseStats(),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => api.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: 'Dépense créée',
        description: 'La dépense a été ajoutée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de créer la dépense.',
      });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      api.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: 'Dépense mise à jour',
        description: 'La dépense a été modifiée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de modifier la dépense.',
      });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: 'Dépense supprimée',
        description: 'La dépense a été supprimée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la dépense.',
      });
    },
  });
}
