import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { api } from '../api/api';

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

  const checkVersion = async () => {
    try {
      const platform = Platform.OS;
      const { data } = await api.get(`/app/version?platform=${platform}`);

      const installed = Application.nativeApplicationVersion;
      if (!installed) return;
      const needsForceUpdate =
        compareVersions(installed, data.minSupportedVersion) === -1;

      const hasNewVersion =
        compareVersions(installed, data.latestVersion) === -1;

      if (needsForceUpdate) {
        setUpdateRequired(true);

        const storeUrl =
          Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/idTU_APP_ID'
            : 'https://play.google.com/store/apps/details?id=TU_APP_ID';

        Alert.alert(
          'Required Update',
          'An important update is required to continue using the application. Please update to the latest version.',
          [
            {
              text: 'Update',
              onPress: () => Linking.openURL(storeUrl),
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
          '"A new version of the application is available. Would you like to update it now?"',
          [
            {
              text: '"Update"',
              onPress: async () => {
                try {
                  const update = await Updates.checkForUpdateAsync();
                  if (update.isAvailable) {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  }
                } catch (e) {
                  console.log('Error OTA Update', e);
                }
              },
            },
            { text: '"Later"', style: 'cancel' },
          ],
        );
      }
    } catch (err) {
      console.error('Version check failed', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkVersion();
  }, []);

  return {
    checking,
    updateRequired,
    updateAvailable,
    checkVersion,
  };
}
