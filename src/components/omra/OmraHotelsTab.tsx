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
import { Plus, MoreHorizontal, Edit, Trash2, Building2 } from 'lucide-react';
import { OmraHotel } from '@/types';
import {
  useOmraHotels,
  useCreateOmraHotel,
  useUpdateOmraHotel,
  useDeleteOmraHotel,
} from '@/hooks/useOmra';
import { EmptyState } from '@/components/ui/empty-state';

export const OmraHotelsTab = () => {
  const { t } = useTranslation('omra');
  const { t: tCommon } = useTranslation('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<OmraHotel | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '' });

  const { data: hotels = [], isLoading } = useOmraHotels();
  const createHotel = useCreateOmraHotel();
  const updateHotel = useUpdateOmraHotel();
  const deleteHotel = useDeleteOmraHotel();

  const resetForm = () => {
    setFormData({ name: '', location: '' });
    setEditingHotel(null);
  };

  const handleOpenDialog = (hotel?: OmraHotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({ name: hotel.name, location: hotel.location || '' });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingHotel) {
      updateHotel.mutate(
        { id: editingHotel.id, data: formData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createHotel.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('hotels.confirm.delete'))) {
      deleteHotel.mutate(id);
    }
  };

  const handleToggleStatus = (hotel: OmraHotel) => {
    updateHotel.mutate({
      id: hotel.id,
      data: { isActive: !hotel.isActive },
    });
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
              <CardTitle>{t('hotels.title')}</CardTitle>
              <CardDescription>{t('hotels.count', { count: hotels.length })}</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('hotels.newHotel')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hotels.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t('hotels.empty.title')}
              description={t('hotels.empty.description')}
              action={{
                label: t('hotels.empty.action'),
                onClick: () => handleOpenDialog(),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('hotels.table.name')}</TableHead>
                  <TableHead>{t('hotels.table.location')}</TableHead>
                  <TableHead>{t('hotels.table.status')}</TableHead>
                  <TableHead className="w-[70px]">{t('hotels.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.location || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={hotel.isActive ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(hotel)}
                      >
                        {hotel.isActive ? t('status.active') : t('status.inactive')}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(hotel)}>
                            <Edit className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                            {tCommon('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(hotel.id)}
                          >
                            <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                            {tCommon('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHotel ? t('hotels.dialog.editTitle') : t('hotels.dialog.createTitle')}</DialogTitle>
            <DialogDescription>
              {editingHotel
                ? t('hotels.dialog.editDescription')
                : t('hotels.dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('hotels.form.hotelName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('hotels.form.hotelPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t('hotels.form.location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('hotels.form.locationPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tCommon('actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || createHotel.isPending || updateHotel.isPending}
            >
              {editingHotel ? tCommon('actions.save') : t('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
