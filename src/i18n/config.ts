
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  }
};

// Initialize i18n only if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      debug: false, // Set to false to reduce console noise
      
      interpolation: {
        escapeValue: false
      },

      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      },

      // Add missing namespace configuration
      defaultNS: 'translation',
      ns: ['translation'],

      // Add error handling
      missingKeyHandler: (lng, ns, key) => {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    });
}

export default i18n;
