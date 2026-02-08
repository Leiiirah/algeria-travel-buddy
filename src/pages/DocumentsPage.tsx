import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Folder,
  FolderPlus,
  FolderOpen,
  Pencil,
  Search,
} from 'lucide-react';
import { DocumentNode } from '@/types';
import {
  useDocuments,
  useDocumentAncestors,
  useUploadDocument,
  useCreateFolder,
  useDeleteDocument,
  useUpdateDocument,
  getDocumentDownloadUrl,
} from '@/hooks/useDocuments';
import { DocumentBreadcrumbs } from '@/components/documents/DocumentBreadcrumbs';
import { DocumentsSkeleton } from '@/components/skeletons/DocumentsSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/contexts/AuthContext';

const DocumentsPage = () => {
  const { t, i18n } = useTranslation('documents');
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentNode | null>(null);
  const [renameTarget, setRenameTarget] = useState<DocumentNode | null>(null);

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [renameName, setRenameName] = useState('');

  // Data hooks
  const { data: nodes, isLoading, isError, error, refetch } = useDocuments(currentFolderId);
  const { data: ancestors = [] } = useDocumentAncestors(currentFolderId);
  const uploadDocument = useUploadDocument();
  const createFolder = useCreateFolder();
  const deleteDocument = useDeleteDocument();
  const updateDocument = useUpdateDocument();

  // Derive current folder name from ancestors or nodes
  const currentFolderName = currentFolderId
    ? ancestors.length > 0
      ? undefined // The last ancestor is the parent, not the current
      : undefined
    : undefined;

  // We need to find the current folder's name. Let's get it from ancestors endpoint logic:
  // ancestors returns PARENT folders, not current. We need a separate approach.
  // Instead, let's store the name when navigating.
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);

  const navigateToFolder = (folderId: string | null) => {
    if (folderId === null) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      setCurrentFolderId(folderId);
      // If navigating to a known ancestor, trim the path
      const ancestorIndex = folderPath.findIndex((f) => f.id === folderId);
      if (ancestorIndex !== -1) {
        setFolderPath(folderPath.slice(0, ancestorIndex + 1));
      }
    }
    setSearchQuery('');
  };

  const enterFolder = (folder: DocumentNode) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  // Filter nodes by search
  const filteredNodes = (nodes ?? []).filter((node) =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredNodes.filter((n) => n.type === 'folder');
  const files = filteredNodes.filter((n) => n.type === 'file');

  const handleUpload = () => {
    if (!newFileName || !selectedFile) return;

    uploadDocument.mutate(
      {
        name: newFileName,
        parentId: currentFolderId ?? undefined,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          setNewFileName('');
          setSelectedFile(null);
          setIsUploadOpen(false);
        },
      }
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    createFolder.mutate(
      {
        name: newFolderName.trim(),
        parentId: currentFolderId ?? undefined,
      },
      {
        onSuccess: () => {
          setNewFolderName('');
          setIsFolderOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDocument.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleRename = () => {
    if (!renameTarget || !renameName.trim()) return;
    updateDocument.mutate(
      { id: renameTarget.id, data: { name: renameName.trim() } },
      {
        onSuccess: () => {
          setRenameTarget(null);
          setRenameName('');
          setIsRenameOpen(false);
        },
      }
    );
  };

  const handleDownload = (docId: string) => {
    const url = getDocumentDownloadUrl(docId);
    window.open(url, '_blank');
  };

  const openRenameDialog = (node: DocumentNode) => {
    setRenameTarget(node);
    setRenameName(node.name);
    setIsRenameOpen(true);
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(
      i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR',
      { day: '2-digit', month: 'short', year: 'numeric' }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <DocumentsSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  const currentName = folderPath.length > 0 ? folderPath[folderPath.length - 1].name : undefined;
  const breadcrumbAncestors = folderPath.slice(0, -1);

  return (
    <DashboardLayout title={t('title')} subtitle={t('subtitle')}>
      {/* Breadcrumbs */}
      <div className="mb-4">
        <DocumentBreadcrumbs
          ancestors={breadcrumbAncestors}
          currentFolderName={currentName}
          onNavigate={navigateToFolder}
        />
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('filters.search')}
            className="ps-9"
          />
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            {/* New Folder */}
            <Dialog open={isFolderOpen} onOpenChange={setIsFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t('actions.newFolder')}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>{t('dialog.newFolderTitle')}</DialogTitle>
                  <DialogDescription>{t('dialog.newFolderDesc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('dialog.folderName')}</Label>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder={t('dialog.folderNamePlaceholder')}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFolderOpen(false)}>
                    {tCommon('actions.cancel')}
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={createFolder.isPending}>
                    {tCommon('actions.create')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Upload PDF */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                  {t('actions.upload')}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>{t('dialog.uploadTitle')}</DialogTitle>
                  <DialogDescription>{t('dialog.uploadDesc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('dialog.fileName')}</Label>
                    <Input
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder={t('dialog.fileNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('dialog.file')}</Label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : t('dialog.dropzone')}
                        </p>
                        <Input
                          type="file"
                          accept=".pdf"
                          className="mt-4"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                    {tCommon('actions.cancel')}
                  </Button>
                  <Button onClick={handleUpload} disabled={uploadDocument.isPending}>
                    {uploadDocument.isPending ? t('actions.uploading') : t('actions.upload')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredNodes.length === 0 ? (
        <EmptyState
          title={t('empty.title')}
          description={t('empty.description')}
          icon={FolderOpen}
        />
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                {t('list.folders')} ({folders.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="group cursor-pointer border shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                    onClick={() => enterFolder(folder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                          <Folder className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('table.updatedAt', { date: formatDate(folder.updatedAt) })}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameDialog(folder);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(folder);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                {t('list.files')} ({files.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className="group border shadow-sm transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                          <FileText className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t('table.updatedAt', { date: formatDate(file.updatedAt) })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(file.id)}
                        >
                          <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                          {t('actions.download')}
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openRenameDialog(file)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setDeleteTarget(file)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{t('dialog.renameTitle')}</DialogTitle>
            <DialogDescription>{t('dialog.renameDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{renameTarget?.type === 'folder' ? t('dialog.folderName') : t('dialog.fileName')}</Label>
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              {tCommon('actions.cancel')}
            </Button>
            <Button onClick={handleRename} disabled={updateDocument.isPending}>
              {t('actions.rename')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'folder'
                ? t('dialog.deleteFolderWarning')
                : t('dialog.deleteFileWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DocumentsPage;
