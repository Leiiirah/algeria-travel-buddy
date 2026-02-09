import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types';

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => api.getCompanies(),
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { name: string }) => api.createCompany(data),
    onSuccess: (company: Company) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Compagnie ajoutée',
        description: `"${company.name}" a été créée avec succès`,
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

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      api.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Compagnie modifiée',
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

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Compagnie supprimée',
        description: 'La compagnie a été supprimée avec succès',
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
