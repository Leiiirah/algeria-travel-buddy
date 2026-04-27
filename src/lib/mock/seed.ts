// Seed data for the in-memory mock store.
// Designed for full referential integrity and broad UI-state coverage.

import { store, markSeeded, isSeeded } from './store';
import { uid, daysAgo, daysFromNow } from './helpers';
import type {
  User,
  Service,
  ServiceTypeEntity,
  Supplier,
  Command,
  CommandStatus,
  Payment,
  PaymentMethod,
  SupplierTransaction,
  DocumentNode,
  OmraHotel,
  OmraOrder,
  OmraVisa,
  OmraProgram,
  OmraStatus,
  OmraRoomType,
  OmraOrderType,
  EmployeeTransaction,
  Expense,
  ExpenseCategory,
  SupplierOrder,
  SupplierOrderStatus,
  SupplierReceipt,
  SupplierInvoice,
  SupplierInvoiceStatus,
  InternalTask,
  TaskPriority,
  TaskStatus,
  TaskVisibility,
  ClientInvoice,
  ClientInvoiceType,
  ClientInvoiceStatus,
  Company,
  PaymentType,
} from '@/types';

export function seed() {
  if (isSeeded()) return;

  // ==================== USERS ====================
  const adminId = uid();
  const employeeId = uid();
  const admin: User = {
    id: adminId,
    email: 'admin@demo.com',
    firstName: 'Sara',
    lastName: 'Admin',
    role: 'admin',
    createdAt: daysAgo(180),
    isActive: true,
  };
  const employee: User = {
    id: employeeId,
    email: 'employee@demo.com',
    firstName: 'Karim',
    lastName: 'Employee',
    role: 'employee',
    createdAt: daysAgo(120),
    isActive: true,
  };
  // A second employee with no assignments to exercise empty-state UI
  const idleEmployee: User = {
    id: uid(),
    email: 'leila@demo.com',
    firstName: 'Leila',
    lastName: 'Mansouri',
    role: 'employee',
    createdAt: daysAgo(60),
    isActive: true,
  };
  store.users.push(admin, employee, idleEmployee);

  // ==================== SERVICE TYPES ====================
  const stVisa: ServiceTypeEntity = {
    id: uid(),
    code: 'visa',
    nameFr: 'Visa',
    nameAr: 'تأشيرة',
    icon: 'FileCheck',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stTicket: ServiceTypeEntity = {
    id: uid(),
    code: 'ticket',
    nameFr: 'Billet',
    nameAr: 'تذكرة',
    icon: 'Plane',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stResidence: ServiceTypeEntity = {
    id: uid(),
    code: 'residence',
    nameFr: 'Hébergement',
    nameAr: 'إقامة',
    icon: 'Hotel',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stDossier: ServiceTypeEntity = {
    id: uid(),
    code: 'dossier',
    nameFr: 'Dossier',
    nameAr: 'ملف',
    icon: 'Folder',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stBilletBateau: ServiceTypeEntity = {
    id: uid(),
    code: 'billet_bateau',
    nameFr: 'Billet bateau',
    nameAr: 'تذكرة باخرة',
    icon: 'Ship',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stBilletTilex: ServiceTypeEntity = {
    id: uid(),
    code: 'billet_tilex',
    nameFr: 'Billet Tilex',
    nameAr: 'تذكرة تيلكس',
    icon: 'Train',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  const stBillets: ServiceTypeEntity = {
    id: uid(),
    code: 'billets',
    nameFr: 'Billets divers',
    nameAr: 'تذاكر متنوعة',
    icon: 'Tickets',
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(180),
  };
  store.serviceTypes.push(
    stVisa,
    stTicket,
    stResidence,
    stDossier,
    stBilletBateau,
    stBilletTilex,
    stBillets,
  );

  // ==================== SUPPLIERS ====================
  const supVisa: Supplier = {
    id: uid(),
    name: 'Global Visa Partners',
    type: 'visa',
    country: 'France',
    city: 'Paris',
    phone: '+33 1 23 45 67 89',
    email: 'contact@globalvisa.demo',
    contact: 'Pierre Lambert',
    currency: 'EUR',
    bankAccount: 'FR76 3000 6000 0112 3456 7890 189',
    isActive: true,
    createdAt: daysAgo(150),
  };
  const supAirline1: Supplier = {
    id: uid(),
    name: 'SkyJet Airlines',
    type: 'airline',
    country: 'Algeria',
    city: 'Alger',
    phone: '+213 21 50 60 70',
    email: 'b2b@skyjet.demo',
    contact: 'Yacine Belhadj',
    currency: 'DZD',
    bankAccount: 'DZ58 0040 0001 1234 5678 9012',
    isActive: true,
    createdAt: daysAgo(140),
  };
  const supAirline2: Supplier = {
    id: uid(),
    name: 'Mediterranean Air',
    type: 'airline',
    country: 'France',
    city: 'Marseille',
    phone: '+33 4 91 23 45 67',
    email: 'sales@medair.demo',
    contact: 'Sophie Marchand',
    currency: 'EUR',
    isActive: true,
    createdAt: daysAgo(135),
  };
  const supHotel: Supplier = {
    id: uid(),
    name: 'Royal Stay Hotels',
    type: 'hotel',
    country: 'Turkey',
    city: 'Istanbul',
    phone: '+90 212 555 0100',
    email: 'reservations@royalstay.demo',
    contact: 'Mehmet Demir',
    currency: 'EUR',
    isActive: true,
    createdAt: daysAgo(130),
  };
  const supTransport: Supplier = {
    id: uid(),
    name: 'Express Ferries',
    type: 'transport',
    country: 'Algeria',
    city: 'Oran',
    phone: '+213 41 30 40 50',
    email: 'booking@expressferries.demo',
    contact: 'Hamid Saidi',
    currency: 'DZD',
    isActive: true,
    createdAt: daysAgo(110),
  };
  const supInsurance: Supplier = {
    id: uid(),
    name: 'TravelSafe Insurance',
    type: 'insurance',
    country: 'France',
    city: 'Lyon',
    phone: '+33 4 72 00 10 20',
    email: 'partners@travelsafe.demo',
    contact: 'Camille Rousseau',
    currency: 'EUR',
    isActive: true,
    createdAt: daysAgo(100),
  };
  // Inactive supplier for admin toggle UI
  const supInactive: Supplier = {
    id: uid(),
    name: 'Old Routes Travel',
    type: 'other',
    country: 'Tunisia',
    city: 'Tunis',
    phone: '+216 71 12 34 56',
    email: 'info@oldroutes.demo',
    contact: 'Rachid Ben Ali',
    currency: 'EUR',
    isActive: false,
    createdAt: daysAgo(90),
  };
  // Empty supplier (no transactions) – exercises empty-state UI
  const supEmpty: Supplier = {
    id: uid(),
    name: 'New Horizons Travel',
    type: 'other',
    country: 'Algeria',
    city: 'Constantine',
    phone: '+213 31 99 88 77',
    email: 'hello@newhorizons.demo',
    contact: 'Amira Cherif',
    currency: 'DZD',
    isActive: true,
    createdAt: daysAgo(15),
  };
  store.suppliers.push(
    supVisa,
    supAirline1,
    supAirline2,
    supHotel,
    supTransport,
    supInsurance,
    supInactive,
    supEmpty,
  );

  // ==================== SERVICES ====================
  const svcSchengen: Service = {
    id: uid(),
    name: 'Visa Schengen',
    type: 'visa',
    description: 'Traitement complet du dossier visa Schengen',
    isActive: true,
    defaultSupplierId: supVisa.id,
    defaultBuyingPrice: 18000,
    createdAt: daysAgo(120),
  };
  const svcUSA: Service = {
    id: uid(),
    name: 'Visa USA',
    type: 'visa',
    description: 'Traitement de visa touristique pour les États-Unis',
    isActive: true,
    defaultSupplierId: supVisa.id,
    defaultBuyingPrice: 25000,
    createdAt: daysAgo(115),
  };
  const svcFlight: Service = {
    id: uid(),
    name: 'Billet d\'avion',
    type: 'ticket',
    description: 'Réservation et émission de billets d\'avion',
    isActive: true,
    defaultSupplierId: supAirline1.id,
    defaultBuyingPrice: 45000,
    createdAt: daysAgo(110),
  };
  const svcFerry: Service = {
    id: uid(),
    name: 'Billet bateau',
    type: 'ticket',
    description: 'Billets de traversée maritime Algérie ↔ Europe',
    isActive: true,
    defaultSupplierId: supTransport.id,
    defaultBuyingPrice: 35000,
    createdAt: daysAgo(100),
  };
  const svcHotel: Service = {
    id: uid(),
    name: 'Réservation Hôtel',
    type: 'residence',
    description: 'Réservation de chambres d\'hôtel à l\'étranger',
    isActive: true,
    defaultSupplierId: supHotel.id,
    defaultBuyingPrice: 22000,
    createdAt: daysAgo(95),
  };
  const svcDossier: Service = {
    id: uid(),
    name: 'Constitution dossier consulat',
    type: 'dossier',
    description: 'Préparation et dépôt de dossiers consulaires',
    isActive: true,
    defaultBuyingPrice: 8000,
    createdAt: daysAgo(80),
  };
  store.services.push(
    svcSchengen,
    svcUSA,
    svcFlight,
    svcFerry,
    svcHotel,
    svcDossier,
  );

  // ==================== COMPANIES (transport) ====================
  const companyData = [
    'SkyJet Airlines',
    'Mediterranean Air',
    'Algeria Wings',
    'Express Ferries',
    'BlueSea Lines',
  ];
  companyData.forEach((name, i) => {
    const c: Company = {
      id: uid(),
      name,
      isActive: true,
      createdAt: daysAgo(120 - i * 5),
      updatedAt: daysAgo(120 - i * 5),
    };
    store.companies.push(c);
  });

  // ==================== PAYMENT TYPES ====================
  ['Espèces', 'Virement bancaire', 'Chèque', 'Carte Edahabia', 'Carte CIB'].forEach(
    (name, i) => {
      const pt: PaymentType = {
        id: uid(),
        name,
        isActive: true,
        createdAt: daysAgo(150 - i),
        updatedAt: daysAgo(150 - i),
      };
      store.paymentTypes.push(pt);
    },
  );

  // ==================== COMMANDS ====================
  // Distribution: cover every CommandStatus and every service type, plus
  // mix of creators/assignees (admin + Karim, none assigned to Leila so we
  // also have empty-state for her).
  const commandStatuses: CommandStatus[] = [
    'dossier_incomplet',
    'depose',
    'en_traitement',
    'accepte',
    'refuse',
    'visa_delivre',
    'retire',
  ];

  const clientNames = [
    { first: 'Ahmed', last: 'Benali', phone: '0555 11 22 33' },
    { first: 'Fatima', last: 'Zerrouki', phone: '0661 22 33 44' },
    { first: 'Mohamed', last: 'Khaled', phone: '0770 33 44 55' },
    { first: 'Yasmine', last: 'Bouazza', phone: '0540 44 55 66' },
    { first: 'Omar', last: 'Hamadi', phone: '0555 55 66 77' },
    { first: 'Nadia', last: 'Cherif', phone: '0661 66 77 88' },
    { first: 'Rachid', last: 'Boumediene', phone: '0770 77 88 99' },
    { first: 'Samira', last: 'Lakhdari', phone: '0540 88 99 00' },
    { first: 'Karim', last: 'Belkacem', phone: '0555 99 00 11' },
    { first: 'Imane', last: 'Saadi', phone: '0661 00 11 22' },
    { first: 'Sofiane', last: 'Boudiaf', phone: '0770 11 22 33' },
    { first: 'Lilia', last: 'Hamdi', phone: '0540 22 33 44' },
    { first: 'Walid', last: 'Mokrani', phone: '0555 33 44 55' },
    { first: 'Sabrina', last: 'Tahar', phone: '0661 44 55 66' },
    { first: 'Bilal', last: 'Ferhat', phone: '0770 55 66 77' },
    { first: 'Hanane', last: 'Yacine', phone: '0540 66 77 88' },
    { first: 'Anis', last: 'Salhi', phone: '0555 77 88 99' },
    { first: 'Asma', last: 'Mahmoudi', phone: '0661 88 99 00' },
    { first: 'Hicham', last: 'Belghoul', phone: '0770 99 00 11' },
    { first: 'Souad', last: 'Aoudia', phone: '0540 00 11 22' },
    { first: 'Mounir', last: 'Larbi', phone: '0555 12 23 34' },
    { first: 'Khadija', last: 'Saoudi', phone: '0661 23 34 45' },
    { first: 'Tarek', last: 'Kheloufi', phone: '0770 34 45 56' },
    { first: 'Amina', last: 'Bensalem', phone: '0540 45 56 67' },
    { first: 'Mehdi', last: 'Chentouf', phone: '0555 56 67 78' },
    { first: 'Rym', last: 'Daoudi', phone: '0661 67 78 89' },
    { first: 'Salim', last: 'Kebir', phone: '0770 78 89 90' },
  ];

  const services = [svcSchengen, svcUSA, svcFlight, svcFerry, svcHotel, svcDossier];
  const supplierForService = (svcType: string) => {
    if (svcType === 'visa') return supVisa.id;
    if (svcType === 'ticket') return supAirline1.id;
    if (svcType === 'residence') return supHotel.id;
    return supVisa.id;
  };

  const destinations = ['Paris', 'Istanbul', 'Marseille', 'Dubai', 'Tunis', 'Le Caire', 'Madrid', 'Rome'];

  for (let i = 0; i < clientNames.length; i++) {
    const c = clientNames[i];
    const svc = services[i % services.length];
    const status = commandStatuses[i % commandStatuses.length];
    const buyingPrice = (svc.defaultBuyingPrice ?? 20000) + (i % 5) * 1000;
    const sellingPrice = buyingPrice + 5000 + (i % 4) * 1500; // always > buying
    // Vary paid amount: some fully paid, some partial, some unpaid.
    const paidRatio =
      status === 'retire' || status === 'visa_delivre'
        ? 1
        : status === 'accepte'
          ? 0.7
          : status === 'refuse'
            ? 0.5
            : i % 3 === 0
              ? 0
              : i % 3 === 1
                ? 0.4
                : 1;
    const amountPaid = Math.round(sellingPrice * paidRatio);
    const created = daysAgo(60 - i * 2);
    const updated = daysAgo(Math.max(0, 60 - i * 2 - 1));
    const creatorId = i % 4 === 0 ? employeeId : adminId;
    const assignedId = i % 3 === 0 ? employeeId : i % 3 === 1 ? adminId : undefined;

    let data: Command['data'];
    if (svc.type === 'visa') {
      data = {
        type: 'visa',
        clientFullName: `${c.first} ${c.last}`,
        firstName: c.first,
        lastName: c.last,
        phone: c.phone,
      };
    } else if (svc.type === 'residence') {
      data = {
        type: 'residence',
        clientFullName: `${c.first} ${c.last}`,
        phone: c.phone,
        hotelName: i % 2 === 0 ? 'Royal Stay Istanbul' : 'Mediterranean Resort',
      };
    } else if (svc.type === 'ticket') {
      data = {
        type: 'ticket',
        clientFullName: `${c.first} ${c.last}`,
        phone: c.phone,
        company: i % 2 === 0 ? 'SkyJet Airlines' : 'Mediterranean Air',
      };
    } else {
      data = {
        type: 'dossier',
        clientFullName: `${c.first} ${c.last}`,
        phone: c.phone,
        description: 'Préparation dossier consulaire complet',
      };
    }

    const command: Command = {
      id: uid(),
      serviceId: svc.id,
      data,
      status,
      destination: destinations[i % destinations.length],
      sellingPrice,
      amountPaid,
      buyingPrice,
      supplierId: supplierForService(svc.type),
      commandDate: created,
      assignedTo: assignedId,
      assignee: assignedId
        ? store.users.find((u) => u.id === assignedId)
        : undefined,
      createdBy: creatorId,
      creator: store.users.find((u) => u.id === creatorId),
      createdAt: created,
      updatedAt: updated,
    };
    store.commands.push(command);
  }

  // ==================== PAYMENTS ====================
  // Create payments that sum coherently to each command's amountPaid.
  const paymentMethods: PaymentMethod[] = ['especes', 'virement', 'cheque', 'carte'];
  store.commands.forEach((cmd, idx) => {
    if (cmd.amountPaid <= 0) return;
    // Split into 1-3 payments to feel realistic
    const splits = cmd.amountPaid > 30000 ? (idx % 3) + 1 : 1;
    let remaining = cmd.amountPaid;
    for (let k = 0; k < splits; k++) {
      const isLast = k === splits - 1;
      const amt = isLast ? remaining : Math.round(cmd.amountPaid / splits);
      remaining -= amt;
      const p: Payment = {
        id: uid(),
        commandId: cmd.id,
        amount: amt,
        method: paymentMethods[(idx + k) % paymentMethods.length],
        recordedBy: cmd.createdBy,
        createdAt: new Date(cmd.createdAt.getTime() + (k + 1) * 86400000),
        notes: k === 0 ? 'Acompte initial' : `Versement ${k + 1}`,
      };
      store.payments.push(p);
    }
  });

  // ==================== SUPPLIER TRANSACTIONS ====================
  // Mix of sortie/entree across active suppliers, leaving supEmpty untouched.
  const txnSuppliers = [supVisa, supAirline1, supAirline2, supHotel, supTransport, supInsurance];
  const txnNotes = [
    'Règlement mensuel facture',
    'Acompte commande groupée',
    'Remboursement annulation',
    'Paiement billet émis',
    'Frais consulat - lot du mois',
    'Régularisation solde',
    'Avance prochaine commande',
    'Paiement réservation hôtel',
  ];
  txnSuppliers.forEach((sup, i) => {
    // 1-2 transactions per supplier
    const count = 1 + (i % 2);
    for (let k = 0; k < count; k++) {
      const t: SupplierTransaction = {
        id: uid(),
        date: daysAgo(30 - i * 3 - k * 2),
        supplierId: sup.id,
        type: k % 2 === 0 ? 'sortie' : 'entree',
        amount: 25000 + i * 5000 + k * 7000,
        note: txnNotes[(i + k) % txnNotes.length],
        recordedBy: adminId,
        createdAt: daysAgo(30 - i * 3 - k * 2),
      };
      store.supplierTransactions.push(t);
    }
  });

  // ==================== DOCUMENTS (folder tree) ====================
  const rootClients: DocumentNode = {
    id: uid(),
    name: 'Dossiers Clients',
    type: 'folder',
    parentId: null,
    fileUrl: null,
    uploadedBy: adminId,
    uploader: admin,
    createdAt: daysAgo(150),
    updatedAt: daysAgo(150),
  };
  const rootContracts: DocumentNode = {
    id: uid(),
    name: 'Contrats Fournisseurs',
    type: 'folder',
    parentId: null,
    fileUrl: null,
    uploadedBy: adminId,
    uploader: admin,
    createdAt: daysAgo(140),
    updatedAt: daysAgo(140),
  };
  const sub2025: DocumentNode = {
    id: uid(),
    name: '2025',
    type: 'folder',
    parentId: rootClients.id,
    fileUrl: null,
    uploadedBy: adminId,
    uploader: admin,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
  };
  const fileExample: DocumentNode = {
    id: uid(),
    name: 'modele-passeport.pdf',
    type: 'file',
    parentId: sub2025.id,
    fileUrl: '/mock-documents/modele-passeport.pdf',
    uploadedBy: adminId,
    uploader: admin,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  };
  const fileContract: DocumentNode = {
    id: uid(),
    name: 'contrat-skyjet-2025.pdf',
    type: 'file',
    parentId: rootContracts.id,
    fileUrl: '/mock-documents/contrat-skyjet-2025.pdf',
    uploadedBy: adminId,
    uploader: admin,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  };
  store.documents.push(rootClients, rootContracts, sub2025, fileExample, fileContract);

  // ==================== OMRA HOTELS ====================
  const hMakkah: OmraHotel = {
    id: uid(),
    name: 'Makkah Diamond Hotel',
    location: 'La Mecque',
    isActive: true,
    createdAt: daysAgo(160),
    updatedAt: daysAgo(160),
  };
  const hMadina: OmraHotel = {
    id: uid(),
    name: 'Madinah Royal Inn',
    location: 'Médine',
    isActive: true,
    createdAt: daysAgo(155),
    updatedAt: daysAgo(155),
  };
  const hHaram: OmraHotel = {
    id: uid(),
    name: 'Al Haram Plaza',
    location: 'La Mecque',
    isActive: true,
    createdAt: daysAgo(150),
    updatedAt: daysAgo(150),
  };
  store.omraHotels.push(hMakkah, hMadina, hHaram);

  // ==================== OMRA PROGRAMS ====================
  const program1: OmraProgram = {
    id: uid(),
    name: 'Omra Ramadan 2025 - 15 jours',
    periodFrom: daysFromNow(20),
    periodTo: daysFromNow(35),
    totalPlaces: 40,
    hotelId: hMakkah.id,
    hotel: hMakkah,
    pricing: {
      chambre_2: 320000,
      chambre_3: 280000,
      chambre_4: 250000,
      suite: 480000,
    },
    isActive: true,
    createdBy: adminId,
    creator: admin,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  };
  const program2: OmraProgram = {
    id: uid(),
    name: 'Omra Eté 2025 - 21 jours',
    periodFrom: daysFromNow(80),
    periodTo: daysFromNow(101),
    totalPlaces: 30,
    hotelId: hMadina.id,
    hotel: hMadina,
    pricing: {
      chambre_2: 380000,
      chambre_3: 340000,
      chambre_4: 310000,
    },
    isActive: true,
    createdBy: adminId,
    creator: admin,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  };
  store.omraPrograms.push(program1, program2);

  // ==================== OMRA ORDERS ====================
  const omraStatuses: OmraStatus[] = [
    'en_attente',
    'confirme',
    'termine',
    'annule',
    'reserve',
  ];
  const roomTypes: OmraRoomType[] = ['chambre_2', 'chambre_3', 'chambre_4', 'suite'];
  const omraTypes: OmraOrderType[] = ['groupe', 'libre'];

  const omraClients = [
    { name: 'Hadj Brahim Mansouri', phone: '0555 10 20 30' },
    { name: 'Hadja Aïcha Boudjelloul', phone: '0661 20 30 40' },
    { name: 'Mohamed Salah Benkhelifa', phone: '0770 30 40 50' },
    { name: 'Khadija Belaid', phone: '0540 40 50 60' },
    { name: 'Abderrahmane Lounis', phone: '0555 50 60 70' },
    { name: 'Zineb Hamlaoui', phone: '0661 60 70 80' },
  ];

  omraClients.forEach((client, i) => {
    const status = omraStatuses[i % omraStatuses.length];
    const isGroupe = i % 2 === 0;
    const program = isGroupe ? (i < 4 ? program1 : program2) : undefined;
    const roomType = roomTypes[i % roomTypes.length];
    const sellingPrice = program?.pricing[roomType] ?? 300000 + i * 20000;
    const buyingPrice = Math.round(sellingPrice * 0.75);
    const amountPaid =
      status === 'termine' || status === 'confirme'
        ? sellingPrice
        : status === 'annule'
          ? 0
          : Math.round(sellingPrice * 0.4);
    const created = daysAgo(50 - i * 5);
    const periodFrom = isGroupe && program ? program.periodFrom : daysFromNow(30 + i * 10);
    const periodTo = isGroupe && program ? program.periodTo : daysFromNow(45 + i * 10);
    const order: OmraOrder = {
      id: uid(),
      clientName: client.name,
      phone: client.phone,
      orderDate: created,
      periodFrom,
      periodTo,
      hotelId: program?.hotelId ?? (i % 2 === 0 ? hMakkah.id : hMadina.id),
      hotel: program?.hotel ?? (i % 2 === 0 ? hMakkah : hMadina),
      roomType,
      status,
      omraType: isGroupe ? omraTypes[0] : omraTypes[1],
      programId: program?.id,
      program,
      inProgram: !!program,
      sellingPrice,
      amountPaid,
      buyingPrice,
      notes: i === 0 ? 'Client VIP, prévoir transfert privé' : undefined,
      assignedTo: i % 2 === 0 ? employeeId : adminId,
      assignee: i % 2 === 0 ? employee : admin,
      createdBy: adminId,
      creator: admin,
      createdAt: created,
      updatedAt: created,
    };
    store.omraOrders.push(order);
  });

  // ==================== OMRA VISAS ====================
  const visaClients = [
    { name: 'Hadj Brahim Mansouri', phone: '0555 10 20 30' },
    { name: 'Hadja Aïcha Boudjelloul', phone: '0661 20 30 40' },
    { name: 'Khadija Belaid', phone: '0540 40 50 60' },
    { name: 'Abderrahmane Lounis', phone: '0555 50 60 70' },
  ];
  visaClients.forEach((client, i) => {
    const status = omraStatuses[i % omraStatuses.length];
    const sellingPrice = 35000 + i * 2000;
    const buyingPrice = Math.round(sellingPrice * 0.7);
    const v: OmraVisa = {
      id: uid(),
      clientName: client.name,
      phone: client.phone,
      visaDate: daysAgo(20 - i * 3),
      entryDate: daysFromNow(30 + i * 10),
      hotelId: hHaram.id,
      hotel: hHaram,
      status,
      sellingPrice,
      amountPaid: status === 'termine' ? sellingPrice : Math.round(sellingPrice * 0.5),
      buyingPrice,
      assignedTo: employeeId,
      assignee: employee,
      createdBy: adminId,
      creator: admin,
      createdAt: daysAgo(25 - i * 3),
      updatedAt: daysAgo(20 - i * 3),
    };
    store.omraVisas.push(v);
  });
  // Extra OmraVisa with status='reserve' to cover all 5 OmraStatus values.
  store.omraVisas.push({
    id: uid(),
    clientName: 'Salah Eddine Berrada',
    phone: '0540 99 88 77',
    visaDate: daysAgo(5),
    entryDate: daysFromNow(60),
    hotelId: hHaram.id,
    hotel: hHaram,
    status: 'reserve',
    sellingPrice: 42000,
    amountPaid: 15000,
    buyingPrice: 30000,
    assignedTo: employeeId,
    assignee: employee,
    createdBy: adminId,
    creator: admin,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(5),
  });

  // ==================== EMPLOYEE TRANSACTIONS ====================
  // Karim has avances + a salary; Leila has nothing (empty state)
  const empTxs: EmployeeTransaction[] = [
    {
      id: uid(),
      employeeId,
      employee,
      type: 'avance',
      amount: 15000,
      date: daysAgo(20),
      note: 'Avance sur salaire',
      recordedBy: adminId,
      recorder: admin,
      createdAt: daysAgo(20),
    },
    {
      id: uid(),
      employeeId,
      employee,
      type: 'credit',
      amount: 8000,
      date: daysAgo(12),
      note: 'Frais de mission',
      recordedBy: adminId,
      recorder: admin,
      createdAt: daysAgo(12),
    },
    {
      id: uid(),
      employeeId,
      employee,
      type: 'salaire',
      amount: 60000,
      date: daysAgo(2),
      month: '2025-04',
      note: 'Salaire mensuel',
      recordedBy: adminId,
      recorder: admin,
      createdAt: daysAgo(2),
    },
  ];
  store.employeeTransactions.push(...empTxs);

  // ==================== EXPENSES ====================
  // Cover every category at least once
  const expenseSeed: { category: ExpenseCategory; description: string; amount: number; method: PaymentMethod; vendor?: string; daysAgoVal: number }[] = [
    { category: 'fournitures', description: 'Cartouches d\'encre + papeterie', amount: 7500, method: 'especes', vendor: 'Bureautique Plus', daysAgoVal: 5 },
    { category: 'equipement', description: 'Achat imprimante laser couleur', amount: 65000, method: 'carte', vendor: 'TechWorld', daysAgoVal: 25 },
    { category: 'factures', description: 'Facture électricité avril', amount: 18500, method: 'virement', vendor: 'Sonelgaz', daysAgoVal: 8 },
    { category: 'transport', description: 'Carburant véhicule de service', amount: 6000, method: 'especes', daysAgoVal: 3 },
    { category: 'maintenance', description: 'Entretien climatisation bureau', amount: 12000, method: 'especes', vendor: 'Clim Service', daysAgoVal: 18 },
    { category: 'marketing', description: 'Publication sponsorisée Facebook', amount: 9500, method: 'carte', vendor: 'Meta Ads', daysAgoVal: 14 },
    { category: 'autre', description: 'Restauration équipe (repas Ramadan)', amount: 22000, method: 'especes', daysAgoVal: 30 },
    { category: 'fournitures', description: 'Recharge eau + café', amount: 3500, method: 'especes', vendor: 'Épicerie centrale', daysAgoVal: 1 },
    { category: 'factures', description: 'Facture internet pro', amount: 8200, method: 'virement', vendor: 'Algérie Télécom', daysAgoVal: 45 },
    { category: 'marketing', description: 'Impression flyers vacances été', amount: 14000, method: 'cheque', vendor: 'PrintExpress', daysAgoVal: 60 },
  ];
  expenseSeed.forEach((e) => {
    const exp: Expense = {
      id: uid(),
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: daysAgo(e.daysAgoVal),
      paymentMethod: e.method,
      vendor: e.vendor,
      note: undefined,
      recordedBy: adminId,
      recorder: admin,
      createdAt: daysAgo(e.daysAgoVal),
    };
    store.expenses.push(exp);
  });

  // ==================== SUPPLIER ORDERS / RECEIPTS / INVOICES ====================
  const fmtYMD = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const orderStatuses: SupplierOrderStatus[] = ['en_attente', 'livre', 'partiel', 'annule'];
  orderStatuses.forEach((status, i) => {
    const sup = txnSuppliers[i % txnSuppliers.length];
    const qty = 10 + i * 5;
    const unitPrice = 1500 + i * 500;
    const orderDate = daysAgo(40 - i * 5);
    const so: SupplierOrder = {
      id: uid(),
      supplierId: sup.id,
      supplier: sup,
      orderNumber: `SO-${fmtYMD(orderDate)}-${String(i + 1).padStart(3, '0')}`,
      description: `Commande lot ${i + 1} pour ${sup.name}`,
      quantity: qty,
      unitPrice,
      totalAmount: qty * unitPrice,
      orderDate,
      status,
      deliveredQuantity:
        status === 'livre' ? qty : status === 'partiel' ? Math.floor(qty / 2) : 0,
      createdBy: adminId,
      createdAt: daysAgo(40 - i * 5),
      updatedAt: daysAgo(35 - i * 5),
    };
    store.supplierOrders.push(so);

    // Receipt for orders that have at least partial delivery
    if (so.deliveredQuantity > 0) {
      const sr: SupplierReceipt = {
        id: uid(),
        supplierId: sup.id,
        supplier: sup,
        orderId: so.id,
        order: so,
        receiptNumber: `BR-2025-${String(i + 1).padStart(4, '0')}`,
        description: `Réception ${so.description}`,
        quantity: so.deliveredQuantity,
        unitPrice,
        totalAmount: so.deliveredQuantity * unitPrice,
        receiptDate: daysAgo(30 - i * 5),
        createdBy: adminId,
        createdAt: daysAgo(30 - i * 5),
      };
      store.supplierReceipts.push(sr);
    }
  });

  const invoiceStatuses: SupplierInvoiceStatus[] = ['non_paye', 'partiel', 'paye'];
  invoiceStatuses.forEach((status, i) => {
    const sup = txnSuppliers[i];
    const amount = 50000 + i * 15000;
    const paidAmount = status === 'paye' ? amount : status === 'partiel' ? Math.round(amount / 2) : 0;
    const invoiceDate = daysAgo(30 - i * 5);
    // For non_paye, set dueDate in the past so the overdue rule (§2.4) is exercised.
    const dueDate = status === 'non_paye' ? daysAgo(5) : daysFromNow(15 - i * 5);
    const inv: SupplierInvoice = {
      id: uid(),
      supplierId: sup.id,
      supplier: sup,
      invoiceNumber: `F-2025-${String(i + 1).padStart(4, '0')}`,
      internalRef: `INV-${fmtYMD(invoiceDate)}-${String(i + 1).padStart(3, '0')}`,
      description: `Facture mensuelle ${sup.name}`,
      amount,
      invoiceDate,
      dueDate,
      status,
      paidAmount,
      createdBy: adminId,
      createdAt: invoiceDate,
      updatedAt: daysAgo(25 - i * 5),
    };
    store.supplierInvoices.push(inv);
  });

  // ==================== INTERNAL TASKS ====================
  const taskPriorities: TaskPriority[] = ['urgent', 'normal', 'critical'];
  const taskStatuses: TaskStatus[] = ['in_progress', 'completed'];
  const taskVisibilities: TaskVisibility[] = ['clear', 'unreadable'];
  const taskTitles = [
    'Préparer dossier visa Schengen Benali',
    'Confirmer réservation hôtel Istanbul',
    'Émettre billets famille Khaled',
    'Vérifier dossier consulat USA',
    'Relance paiement client Boumediene',
    'Mise à jour catalogue Omra Été',
    'Envoyer devis groupe scolaire',
    'Archivage dossiers 2024',
    'Renouvellement contrat fournisseur visa',
    'Préparer rapport mensuel comptabilité',
    'Suivi commande billets Air Algérie',
    'Confirmer réservation chambre famille Mansouri',
  ];
  taskTitles.forEach((title, i) => {
    const t: InternalTask = {
      id: uid(),
      title,
      description: `Tâche interne #${i + 1} — ${title}`,
      priority: taskPriorities[i % taskPriorities.length],
      status: taskStatuses[i % taskStatuses.length],
      visibility: taskVisibilities[i % taskVisibilities.length],
      assignedTo: i % 4 === 0 ? adminId : employeeId,
      assignee: i % 4 === 0 ? admin : employee,
      createdBy: adminId,
      creator: admin,
      dueDate: i % 3 === 0 ? daysFromNow(7 + i) : undefined,
      seen: i > 6, // a few unseen for the badge
      createdAt: daysAgo(20 - i),
      updatedAt: daysAgo(20 - i),
    };
    store.internalTasks.push(t);
  });

  // ==================== CLIENT INVOICES ====================
  const invoiceTypes: ClientInvoiceType[] = ['proforma', 'finale'];
  const invoiceStatusList: ClientInvoiceStatus[] = ['brouillon', 'envoyee', 'payee', 'annulee'];

  // Build invoices from existing commands so command-based references resolve.
  // Per-(prefix+date) sequence counter so numbering follows {PRO|FAC}-YYYYMMDD-NNN with
  // a sequence that resets per day per type, padded to 3 digits.
  const ciSeq: Record<string, number> = {};
  store.commands.slice(0, 8).forEach((cmd, i) => {
    const type = invoiceTypes[i % invoiceTypes.length];
    const status = invoiceStatusList[i % invoiceStatusList.length];
    const invoiceDate = daysAgo(15 - i);
    const prefix = type === 'proforma' ? 'PRO' : 'FAC';
    const ymd = fmtYMD(invoiceDate);
    const key = `${prefix}-${ymd}`;
    ciSeq[key] = (ciSeq[key] ?? 0) + 1;
    const inv: ClientInvoice = {
      id: uid(),
      invoiceNumber: `${prefix}-${ymd}-${String(ciSeq[key]).padStart(3, '0')}`,
      type,
      status,
      commandId: cmd.id,
      command: cmd,
      clientName: cmd.data.clientFullName,
      clientPhone: cmd.data.phone,
      clientEmail: `${cmd.data.clientFullName.toLowerCase().replace(/\s+/g, '.')}@client.demo`,
      serviceName: store.services.find((s) => s.id === cmd.serviceId)?.name ?? 'Service',
      serviceType: store.services.find((s) => s.id === cmd.serviceId)?.type,
      destination: cmd.destination,
      totalAmount: cmd.sellingPrice,
      paidAmount: status === 'payee' ? cmd.sellingPrice : status === 'envoyee' ? Math.round(cmd.sellingPrice * 0.5) : 0,
      invoiceDate,
      dueDate: daysFromNow(15 - i),
      ticketPrice: cmd.buyingPrice,
      agencyFees: cmd.sellingPrice - cmd.buyingPrice,
      paymentMethod: 'Espèces',
      validityHours: 48,
      bankName: null,
      bankAccount: null,
      createdBy: adminId,
      creator: admin,
      createdAt: daysAgo(15 - i),
      updatedAt: daysAgo(15 - i),
    };
    store.clientInvoices.push(inv);
  });

  // ==================== CAISSE SETTLEMENTS (history) ====================
  // One past settlement for Karim so the "Historique des règlements" UI is not empty.
  store.caisseSettlements.push({
    id: uid(),
    employeeId,
    caisseAmount: 145000,
    impayesAmount: 32000,
    beneficesAmount: 58000,
    commandCount: 9,
    newCaisse: 0,
    newImpayes: 12000,
    newBenefices: 0,
    adminId,
    admin: { firstName: admin.firstName, lastName: admin.lastName },
    notes: 'Règlement mensuel — clôture mois précédent',
    resetDate: daysAgo(30),
    createdAt: daysAgo(30),
  });

  // ==================== AGENCY SETTINGS ====================
  store.agencySettings = {
    name: 'Demo Travel Agency',
    legalName: 'DEMO TRAVEL AGENCY SARL',
    address: '12 Rue des Voyageurs, Alger Centre',
    phone: '+213 21 00 00 00',
    mobilePhone: '+213 555 00 00 00',
    email: 'contact@demotravel.demo',
    rc: '16/00-0000000 B 25',
    nif: '000000000000000',
    nis: '000000000000000',
    licenseNumber: 'LIC-2025-DEMO',
    articleFiscal: '00000000000',
    bankName: 'Banque Démo',
    bankAccount: 'DZ58 0000 0000 0000 0000 0000',
    arabicName: 'وكالة السفر التجريبية',
    arabicAddress: '12 شارع المسافرين، الجزائر العاصمة',
  };

  markSeeded();
}
