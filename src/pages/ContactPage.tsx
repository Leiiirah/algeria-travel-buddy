import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgencySettings, useUpdateAgencySettings } from '@/hooks/useAgencySettings';
import { Skeleton } from '@/components/ui/skeleton';

const FIELDS = [
  { key: 'legalName', icon: '🏢' },
  { key: 'address', icon: '📍' },
  { key: 'phone', icon: '📞' },
  { key: 'mobilePhone', icon: '📱' },
  { key: 'email', icon: '✉️' },
  { key: 'nif', icon: '🔢' },
  { key: 'nis', icon: '🔢' },
  { key: 'articleFiscal', icon: '🔢' },
  { key: 'rc', icon: '📋' },
  { key: 'bankName', icon: '🏦' },
  { key: 'bankAccount', icon: '💳' },
  { key: 'licenseNumber', icon: '📄' },
  { key: 'arabicName', icon: '🕌', dir: 'rtl' as const },
  { key: 'arabicAddress', icon: '📍', dir: 'rtl' as const },
] as const;

export default function ContactPage() {
  const { t } = useTranslation('common');
  const { data: settings, isLoading } = useAgencySettings();
  const updateMutation = useUpdateAgencySettings();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const hasChanges = settings
    ? Object.keys(form).some((key) => form[key] !== settings[key])
    : false;

  return (
    <DashboardLayout title={t('contact.title')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('contact.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('contact.description')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('contact.agencyInfo')}
            </CardTitle>
            <CardDescription>{t('contact.agencyInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: FIELDS.length }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : (
              <>
                {FIELDS.map(({ key, icon, ...rest }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>
                      {icon} {t(`contact.fields.${key}`)}
                    </Label>
                    <Input
                      id={key}
                      value={form[key] || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      dir={'dir' in rest ? rest.dir : (key === 'email' ? 'ltr' : undefined)}
                    />
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('actions.save')}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
