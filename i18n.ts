import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: Localization.locale.startsWith('es') ? 'es' : 'en',
  fallbackLng: 'en',
  resources: {
    es: { translation: { services: 'Servicios', loading: 'Cargando...' } },
    en: { translation: { services: 'Services', loading: 'Loading...' } },
  },
});

export default i18n;
