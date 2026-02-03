import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateEmployeeTransactionDto, PaginatedResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Command } from '@/types';

export function useEmployeeTransactions() {
  return useQuery({
    queryKey: ['employee-transactions'],
    queryFn: () => api.getEmployeeTransactions(),
  });
}

export function useEmployeeTransactionsByEmployee(employeeId: string) {
  return useQuery({
    queryKey: ['employee-transactions', 'employee', employeeId],
    queryFn: () => api.getEmployeeTransactionsByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useEmployeeBalance(employeeId: string) {
  return useQuery({
    queryKey: ['employee-balance', employeeId],
    queryFn: () => api.getEmployeeBalance(employeeId),
    enabled: !!employeeId,
  });
}

export function useAllEmployeeBalances() {
  return useQuery({
    queryKey: ['employee-balances'],
    queryFn: () => api.getAllEmployeeBalances(),
  });
}

export function useCreateEmployeeTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateEmployeeTransactionDto) => api.createEmployeeTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['employee-balances'] });
      toast({
        title: 'Succès',
        description: 'Transaction enregistrée avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer la transaction",
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmployeeTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteEmployeeTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['employee-balances'] });
      toast({
        title: 'Succès',
        description: 'Transaction supprimée avec succès',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la transaction',
        variant: 'destructive',
      });
    },
  });
}

// Admin-only hooks for viewing employee activity
export function useEmployeeCommands(employeeId: string) {
  return useQuery<PaginatedResponse<Command>>({
    queryKey: ['employee-commands', employeeId],
    queryFn: () => api.getCommandsByEmployee(employeeId),
    enabled: !!employeeId,
  });
}

export function useEmployeeStatsById(employeeId: string) {
  return useQuery({
    queryKey: ['employee-stats-by-id', employeeId],
    queryFn: () => api.getEmployeeStatsById(employeeId),
    enabled: !!employeeId,
  });
}
