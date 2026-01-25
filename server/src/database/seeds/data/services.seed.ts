import { ServiceType } from '../../../services/entities/service.entity';

export const servicesSeedData = [
  {
    name: 'Visa Schengen',
    type: ServiceType.VISA,
    description: 'Traitement des demandes de visa Schengen pour tous les pays de l\'espace Schengen',
    isActive: true,
  },
  {
    name: 'Visa USA',
    type: ServiceType.VISA,
    description: 'Traitement des demandes de visa américain (B1/B2, tourisme, affaires)',
    isActive: true,
  },
  {
    name: 'Réservation Hôtel',
    type: ServiceType.RESIDENCE,
    description: 'Réservation d\'hôtels et hébergements pour tous vos voyages',
    isActive: true,
  },
  {
    name: 'Billets d\'avion',
    type: ServiceType.TICKET,
    description: 'Achat et réservation de billets d\'avion nationaux et internationaux',
    isActive: true,
  },
  {
    name: 'Traitement Dossier',
    type: ServiceType.DOSSIER,
    description: 'Traitement de dossiers administratifs et légalisation de documents',
    isActive: true,
  },
];
