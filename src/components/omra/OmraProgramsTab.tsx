import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import { OmraProgram, OmraRoomType } from '@/types';
import { formatDZD } from '@/lib/utils';
import {
  useOmraPrograms,
  useActiveOmraHotels,
  useCreateOmraProgram,
  useUpdateOmraProgram,
  useDeleteOmraProgram,
  useOmraProgramInventory,
} from '@/hooks/useOmra';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/empty-state';

const roomTypes: OmraRoomType[] = ['chambre_1', 'chambre_2', 'chambre_3', 'chambre_4', 'chambre_5', 'suite'];

const defaultPricing: Record<string, number> = {
  chambre_1: 0,
  chambre_2: 0,
  chambre_3: 0,
  chambre_4: 0,
  chambre_5: 0,
  suite: 0,
};

export const OmraProgramsTab = () => {
  const { t } = useTranslation('omra');
  const { t: tCommon } = useTranslation('common');
  const { isAdmin } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<OmraProgram | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    periodFrom: '',
    periodTo: '',
    totalPlaces: 0,
    hotelId: '',
    pricing: { ...defaultPricing },
  });

  const { data: programs = [], isLoading } = useOmraPrograms();
  const { data: hotels = [] } = useActiveOmraHotels();
  const { data: inventory = [] } = useOmraProgramInventory();
  const createProgram = useCreateOmraProgram();
  const updateProgram = useUpdateOmraProgram();
  const deleteProgram = useDeleteOmraProgram();

  const resetForm = () => {
    setFormData({
      name: '',
      periodFrom: '',
      periodTo: '',
      totalPlaces: 0,
      hotelId: '',
      pricing: { ...defaultPricing },
    });
    setEditingProgram(null);
  };

  const handleOpenDialog = (program?: OmraProgram) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        periodFrom: new Date(program.periodFrom).toISOString().split('T')[0],
        periodTo: new Date(program.periodTo).toISOString().split('T')[0],
        totalPlaces: program.totalPlaces,
        hotelId: program.hotelId || '',
        pricing: { ...defaultPricing, ...(program.pricing || {}) },
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.periodFrom || !formData.periodTo || formData.totalPlaces <= 0) return;

    const payload = {
      name: formData.name,
      periodFrom: formData.periodFrom,
      periodTo: formData.periodTo,
      totalPlaces: formData.totalPlaces,
      hotelId: formData.hotelId || undefined,
      pricing: formData.pricing,
    };

    if (editingProgram) {
      updateProgram.mutate(
        { id: editingProgram.id, data: payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createProgram.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('programs.confirm.delete'))) {
      deleteProgram.mutate(id);
    }
  };

  const handleToggleActive = (program: OmraProgram) => {
    updateProgram.mutate({
      id: program.id,
      data: { isActive: !program.isActive },
    });
  };

  const handlePricingChange = (roomType: string, value: string) => {
    setFormData({
      ...formData,
      pricing: {
        ...formData.pricing,
        [roomType]: parseFloat(value) || 0,
      },
    });
  };

  const getInventory = (programId: string) => {
    return inventory.find((i) => i.programId === programId);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('programs.title')}</CardTitle>
              <CardDescription>{t('programs.count', { count: programs.length })}</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('programs.newProgram')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t('programs.empty.title')}
              description={t('programs.empty.description')}
              action={
                isAdmin
                  ? {
                      label: t('programs.empty.action'),
                      onClick: () => handleOpenDialog(),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('programs.table.name')}</TableHead>
                  <TableHead>{t('programs.table.period')}</TableHead>
                  <TableHead>{t('programs.table.hotel')}</TableHead>
                  <TableHead>{t('programs.table.totalPlaces')}</TableHead>
                  <TableHead>{t('programs.table.confirmed')}</TableHead>
                  <TableHead>{t('programs.table.remaining')}</TableHead>
                  <TableHead>{t('programs.table.status')}</TableHead>
                  {isAdmin && <TableHead className="w-[70px]">{t('programs.table.actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => {
                  const inv = getInventory(program.id);
                  const confirmed = inv?.confirmed ?? 0;
                  const remaining = inv ? inv.remaining : program.totalPlaces;

                  return (
                    <TableRow key={program.id}>
                      <TableCell>
                        <p className="font-medium">{program.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(program.periodFrom)}</p>
                          <p className="text-muted-foreground">→ {formatDate(program.periodTo)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{program.hotel?.name || '-'}</TableCell>
                      <TableCell>
                        <span className="font-medium">{program.totalPlaces}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                          {confirmed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-0 ${remaining > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {remaining}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Badge
                            className={`cursor-pointer border-0 ${program.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                            onClick={() => handleToggleActive(program)}
                          >
                            {program.isActive ? t('status.active') : t('status.inactive')}
                          </Badge>
                        ) : (
                          <Badge className={`border-0 ${program.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            {program.isActive ? t('status.active') : t('status.inactive')}
                          </Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(program)}>
                                <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                {tCommon('actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(program.id)}
                              >
                                <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                                {tCommon('actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog - Admin Only */}
      {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProgram ? t('programs.dialog.editTitle') : t('programs.dialog.createTitle')}
              </DialogTitle>
              <DialogDescription>
                {editingProgram
                  ? t('programs.dialog.editDescription')
                  : t('programs.dialog.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="programName">{t('programs.form.programName')} *</Label>
                <Input
                  id="programName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('programs.form.programNamePlaceholder')}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodFrom">{t('programs.form.periodFrom')} *</Label>
                  <Input
                    id="periodFrom"
                    type="date"
                    value={formData.periodFrom}
                    onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodTo">{t('programs.form.periodTo')} *</Label>
                  <Input
                    id="periodTo"
                    type="date"
                    value={formData.periodTo}
                    onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Total Places + Hotel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalPlaces">{t('programs.form.totalPlaces')} *</Label>
                  <Input
                    id="totalPlaces"
                    type="number"
                    min="1"
                    value={formData.totalPlaces}
                    onChange={(e) =>
                      setFormData({ ...formData, totalPlaces: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('programs.form.hotel')}</Label>
                  <Select
                    value={formData.hotelId || '__none__'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hotelId: value === '__none__' ? '' : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('programs.form.selectHotel')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t('programs.form.noHotel')}</SelectItem>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold">{t('programs.form.pricing')}</Label>
                  <p className="text-sm text-muted-foreground">{t('programs.form.pricingDescription')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomTypes.map((type) => (
                    <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Label className="min-w-[140px] text-sm">{t(`roomTypes.${type}`)}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.pricing[type] || 0}
                        onChange={(e) => handlePricingChange(type, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon('actions.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.name.trim() ||
                  !formData.periodFrom ||
                  !formData.periodTo ||
                  formData.totalPlaces <= 0 ||
                  createProgram.isPending ||
                  updateProgram.isPending
                }
              >
                {editingProgram ? tCommon('actions.save') : t('actions.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
