import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { theme } from '@/components/ui/theme';
import { CustomHeader, HeaderButton } from '@/components/ui';
import { useInvoices } from '@/core/accounting/invoices/hooks/useInvoices';
import { useQuery } from '@tanstack/react-query';
import { getUserAppointments } from '@/core/appointments/actions/get-user-appointments.action';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { ThemedText } from '@/components/ui/ThemedText';
import { DateTime } from 'luxon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { authStatus, user } = useAuthStore();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // User-specific data
  const {
    data: upcomingAppointments,
    isLoading: loadingUpcoming,
    isError: isUpcomingError,
    isFetching: isFetchingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['appointments', 'pending'],
    queryFn: () => getUserAppointments('pending'),
    staleTime: 0,
  });

  const {
    isLoading: loadingPast,
    isError: isPastError,
    isFetching: isFetchingPast,
    refetch: refetchPast,
  } = useQuery({
    queryKey: ['appointments', 'past'],
    queryFn: () => getUserAppointments('past'),
    staleTime: 0,
  });

  const {
    data: invoices,
    isLoading: loadingInvoices,
    isError: isInvoicesError,
    isFetching: isFetchingInvoices,
    refetch: refetchInvoices,
  } = useInvoices('all');

  const invoiceItems = invoices?.items ?? [];
  const upcomingCount = upcomingAppointments?.length ?? 0;
  const totalInvoicesCount = invoiceItems.length;
  const overdueInvoicesCount = invoiceItems.filter(
    (invoice) => invoice.status === 'overdue',
  ).length;
  const balanceDueAmount = invoiceItems.reduce(
    (sum, invoice) => sum + (Number(invoice.balanceDue) || 0),
    0,
  );

  const nextAppointment = [...(upcomingAppointments ?? [])].sort(
    (a, b) =>
      DateTime.fromISO(a.start).toMillis() -
      DateTime.fromISO(b.start).toMillis(),
  )[0];

  const nextAppointmentDateTime = nextAppointment
    ? DateTime.fromISO(nextAppointment.start)
        .setLocale(user?.locale || 'en')
        .toFormat('DDD, t')
    : '';

  const isRefreshing =
    isFetchingUpcoming || isFetchingPast || isFetchingInvoices;

  const refreshDashboard = async () => {
    await Promise.all([refetchUpcoming(), refetchPast(), refetchInvoices()]);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  if (loadingUpcoming || loadingPast || loadingInvoices) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomHeader
          title={t('dashboard')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name='menu' size={24} color={theme.foreground} />
            </HeaderButton>
          }
        />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <DashboardSkeleton />
        </ScrollView>
      </View>
    );
  }

  const hasError = isUpcomingError || isPastError || isInvoicesError;
  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CustomHeader
          title={t('dashboard')}
          left={
            <HeaderButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name='menu' size={24} color={theme.foreground} />
            </HeaderButton>
          }
        />
        <View style={styles.centerContent}>
          <Ionicons
            name='alert-circle-outline'
            size={64}
            color={theme.destructive}
          />
          <Text style={[styles.errorText, { color: theme.foreground }]}>
            {t('loadError')}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshDashboard}
          >
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader
        title={t('dashboard')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name='menu' size={24} color={theme.foreground} />
          </HeaderButton>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={
              isRefreshing &&
              !loadingUpcoming &&
              !loadingPast &&
              !loadingInvoices
            }
            onRefresh={refreshDashboard}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        {authStatus === 'authenticated' && user && (
          <View style={styles.heroCard}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroSparkWrap}>
                <Ionicons
                  name='sparkles-outline'
                  size={16}
                  color={theme.primary}
                />
              </View>
              <ThemedText style={styles.heroKicker}>
                {t('dashboard')}
              </ThemedText>
            </View>

            <ThemedText style={styles.heroGreeting}>
              {getGreeting()}
              {user.firstName ? `, ${user.firstName}!` : '!'}
            </ThemedText>

            <ThemedText style={styles.heroDate}>
              {DateTime.now().toFormat('DDDD', {
                locale: user.locale,
              })}
            </ThemedText>

            <View style={styles.summaryPillsRow}>
              <SummaryPill
                icon='calendar-outline'
                label={t('upcomingAppointments')}
                value={upcomingCount.toString()}
                color='#f59e0b'
              />
              <SummaryPill
                icon='document-text-outline'
                label={t('totalInvoices')}
                value={totalInvoicesCount.toString()}
                color='#10b981'
              />
              <SummaryPill
                icon='cash-outline'
                label={t('balanceDue')}
                value={`$${Math.round(balanceDueAmount).toLocaleString(user.locale || 'en')}`}
                color='#eab308'
              />
              <SummaryPill
                icon='alert-circle-outline'
                label={t('overdueInvoices')}
                value={overdueInvoicesCount.toString()}
                color='#ef4444'
              />
            </View>
          </View>
        )}

        <View style={styles.nextAppointmentCard}>
          <View style={styles.nextAppointmentHeader}>
            <View style={styles.nextAppointmentIconWrap}>
              <Ionicons
                name='calendar-outline'
                size={16}
                color={theme.primary}
              />
            </View>
            <Text
              style={[styles.nextAppointmentTitle, { color: theme.foreground }]}
            >
              {t('upcomingAppointments')}
            </Text>
          </View>

          {nextAppointment ? (
            <>
              <Text
                style={[
                  styles.nextAppointmentService,
                  { color: theme.foreground },
                ]}
              >
                {nextAppointment.service.name}
              </Text>
              <Text
                style={[
                  styles.nextAppointmentMeta,
                  { color: theme.mutedForeground },
                ]}
              >
                {nextAppointmentDateTime}
              </Text>
              <Text
                style={[
                  styles.nextAppointmentMeta,
                  { color: theme.mutedForeground },
                ]}
              >
                {nextAppointment.staffMember.firstName}{' '}
                {nextAppointment.staffMember.lastName}
              </Text>
              <TouchableOpacity
                style={styles.nextAppointmentButton}
                onPress={() => router.push('/(app)/appointments')}
                activeOpacity={0.85}
              >
                <Text style={styles.nextAppointmentButtonText}>
                  {t('myAppointments')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.nextAppointmentService,
                  { color: theme.foreground },
                ]}
              >
                {t('noAppointments')}
              </Text>
              <Text
                style={[
                  styles.nextAppointmentMeta,
                  { color: theme.mutedForeground },
                ]}
              >
                {t('noAppointmentsDescription')}
              </Text>
              <TouchableOpacity
                style={styles.nextAppointmentButton}
                onPress={() =>
                  router.push('/(app)/appointments/(tabs)/services')
                }
                activeOpacity={0.85}
              >
                <Text style={styles.nextAppointmentButtonText}>
                  {t('createAppointment')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
            {t('quickActions')}
          </Text>
          <View style={styles.actionsContainer}>
            <ActionButton
              icon='calendar'
              label={t('createAppointment')}
              subtitle={t('myAppointments')}
              onPress={() => router.push('/(app)/appointments/(tabs)/services')}
              color={theme.primary}
            />
            <ActionButton
              icon='receipt-outline'
              label={t('addExpense')}
              subtitle={t('trackExpenses')}
              onPress={() => router.push('/(app)/expenses/create')}
              color='#10b981'
            />
            <ActionButton
              icon='document-text-outline'
              label={t('createInvoice')}
              subtitle={t('ManageInvoices')}
              onPress={() => router.push('/(app)/invoices/create')}
              color='#f59e0b'
            />
            <ActionButton
              icon='business-outline'
              label={t('newCompany')}
              subtitle={t('servicesBusinessRegistrationsTitle')}
              onPress={() => router.push('/(app)/invoices/companies/create')}
              color='#8b5cf6'
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface SummaryPillProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

function SummaryPill({ icon, label, value, color }: SummaryPillProps) {
  return (
    <View style={styles.summaryPill}>
      <View style={styles.summaryPillHeader}>
        <View
          style={[styles.summaryPillIcon, { backgroundColor: `${color}20` }]}
        >
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text
          style={[styles.summaryPillLabel, { color: theme.mutedForeground }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.summaryPillValue, { color: theme.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

function ActionButton({
  icon,
  label,
  subtitle,
  onPress,
  color,
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.actionHeader}>
        <View
          style={[
            styles.actionIconContainer,
            { backgroundColor: `${color}20` },
          ]}
        >
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Ionicons
          name='chevron-forward-outline'
          size={18}
          color={theme.mutedForeground}
        />
      </View>
      <Text style={[styles.actionLabel, { color: theme.foreground }]}>
        {label}
      </Text>
      <Text style={styles.actionHint}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function DashboardSkeleton() {
  return (
    <View style={{ gap: 16 }}>
      <View style={styles.skeletonGreetingContainer}>
        <View style={[styles.skeletonBlock, styles.skeletonGreetingTitle]} />
        <View style={[styles.skeletonBlock, styles.skeletonGreetingDate]} />
      </View>

      <View style={styles.section}>
        <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
        <View style={styles.summaryPillsRow}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={`summary-skeleton-${index}`}
              style={styles.skeletonSummaryCard}
            >
              <View style={styles.skeletonSummaryTop}>
                <View
                  style={[styles.skeletonBlock, styles.skeletonSummaryIcon]}
                />
                <View
                  style={[styles.skeletonBlock, styles.skeletonSummaryLabel]}
                />
              </View>
              <View
                style={[styles.skeletonBlock, styles.skeletonSummaryValue]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.skeletonBlock, styles.skeletonSectionTitle]} />
        <View style={styles.actionsContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={`action-skeleton-${index}`}
              style={styles.skeletonActionCard}
            >
              <View style={[styles.skeletonBlock, styles.skeletonActionIcon]} />
              <View
                style={[styles.skeletonBlock, styles.skeletonActionLabel]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    marginBottom: 16,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroSparkWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  heroKicker: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.foreground,
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    color: theme.mutedForeground,
    marginBottom: 14,
  },
  summaryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryPill: {
    width: '48%',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  summaryPillHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryPillIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPillValue: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 10,
  },
  summaryPillLabel: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  nextAppointmentCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    marginBottom: 20,
    gap: 6,
  },
  nextAppointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nextAppointmentIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  nextAppointmentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextAppointmentService: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  nextAppointmentMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  nextAppointmentButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  nextAppointmentButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primaryForeground,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 122,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
    color: theme.foreground,
    width: '100%',
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'left',
    lineHeight: 16,
    width: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 18,
  },
  actionHint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.mutedForeground,
    marginTop: 4,
  },
  skeletonGreetingContainer: {
    gap: 8,
    marginBottom: 4,
  },
  skeletonSectionTitle: {
    width: 140,
    height: 20,
    borderRadius: 6,
    marginBottom: 16,
  },
  skeletonCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    gap: 10,
  },
  skeletonActionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    gap: 10,
  },
  skeletonSummaryCard: {
    width: '48%',
    minHeight: 100,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    justifyContent: 'space-between',
    gap: 10,
  },
  skeletonSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonSummaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  skeletonSummaryLabel: {
    height: 12,
    borderRadius: 6,
    flex: 1,
  },
  skeletonSummaryValue: {
    width: '55%',
    height: 20,
    borderRadius: 6,
  },
  skeletonBlock: {
    backgroundColor: theme.muted,
    opacity: 0.4,
  },
  skeletonGreetingTitle: {
    width: '70%',
    height: 28,
    borderRadius: 8,
  },
  skeletonGreetingDate: {
    width: '42%',
    height: 14,
    borderRadius: 6,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  skeletonValue: {
    width: 80,
    height: 22,
    borderRadius: 6,
  },
  skeletonLabel: {
    width: '75%',
    height: 12,
    borderRadius: 6,
  },
  skeletonActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  skeletonActionLabel: {
    width: '72%',
    height: 14,
    borderRadius: 6,
  },
});
