import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// French translations
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frCommands from './locales/fr/commands.json';
import frSuppliers from './locales/fr/suppliers.json';
import frEmployees from './locales/fr/employees.json';
import frOmra from './locales/fr/omra.json';
import frDocuments from './locales/fr/documents.json';
import frExpenses from './locales/fr/expenses.json';
import frValidation from './locales/fr/validation.json';
import frServices from './locales/fr/services.json';
import frServiceTypes from './locales/fr/serviceTypes.json';
import frAccounting from './locales/fr/accounting.json';

// Arabic translations
import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arDashboard from './locales/ar/dashboard.json';
import arCommands from './locales/ar/commands.json';
import arSuppliers from './locales/ar/suppliers.json';
import arEmployees from './locales/ar/employees.json';
import arOmra from './locales/ar/omra.json';
import arDocuments from './locales/ar/documents.json';
import arExpenses from './locales/ar/expenses.json';
import arValidation from './locales/ar/validation.json';
import arServices from './locales/ar/services.json';
import arServiceTypes from './locales/ar/serviceTypes.json';
import arAccounting from './locales/ar/accounting.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
        auth: frAuth,
        dashboard: frDashboard,
        commands: frCommands,
        suppliers: frSuppliers,
        employees: frEmployees,
        omra: frOmra,
        documents: frDocuments,
        expenses: frExpenses,
        validation: frValidation,
        services: frServices,
        serviceTypes: frServiceTypes,
        accounting: frAccounting,
      },
      ar: {
        common: arCommon,
        auth: arAuth,
        dashboard: arDashboard,
        commands: arCommands,
        suppliers: arSuppliers,
        employees: arEmployees,
        omra: arOmra,
        documents: arDocuments,
        expenses: arExpenses,
        validation: arValidation,
        services: arServices,
        serviceTypes: arServiceTypes,
        accounting: arAccounting,
      },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'commands', 'suppliers', 'employees', 'omra', 'documents', 'expenses', 'validation', 'services', 'serviceTypes', 'accounting'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
