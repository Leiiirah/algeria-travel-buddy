import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useCaisseSettlements = (employeeId: string | null) => {
  return useQuery({
    queryKey: ['caisse-history', employeeId],
    queryFn: () => api.getCaisseSettlements(employeeId!),
    enabled: !!employeeId,
  });
};

export const useCreateCaisseSettlement = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');

  return useMutation({
    mutationFn: (data: { employeeId: string; newBalance?: number; notes?: string }) =>
      api.createCaisseSettlement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'employee-caisses'] });
      queryClient.invalidateQueries({ queryKey: ['caisse-history'] });
      toast.success(t('success'));
    },
    onError: () => {
      toast.error(t('error'));
    },
  });
};
