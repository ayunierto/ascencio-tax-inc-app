import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import { resources } from './resources';

// Obtiene el idioma principal del dispositivo
const deviceLanguage =
  Localization.getLocales()[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React Native ya escapa
    },

    compatibilityJSON: 'v4',
  });

export default i18n;
