import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  api,
  CreateOmraHotelDto,
  UpdateOmraHotelDto,
  CreateOmraOrderDto,
  UpdateOmraOrderDto,
  CreateOmraVisaDto,
  UpdateOmraVisaDto,
  CreateOmraProgramDto,
  UpdateOmraProgramDto,
  OmraFilters,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// ==================== HOTELS ====================

export const useOmraHotels = () => {
  return useQuery({
    queryKey: ['omra', 'hotels'],
    queryFn: () => api.getOmraHotels(),
  });
};

export const useActiveOmraHotels = () => {
  return useQuery({
    queryKey: ['omra', 'hotels', 'active'],
    queryFn: () => api.getActiveOmraHotels(),
  });
};

export const useCreateOmraHotel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOmraHotelDto) => api.createOmraHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'hotels'] });
      toast({
        title: 'Hôtel créé',
        description: 'Le nouvel hôtel a été enregistré',
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

export const useUpdateOmraHotel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOmraHotelDto }) =>
      api.updateOmraHotel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'hotels'] });
      toast({
        title: 'Hôtel modifié',
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

export const useDeleteOmraHotel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteOmraHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'hotels'] });
      toast({
        title: 'Hôtel supprimé',
        description: "L'hôtel a été supprimé avec succès",
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

// ==================== ORDERS ====================

export const useOmraOrders = (filters?: OmraFilters) => {
  return useQuery({
    queryKey: ['omra', 'orders', filters],
    queryFn: () => api.getOmraOrders(filters),
    placeholderData: keepPreviousData,
  });
};

export const useOmraOrder = (id: string) => {
  return useQuery({
    queryKey: ['omra', 'orders', id],
    queryFn: () => api.getOmraOrder(id),
    enabled: !!id,
  });
};

export const useCreateOmraOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOmraOrderDto) => api.createOmraOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
      toast({
        title: 'Commande Omra créée',
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

export const useUpdateOmraOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOmraOrderDto }) =>
      api.updateOmraOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
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

export const useUpdateOmraOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOmraOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'orders'] });
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

export const useDeleteOmraOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteOmraOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
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

// ==================== VISAS ====================

export const useOmraVisas = (filters?: OmraFilters) => {
  return useQuery({
    queryKey: ['omra', 'visas', filters],
    queryFn: () => api.getOmraVisas(filters),
    placeholderData: keepPreviousData,
  });
};

export const useOmraVisa = (id: string) => {
  return useQuery({
    queryKey: ['omra', 'visas', id],
    queryFn: () => api.getOmraVisa(id),
    enabled: !!id,
  });
};

export const useCreateOmraVisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOmraVisaDto) => api.createOmraVisa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'visas'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
      toast({
        title: 'Visa Omra créé',
        description: 'Le nouveau visa a été enregistré',
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

export const useUpdateOmraVisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOmraVisaDto }) =>
      api.updateOmraVisa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'visas'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
      toast({
        title: 'Visa modifié',
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

export const useUpdateOmraVisaStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOmraVisaStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'visas'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut du visa a été modifié',
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

export const useDeleteOmraVisa = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteOmraVisa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'visas'] });
      queryClient.invalidateQueries({ queryKey: ['omra', 'stats'] });
      toast({
        title: 'Visa supprimé',
        description: 'Le visa a été supprimé avec succès',
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

// ==================== STATS ====================

export const useOmraStats = () => {
  return useQuery({
    queryKey: ['omra', 'stats'],
    queryFn: () => api.getOmraStats(),
  });
};

// ==================== PROGRAMS ====================

export const useOmraPrograms = () => {
  return useQuery({
    queryKey: ['omra', 'programs'],
    queryFn: () => api.getOmraPrograms(),
  });
};

export const useActiveOmraPrograms = () => {
  return useQuery({
    queryKey: ['omra', 'programs', 'active'],
    queryFn: () => api.getActiveOmraPrograms(),
  });
};

export const useOmraProgramInventory = () => {
  return useQuery({
    queryKey: ['omra', 'programs', 'inventory'],
    queryFn: () => api.getOmraProgramInventory(),
  });
};

export const useCreateOmraProgram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOmraProgramDto) => api.createOmraProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'programs'] });
      toast({
        title: 'Programme créé',
        description: 'Le nouveau programme a été enregistré',
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

export const useUpdateOmraProgram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOmraProgramDto }) =>
      api.updateOmraProgram(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'programs'] });
      toast({
        title: 'Programme modifié',
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

export const useDeleteOmraProgram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteOmraProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omra', 'programs'] });
      toast({
        title: 'Programme supprimé',
        description: 'Le programme a été supprimé avec succès',
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
