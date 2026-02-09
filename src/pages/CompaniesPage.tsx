import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { Company } from '@/types';
import { ErrorState } from '@/components/ui/error-state';

const CompaniesPage = () => {
  const { t } = useTranslation('common');
  const { data: companies, isLoading, isError, error, refetch } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = () => {
    if (!companyName.trim()) return;

    if (editingCompany) {
      updateCompany.mutate(
        { id: editingCompany.id, data: { name: companyName } },
        { onSuccess: () => closeDialog() }
      );
    } else {
      createCompany.mutate(
        { name: companyName },
        { onSuccess: () => closeDialog() }
      );
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setCompanyName(company.name);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (company: Company) => {
    updateCompany.mutate({ id: company.id, data: { isActive: !company.isActive } });
  };

  const handleDelete = (id: string) => {
    deleteCompany.mutate(id);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCompany(null);
    setCompanyName('');
  };

  if (isError) {
    return (
      <DashboardLayout title={t('navigation.companies')} subtitle={t('companies.subtitle')}>
        <ErrorState message={error?.message} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('navigation.companies')} subtitle={t('companies.subtitle')}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('navigation.companies')}</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('companies.add')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('companies.name')}</TableHead>
                <TableHead>{t('companies.status')}</TableHead>
                <TableHead className="w-[80px]">{t('actions.label')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : companies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {t('empty.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                companies?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant={company.isActive ? 'default' : 'secondary'}>
                        {company.isActive ? t('status.active') : t('status.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(company)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(company)}>
                            {company.isActive ? (
                              <ToggleLeft className="h-4 w-4 mr-2" />
                            ) : (
                              <ToggleRight className="h-4 w-4 mr-2" />
                            )}
                            {company.isActive ? t('companies.deactivate') : t('companies.activate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(company.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? t('companies.edit') : t('companies.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('companies.name')}</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t('companies.namePlaceholder')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!companyName.trim() || createCompany.isPending || updateCompany.isPending}
            >
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CompaniesPage;
