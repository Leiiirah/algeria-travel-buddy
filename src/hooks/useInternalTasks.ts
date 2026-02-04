import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateInternalTaskDto, UpdateInternalTaskDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export function useInternalTasks() {
  return useQuery({
    queryKey: ['internal-tasks'],
    queryFn: () => api.getInternalTasks(),
  });
}

export function useInternalTaskStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['internal-tasks', 'stats'],
    queryFn: () => api.getInternalTaskStats(),
    enabled,
  });
}

export function useInternalTask(id: string) {
  return useQuery({
    queryKey: ['internal-tasks', id],
    queryFn: () => api.getInternalTask(id),
    enabled: !!id,
  });
}

export function useCreateInternalTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('internalTasks');

  return useMutation({
    mutationFn: (data: CreateInternalTaskDto) => api.createInternalTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
      toast({
        title: t('toast.created'),
      });
    },
    onError: () => {
      toast({
        title: t('toast.error'),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateInternalTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('internalTasks');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInternalTaskDto }) =>
      api.updateInternalTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
      toast({
        title: t('toast.updated'),
      });
    },
    onError: () => {
      toast({
        title: t('toast.error'),
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteInternalTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('internalTasks');

  return useMutation({
    mutationFn: (id: string) => api.deleteInternalTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-tasks'] });
      toast({
        title: t('toast.deleted'),
      });
    },
    onError: () => {
      toast({
        title: t('toast.error'),
        variant: 'destructive',
      });
    },
  });
}
