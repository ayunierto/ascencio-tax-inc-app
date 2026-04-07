import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { api } from '../api/api';
import { useMobileConfigStore } from '../config/store/useMobileConfigStore';

const IOS_STORE_URL = process.env.EXPO_PUBLIC_APP_STORE_URL;
const ANDROID_STORE_URL = process.env.EXPO_PUBLIC_PLAY_STORE_URL;

const compareVersions = (v1: string, v2: string) => {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    if ((b[i] || 0) > (a[i] || 0)) return -1;
    if ((b[i] || 0) < (a[i] || 0)) return 1;
  }
  return 0;
};

export function useCheckAppVersion() {
  const [checking, setChecking] = useState(true);
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const loadMobileConfig = useMobileConfigStore((state) => state.loadConfig);
  const mobileConfig = useMobileConfigStore((state) => state.config);

  const resolvedStoreUrls = useMemo(
    () => ({
      ios:
        mobileConfig?.appStoreUrl?.trim() ||
        IOS_STORE_URL ||
        'https://apps.apple.com/',
      android:
        mobileConfig?.playStoreUrl?.trim() ||
        ANDROID_STORE_URL ||
        'https://play.google.com/store/apps/details?id=com.ayunierto.ascenciotaxinc',
    }),
    [mobileConfig?.appStoreUrl, mobileConfig?.playStoreUrl],
  );

  const checkVersion = useCallback(async () => {
    try {
      const platform = Platform.OS;
      const { data } = await api.get(`/app/version?platform=${platform}`);

      const installed =
        Constants?.expoConfig?.version ?? Application.nativeApplicationVersion;
      if (!installed) return;
      const needsForceUpdate =
        compareVersions(installed, data.minSupportedVersion) === -1 ||
        (Boolean(data.forceUpdate) &&
          compareVersions(installed, data.latestVersion) === -1);

      const hasNewVersion =
        compareVersions(installed, data.latestVersion) === -1;

      const storeUrl =
        Platform.OS === 'ios'
          ? resolvedStoreUrls.ios
          : resolvedStoreUrls.android;

      const releaseNotesText = data.releaseNotes
        ? `\n\n${String(data.releaseNotes)}`
        : '';

      if (needsForceUpdate) {
        setUpdateRequired(true);

        Alert.alert(
          'Required Update',
          `An important update is required to continue using the application. Please update to the latest version.${releaseNotesText}`,
          [
            {
              text: 'Update',
              onPress: () => {
                if (storeUrl) {
                  Linking.openURL(storeUrl);
                }
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      if (hasNewVersion) {
        setUpdateAvailable(true);

        Alert.alert(
          'New Version Available',
          `A new version of the application is available. Would you like to update it now?${releaseNotesText}`,
          [
            {
              text: 'Update',
              onPress: async () => {
                if (storeUrl) {
                  await Linking.openURL(storeUrl);
                }
              },
            },
            { text: 'Later', style: 'cancel' },
          ],
        );
      }
    } catch (err) {
      console.error('Version check failed', err);
    } finally {
      setChecking(false);
    }
  }, [resolvedStoreUrls.android, resolvedStoreUrls.ios]);

  useEffect(() => {
    const initialize = async () => {
      await loadMobileConfig();
      await checkVersion();
    };

    void initialize();
  }, [checkVersion, loadMobileConfig]);

  return {
    checking,
    updateRequired,
    updateAvailable,
    checkVersion,
  };
}
