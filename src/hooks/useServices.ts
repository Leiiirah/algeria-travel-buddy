import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateServiceDto, UpdateServiceDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  });
};

export const useActiveServices = () => {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => api.getActiveServices(),
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => api.createService(data),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: 'Service créé',
        description: `Le service "${service.name}" a été ajouté avec succès`,
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

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      api.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: 'Service modifié',
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

export const useToggleServiceStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.toggleServiceStatus(id),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: service.isActive ? 'Service activé' : 'Service désactivé',
        description: `Le service "${service.name}" a été ${service.isActive ? 'activé' : 'désactivé'}`,
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
