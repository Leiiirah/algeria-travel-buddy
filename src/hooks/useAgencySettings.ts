import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useAgencySettings() {
  return useQuery({
    queryKey: ['agency-settings'],
    queryFn: () => api.getAgencySettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateAgencySettings() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      api.updateAgencySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-settings'] });
      toast.success(t('contact.saved'));
    },
    onError: () => {
      toast.error(t('errors.saveFailed'));
    },
  });
}
