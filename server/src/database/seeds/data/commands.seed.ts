export const commandsSeedData = [
  {
    // Visa Schengen - En cours
    serviceIndex: 0, // Visa Schengen
    supplierIndex: 0, // VFS Global
    data: {
      type: 'visa',
      clientFullName: 'Ahmed Benali',
      phone: '+213 555 123 456',
      firstName: 'Ahmed',
      lastName: 'Benali',
    },
    status: 'en_cours',
    destination: 'ALG-PAR',
    sellingPrice: 85000,
    amountPaid: 50000,
    buyingPrice: 65000,
  },
  {
    // Visa USA - Terminé
    serviceIndex: 1, // Visa USA
    supplierIndex: 1, // TLS Contact
    data: {
      type: 'visa',
      clientFullName: 'Nadia Hamidi',
      phone: '+213 661 987 654',
      firstName: 'Nadia',
      lastName: 'Hamidi',
    },
    status: 'termine',
    destination: 'ALG-NYC',
    sellingPrice: 120000,
    amountPaid: 120000,
    buyingPrice: 95000,
  },
  {
    // Residence - Terminé
    serviceIndex: 2, // Réservation Hôtel
    supplierIndex: 2, // Booking Partner
    data: {
      type: 'residence',
      clientFullName: 'Youcef Mansouri',
      phone: '+213 770 456 789',
      hotelName: 'Hilton Istanbul',
    },
    status: 'termine',
    destination: 'Istanbul',
    sellingPrice: 45000,
    amountPaid: 45000,
    buyingPrice: 35000,
  },
  {
    // Ticket - En attente
    serviceIndex: 3, // Billets d'avion
    supplierIndex: 3, // Air Algérie
    data: {
      type: 'ticket',
      clientFullName: 'Amina Slimani',
      phone: '+213 550 789 123',
      departureDate: '2025-02-15',
      returnDate: '2025-02-28',
    },
    status: 'en_attente',
    destination: 'ALG-IST-ALG',
    sellingPrice: 75000,
    amountPaid: 25000,
    buyingPrice: 58000,
  },
  {
    // Ticket - En cours
    serviceIndex: 3, // Billets d'avion
    supplierIndex: 4, // Turkish Airlines
    data: {
      type: 'ticket',
      clientFullName: 'Omar Boudiaf',
      phone: '+213 661 234 567',
      departureDate: '2025-01-30',
    },
    status: 'en_cours',
    destination: 'ALG-IST',
    sellingPrice: 42000,
    amountPaid: 42000,
    buyingPrice: 32000,
  },
  {
    // Dossier - En cours
    serviceIndex: 4, // Traitement Dossier
    supplierIndex: 0, // VFS Global
    data: {
      type: 'dossier',
      clientFullName: 'Leila Cherif',
      phone: '+213 770 111 222',
      description: 'Légalisation acte de naissance et diplômes',
    },
    status: 'en_cours',
    destination: 'France',
    sellingPrice: 15000,
    amountPaid: 15000,
    buyingPrice: 8000,
  },
];
