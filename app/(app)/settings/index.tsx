import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card/Card';
import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import ListItem from '@/core/settings/components/ListItem';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  AppLanguage,
  persistLanguagePreference,
  toSupportedLanguage,
} from '@/i18n/language';

export default function ProfileIndexScreen() {
  const { logout, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const currentLanguage = useMemo(
    () => toSupportedLanguage(i18n.resolvedLanguage) ?? 'en',
    [i18n.resolvedLanguage],
  );

  const appVersion = useMemo(() => {
    return (
      Application.nativeApplicationVersion ??
      Constants?.expoConfig?.version ??
      (Constants as any)?.manifest?.version ??
      '1.0.0'
    );
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleLanguageChange = async (language: AppLanguage) => {
    if (language === currentLanguage || isUpdatingLanguage) {
      return;
    }

    setIsUpdatingLanguage(true);
    try {
      await i18n.changeLanguage(language);
      await persistLanguagePreference(language);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <CustomHeader
        title={t('settings')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name='menu' size={24} color='#ffffff' />
          </HeaderButton>
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <TouchableOpacity
          onPress={() => router.push('/(app)/settings/account')}
        >
          <Card>
            <CardContent style={styles.profileCard}>
              {user?.imageUrl ? (
                <Image
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  source={{ uri: user.imageUrl }}
                  placeholder={{ blurhash }}
                  contentFit='fill'
                  transition={1000}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Ionicons name='person' size={32} color={theme.primary} />
                </View>
              )}

              <View style={styles.profileInfo}>
                <ThemedText style={styles.userName}>
                  {user?.firstName} {user?.lastName}
                </ThemedText>
                <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              </View>
              <Ionicons
                name='chevron-forward'
                size={20}
                color={theme.mutedForeground}
              />
            </CardContent>
          </Card>
        </TouchableOpacity>

        {/* Account Section */}
        {/* ⚠️ TEMPORARY: Commented out for testing */}
        {/* <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('account')}</ThemedText>
          <Card>
            <CardContent style={styles.cardContent}>
              <ListItem
                icon="diamond-outline"
                label={t('subscriptions')}
                onPress={() => router.push('/(app)/subscription')}
              />
            </CardContent>
          </Card>
        </View> */}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('language')}</ThemedText>
          <Card>
            <CardContent style={styles.cardContent}>
              <TouchableOpacity
                onPress={() => handleLanguageChange('en')}
                style={styles.languageItem}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.languageLabel}>
                  {t('english')}
                </ThemedText>
                {currentLanguage === 'en' ? (
                  <Ionicons
                    name='checkmark-circle'
                    size={20}
                    color={theme.primary}
                  />
                ) : null}
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                onPress={() => handleLanguageChange('es')}
                style={styles.languageItem}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.languageLabel}>
                  {t('spanish')}
                </ThemedText>
                {currentLanguage === 'es' ? (
                  <Ionicons
                    name='checkmark-circle'
                    size={20}
                    color={theme.primary}
                  />
                ) : null}
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('legal')}</ThemedText>
          <Card>
            <CardContent style={styles.cardContent}>
              <ListItem
                icon='book-outline'
                label={t('termsOfUse')}
                external
                onPress={() =>
                  Linking.openURL('https://www.ascenciotax.com/termsofuse')
                }
              />
              <View style={styles.divider} />
              <ListItem
                icon='shield-checkmark-outline'
                label={t('privacyPolicy')}
                external
                onPress={() =>
                  Linking.openURL('https://www.ascenciotax.com/privacy')
                }
              />
            </CardContent>
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={styles.appInfoText}>
            {t('version')} {appVersion}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button variant='destructive' fullWidth onPress={handleLogout}>
          <ButtonIcon name='log-out-outline' />
          <ButtonText>{t('logOut')}</ButtonText>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    gap: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  userEmail: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  cardContent: {
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 50,
    opacity: 0.5,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  languageLabel: {
    fontSize: 16,
    color: theme.foreground,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 'auto',
  },
  appInfoText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  footer: {
    padding: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
});
