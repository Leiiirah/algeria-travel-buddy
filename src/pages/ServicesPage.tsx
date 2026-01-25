import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Settings, FileText, Plane, Hotel, Folder } from 'lucide-react';
import { mockServices, getServiceTypeLabel } from '@/lib/mock-data';
import { Service, ServiceType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

const ServicesPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    type: 'visa' as ServiceType,
    description: '',
  });

  // Only admin can access this page
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'visa':
        return FileText;
      case 'residence':
        return Hotel;
      case 'ticket':
        return Plane;
      case 'dossier':
        return Folder;
      default:
        return FileText;
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.description) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    const service: Service = {
      id: String(services.length + 1),
      ...newService,
      isActive: true,
      createdAt: new Date(),
    };

    setServices([...services, service]);
    setNewService({ name: '', type: 'visa', description: '' });
    setIsDialogOpen(false);
    toast({
      title: 'Service ajouté',
      description: `Le service "${service.name}" a été créé avec succès`,
    });
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, isActive: !service.isActive } : service
      )
    );
    const service = services.find((s) => s.id === serviceId);
    toast({
      title: service?.isActive ? 'Service désactivé' : 'Service activé',
      description: `Le service "${service?.name}" a été ${
        service?.isActive ? 'désactivé' : 'activé'
      }`,
    });
  };

  return (
    <DashboardLayout
      title="Configuration des services"
      subtitle="Gérez les types de services proposés par l'agence"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            {services.filter((s) => s.isActive).length} services actifs sur{' '}
            {services.length}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Créer un service</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau type de service à votre catalogue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Nom du service</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Ex: Visa Schengen France"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Type de service</Label>
                <Select
                  value={newService.type}
                  onValueChange={(value: ServiceType) =>
                    setNewService({ ...newService, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="residence">Résidence / Hôtel</SelectItem>
                    <SelectItem value="ticket">Billetterie</SelectItem>
                    <SelectItem value="dossier">Traitement de dossier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  placeholder="Décrivez ce service..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddService}>Créer le service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const IconComponent = getServiceIcon(service.type);
          return (
            <Card
              key={service.id}
              className={`border-none shadow-sm transition-opacity ${
                !service.isActive ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getServiceTypeLabel(service.type)}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={() => toggleServiceStatus(service.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Créé le{' '}
                    {service.createdAt.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
