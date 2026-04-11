import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { DateTime } from 'luxon';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner-native';

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
import {
  disconnectClientCalendarAction,
  getClientCalendarsAction,
  getClientCalendarStatusAction,
} from '@/core/calendar/actions';
import { startClientCalendarOAuth } from '@/core/calendar/utils/client-calendar-oauth';

export default function ProfileIndexScreen() {
  const { logout, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const {
    data: clientCalendarStatus,
    isFetching: loadingClientCalendarStatus,
    refetch: refetchClientCalendarStatus,
  } = useQuery({
    queryKey: ['client-calendar-status'],
    queryFn: getClientCalendarStatusAction,
  });

  const {
    data: clientCalendars,
    isFetching: loadingClientCalendars,
    refetch: refetchClientCalendars,
  } = useQuery({
    queryKey: ['client-calendars'],
    queryFn: getClientCalendarsAction,
    enabled: Boolean(clientCalendarStatus?.connected),
  });

  const connectClientCalendarMutation = useMutation({
    mutationFn: async (calendarId?: string) =>
      startClientCalendarOAuth('/settings', { calendarId }),
    onSuccess: async (result) => {
      if (result.status === 'success') {
        toast.success(t('googleCalendarConnectedNow'));
      } else if (result.status === 'error') {
        toast.error(t('error'), {
          description: result.error ?? t('genericTryAgainLater'),
        });
      }

      await Promise.all([
        refetchClientCalendarStatus(),
        refetchClientCalendars(),
      ]);
    },
    onError: (error) => {
      console.error('Error connecting client calendar', error);
      toast.error(t('error'), {
        description: t('genericTryAgainLater'),
      });
    },
  });

  const disconnectClientCalendarMutation = useMutation({
    mutationFn: disconnectClientCalendarAction,
    onSuccess: async () => {
      toast.success(t('success'));
      await refetchClientCalendarStatus();
    },
    onError: (error) => {
      console.error('Error disconnecting client calendar', error);
      toast.error(t('error'), {
        description: t('genericTryAgainLater'),
      });
    },
  });

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
          <ThemedText style={styles.sectionTitle}>
            {t('calendarIntegration')}
          </ThemedText>
          <Card>
            <CardContent style={styles.cardContent}>
              <View style={styles.calendarStatusRow}>
                <View style={styles.calendarStatusInfo}>
                  <ThemedText style={styles.calendarStatusLabel}>
                    {clientCalendarStatus?.connected
                      ? t('googleCalendarConnected')
                      : t('googleCalendarNotConnected')}
                  </ThemedText>
                  {clientCalendarStatus?.email ? (
                    <ThemedText style={styles.calendarMetaText}>
                      {clientCalendarStatus.email}
                    </ThemedText>
                  ) : null}
                  {clientCalendarStatus?.updatedAt ? (
                    <ThemedText style={styles.calendarMetaText}>
                      {t('lastUpdated')}:{' '}
                      {DateTime.fromISO(
                        clientCalendarStatus.updatedAt,
                      ).toLocaleString(DateTime.DATETIME_MED)}
                    </ThemedText>
                  ) : null}
                </View>
                <Ionicons
                  name={
                    clientCalendarStatus?.connected
                      ? 'checkmark-circle'
                      : 'close-circle'
                  }
                  size={20}
                  color={
                    clientCalendarStatus?.connected
                      ? theme.success
                      : theme.mutedForeground
                  }
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.calendarButtonsRow}>
                <Button
                  size='sm'
                  onPress={() =>
                    connectClientCalendarMutation.mutate(undefined)
                  }
                  disabled={
                    connectClientCalendarMutation.isPending ||
                    loadingClientCalendarStatus
                  }
                >
                  <ButtonText>
                    {clientCalendarStatus?.connected
                      ? t('googleCalendarReconnect')
                      : t('googleCalendarConnect')}
                  </ButtonText>
                </Button>

                <Button
                  size='sm'
                  variant='outline'
                  onPress={() => disconnectClientCalendarMutation.mutate()}
                  disabled={
                    disconnectClientCalendarMutation.isPending ||
                    loadingClientCalendarStatus ||
                    !clientCalendarStatus?.connected
                  }
                >
                  <ButtonText>{t('googleCalendarDisconnect')}</ButtonText>
                </Button>

                <Button
                  size='sm'
                  variant='ghost'
                  onPress={() => {
                    void Promise.all([
                      refetchClientCalendarStatus(),
                      refetchClientCalendars(),
                    ]);
                  }}
                  disabled={loadingClientCalendarStatus}
                >
                  <ButtonText>{t('refreshStatus')}</ButtonText>
                </Button>
              </View>

              {clientCalendarStatus?.connected ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.calendarListContainer}>
                    <ThemedText style={styles.calendarListTitle}>
                      {t('selectCalendarDestination')}
                    </ThemedText>

                    {loadingClientCalendars ? (
                      <ThemedText style={styles.calendarMetaText}>
                        {t('loadingCalendars')}
                      </ThemedText>
                    ) : clientCalendars == null ||
                      clientCalendars.length === 0 ? (
                      <ThemedText style={styles.calendarMetaText}>
                        {t('noCalendarsFound')}
                      </ThemedText>
                    ) : (
                      clientCalendars.map((calendar) => {
                        const isSelected =
                          clientCalendarStatus.calendarId === calendar.id;

                        return (
                          <View
                            key={calendar.id}
                            style={styles.calendarOptionRow}
                          >
                            <View style={styles.calendarOptionInfo}>
                              <ThemedText style={styles.calendarOptionTitle}>
                                {calendar.summary}
                                {calendar.primary
                                  ? ` (${t('primaryCalendarLabel')})`
                                  : ''}
                              </ThemedText>
                              {calendar.timeZone ? (
                                <ThemedText style={styles.calendarMetaText}>
                                  {calendar.timeZone}
                                </ThemedText>
                              ) : null}
                            </View>

                            {isSelected ? (
                              <Ionicons
                                name='checkmark-circle'
                                size={20}
                                color={theme.success}
                              />
                            ) : (
                              <Button
                                size='sm'
                                variant='outline'
                                onPress={() =>
                                  connectClientCalendarMutation.mutate(
                                    calendar.id,
                                  )
                                }
                                disabled={
                                  connectClientCalendarMutation.isPending
                                }
                              >
                                <ButtonText>{t('useThisCalendar')}</ButtonText>
                              </Button>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                </>
              ) : null}
            </CardContent>
          </Card>
        </View>

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
  calendarStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  calendarStatusInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  calendarStatusLabel: {
    fontSize: 14,
    color: theme.foreground,
  },
  calendarMetaText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  calendarButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  calendarListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  calendarListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.foreground,
  },
  calendarOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  calendarOptionInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  calendarOptionTitle: {
    fontSize: 13,
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
