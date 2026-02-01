import { useState } from 'react';
import { AdvancedFilter } from '@/components/search/AdvancedFilter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Replace,
  Search,
  FolderOpen,
  Shield,
  Building,
  HelpCircle,
} from 'lucide-react';
import { getDocumentCategoryLabel } from '@/lib/utils';
import { DocumentCategory } from '@/types';
import { useDocuments, useUploadDocument, useDeleteDocument, getDocumentDownloadUrl } from '@/hooks/useDocuments';
import { DocumentsSkeleton } from '@/components/skeletons/DocumentsSkeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/contexts/AuthContext';

const DocumentsPage = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'autre' as DocumentCategory,
  });

  // React Query hooks
  const { data: documents, isLoading, isError, error, refetch } = useDocuments();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  const categories: { value: string; label: string; icon: React.ElementType }[] = [
    { value: 'all', label: 'Tous', icon: FolderOpen },
    { value: 'assurance', label: 'Assurance', icon: Shield },
    { value: 'cnas', label: 'CNAS', icon: Building },
    { value: 'casnos', label: 'CASNOS', icon: Building },
    { value: 'autre', label: 'Autre', icon: HelpCircle },
  ];

  const filteredDocuments = (documents ?? []).filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !filters.category ||
      filters.category === 'all' ||
      doc.category === filters.category;

    const matchesDate =
      (!filters.fromDate || new Date(doc.createdAt) >= new Date(filters.fromDate)) &&
      (!filters.toDate || new Date(doc.createdAt) <= new Date(filters.toDate));

    return matchesSearch && matchesCategory && matchesDate;
  });

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'assurance':
        return Shield;
      case 'cnas':
      case 'casnos':
        return Building;
      default:
        return FileText;
    }
  };

  const handleUpload = () => {
    if (!newDocument.name || !selectedFile) {
      return;
    }

    uploadDocument.mutate(
      {
        name: newDocument.name,
        category: newDocument.category,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          setNewDocument({ name: '', category: 'autre' });
          setSelectedFile(null);
          setIsDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (docId: string) => {
    deleteDocument.mutate(docId);
  };

  const handleDownload = (docId: string) => {
    const url = getDocumentDownloadUrl(docId);
    window.open(url, '_blank');
  };

  const documentsByCategory = categories.slice(1).map((cat) => ({
    ...cat,
    count: (documents ?? []).filter((d) => d.category === cat.value).length,
  }));

  if (isLoading) {
    return (
      <DashboardLayout title="Bibliothèque de documents" subtitle="Gestion électronique des documents (GED)">
        <DocumentsSkeleton />
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout title="Bibliothèque de documents" subtitle="Gestion électronique des documents (GED)">
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bibliothèque de documents" subtitle="Gestion électronique des documents (GED)">
      {/* Category Overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {documentsByCategory.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer border-none shadow-sm transition-all hover:shadow-md ${filters.category === cat.value ? 'ring-2 ring-primary' : ''
                }`}
              onClick={() => setFilters({ ...filters, category: cat.value })}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cat.count}</p>
                  <p className="text-sm text-muted-foreground">{cat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documents List */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {filteredDocuments.length} document(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-[450px]">
                <AdvancedFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  filters={filters}
                  onFilterChange={setFilters}
                  filterConfig={[
                    {
                      key: 'category',
                      label: 'Catégorie',
                      type: 'select',
                      options: categories.slice(1).map(c => ({ label: c.label, value: c.value })),
                    },
                    {
                      key: 'fromDate',
                      label: 'Date début',
                      type: 'date-range',
                    },
                    {
                      key: 'toDate',
                      label: 'Date fin',
                      type: 'date-range',
                    },
                  ]}
                />
              </div>
              {isAdmin && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Téléverser
                    </Button>
                  </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>Téléverser un document</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau document à la bibliothèque
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nom du document</Label>
                      <Input
                        value={newDocument.name}
                        onChange={(e) =>
                          setNewDocument({ ...newDocument, name: e.target.value })
                        }
                        placeholder="Ex: Attestation Assurance 2025"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select
                        value={newDocument.category}
                        onValueChange={(value: DocumentCategory) =>
                          setNewDocument({ ...newDocument, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="assurance">Assurance</SelectItem>
                          <SelectItem value="cnas">CNAS</SelectItem>
                          <SelectItem value="casnos">CASNOS</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fichier PDF</Label>
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            {selectedFile ? selectedFile.name : 'Glissez-déposez ou cliquez pour sélectionner'}
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
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleUpload} disabled={uploadDocument.isPending}>
                      {uploadDocument.isPending ? 'Téléversement...' : 'Téléverser'}
                    </Button>
                  </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <EmptyState
              title="Aucun document trouvé"
              description="Téléversez un document pour commencer"
              icon={FolderOpen}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => {
                const Icon = getCategoryIcon(doc.category);
                return (
                  <Card
                    key={doc.id}
                    className="group border shadow-sm transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                          <FileText className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <Badge variant="outline" className="mt-1">
                            {getDocumentCategoryLabel(doc.category)}
                          </Badge>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Mis à jour le{' '}
                            {new Date(doc.updatedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="outline" size="sm">
                              <Replace className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleteDocument.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DocumentsPage;
