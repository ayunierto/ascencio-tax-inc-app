import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type AppLanguage = 'en' | 'es';

export const LANGUAGE_STORAGE_KEY = 'app.language';
export const FALLBACK_LANGUAGE: AppLanguage = 'en';
export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['en', 'es'];

export const toSupportedLanguage = (
  language?: string | null,
): AppLanguage | null => {
  const normalized = language?.toLowerCase().split(/[-_]/)[0];

  if (!normalized) {
    return null;
  }

  return SUPPORTED_LANGUAGES.includes(normalized as AppLanguage)
    ? (normalized as AppLanguage)
    : null;
};

export const getDeviceLanguage = (): AppLanguage => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  return toSupportedLanguage(deviceLanguage) ?? FALLBACK_LANGUAGE;
};

export const getStoredLanguagePreference =
  async (): Promise<AppLanguage | null> => {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return toSupportedLanguage(storedLanguage);
  };

export const persistLanguagePreference = async (
  language: AppLanguage,
): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};
