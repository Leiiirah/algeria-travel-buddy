import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api, CreateCommandDto, UpdateCommandDto, CommandFilters } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useCommands = (filters?: CommandFilters) => {
  return useQuery({
    queryKey: ['commands', filters],
    queryFn: () => api.getCommands(filters),
    placeholderData: keepPreviousData,
  });
};

export const useCommand = (id: string) => {
  return useQuery({
    queryKey: ['commands', id],
    queryFn: () => api.getCommand(id),
    enabled: !!id,
  });
};

export const useCommandStats = () => {
  return useQuery({
    queryKey: ['commands', 'stats'],
    queryFn: () => api.getCommandStats(),
  });
};

export const useCreateCommand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCommandDto) => api.createCommand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'employee-stats'] });
      toast({
        title: 'Commande créée',
        description: 'La nouvelle commande a été enregistrée',
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

export const useUpdateCommand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommandDto }) =>
      api.updateCommand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'employee-stats'] });
      toast({
        title: 'Commande modifiée',
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

export const useUpdateCommandStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateCommandStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de la commande a été modifié',
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

export const useDeleteCommand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'employee-stats'] });
      toast({
        title: 'Commande supprimée',
        description: 'La commande a été supprimée avec succès',
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
