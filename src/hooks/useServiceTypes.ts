import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateServiceTypeDto, UpdateServiceTypeDto } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ['serviceTypes'],
    queryFn: () => api.serviceTypes.getAll(),
  });
};

export const useActiveServiceTypes = () => {
  return useQuery({
    queryKey: ['serviceTypes', 'active'],
    queryFn: () => api.serviceTypes.getActive(),
  });
};

export const useCreateServiceType = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('serviceTypes');

  return useMutation({
    mutationFn: (data: CreateServiceTypeDto) => api.serviceTypes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTypes'] });
      toast.success(t('messages.created'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.createFailed'));
    },
  });
};

export const useUpdateServiceType = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('serviceTypes');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceTypeDto }) =>
      api.serviceTypes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTypes'] });
      toast.success(t('messages.updated'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.updateFailed'));
    },
  });
};

export const useToggleServiceTypeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.serviceTypes.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTypes'] });
    },
  });
};

export const useDeleteServiceType = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('serviceTypes');

  return useMutation({
    mutationFn: (id: string) => api.serviceTypes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceTypes'] });
      toast.success(t('messages.deleted'));
    },
    onError: (error: any) => {
      toast.error(error.message || t('errors.deleteFailed'));
    },
  });
};
