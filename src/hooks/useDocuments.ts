import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, UploadDocumentDto, CreateFolderDto, MoveNodeDto } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useDocuments = (parentId?: string | null) => {
  return useQuery({
    queryKey: ['documents', parentId ?? 'root'],
    queryFn: () => api.getDocuments(parentId ?? undefined),
  });
};

export const useDocumentAncestors = (folderId: string | null) => {
  return useQuery({
    queryKey: ['document-ancestors', folderId],
    queryFn: () => api.getDocumentAncestors(folderId!),
    enabled: !!folderId,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateFolderDto) => api.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Dossier créé',
        description: 'Le dossier a été créé avec succès',
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

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UploadDocumentDto) => api.uploadDocument(data),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document ajouté',
        description: `Le document "${doc.name}" a été uploadé avec succès`,
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

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) =>
      api.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Document modifié',
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

export const useMoveDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveNodeDto }) =>
      api.moveDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Élément déplacé',
        description: "L'élément a été déplacé avec succès",
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

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'Supprimé',
        description: "L'élément a été supprimé avec succès",
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

export const getDocumentDownloadUrl = (id: string): string => {
  return api.getDocumentDownloadUrl(id);
};
