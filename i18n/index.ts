import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getDeviceLanguage, getStoredLanguagePreference } from './language';
import { resources } from './resources';

const i18n = createInstance();

const deviceLanguage = getDeviceLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // React Native ya escapa
  },

  compatibilityJSON: 'v4',
});

void (async () => {
  const storedLanguage = await getStoredLanguagePreference();

  if (!storedLanguage || storedLanguage === i18n.resolvedLanguage) {
    return;
  }

  await i18n.changeLanguage(storedLanguage);
})();

export default i18n;
