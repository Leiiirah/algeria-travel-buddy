import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { api, CreateClientInvoiceDto, UpdateClientInvoiceDto, ClientInvoiceFilters } from '@/lib/api';

export function useClientInvoices(filters?: ClientInvoiceFilters) {
  return useQuery({
    queryKey: ['client-invoices', filters],
    queryFn: () => api.getClientInvoices(filters),
  });
}

export function useClientInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['client-invoices', id],
    queryFn: () => api.getClientInvoice(id!),
    enabled: !!id,
  });
}

export function useClientInvoiceStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['client-invoices', 'stats'],
    queryFn: () => api.getClientInvoiceStats(),
    enabled,
  });
}

export function useClientInvoicesByCommand(commandId: string | undefined) {
  return useQuery({
    queryKey: ['client-invoices', 'command', commandId],
    queryFn: () => api.getClientInvoicesByCommand(commandId!),
    enabled: !!commandId,
  });
}

export function useCreateClientInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('invoices');

  return useMutation({
    mutationFn: (data: CreateClientInvoiceDto) => api.createClientInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-invoices'] });
      toast.success(t('messages.created'));
    },
    onError: () => {
      toast.error(t('messages.error'));
    },
  });
}

export function useCreateClientInvoiceFromCommand() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('invoices');

  return useMutation({
    mutationFn: ({ commandId, type }: { commandId: string; type: 'proforma' | 'finale' }) =>
      api.createClientInvoiceFromCommand(commandId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-invoices'] });
      toast.success(t('messages.created'));
    },
    onError: () => {
      toast.error(t('messages.error'));
    },
  });
}

export function useUpdateClientInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('invoices');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInvoiceDto }) =>
      api.updateClientInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-invoices'] });
      toast.success(t('messages.updated'));
    },
    onError: () => {
      toast.error(t('messages.error'));
    },
  });
}

export function useDeleteClientInvoice() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('invoices');

  return useMutation({
    mutationFn: (id: string) => api.deleteClientInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-invoices'] });
      toast.success(t('messages.deleted'));
    },
    onError: () => {
      toast.error(t('messages.error'));
    },
  });
}
