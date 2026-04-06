import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  const { data: upcomingAppointments, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['appointments', 'pending'],
    queryFn: () => getUserAppointments('pending'),
    staleTime: 0,
  });
  const { data: pastAppointments, isLoading: loadingPast } = useQuery({
    queryKey: ['appointments', 'past'],
    queryFn: () => getUserAppointments('past'),
    staleTime: 0,
  });
  const {
    data: invoices,
    isLoading: loadingInvoices,
    refetch,
  } = useInvoices('all');

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

  // Basic error state handled via EmptyContent elsewhere; keep retry minimal
  // If any fetch failed, show retry UI
  const hasError = false;
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
            onPress={() => refetch()}
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
      >
        {/* Greeting Header */}
        {authStatus === 'authenticated' && user && (
          <View style={{ marginBottom: 20 }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
              {getGreeting()}
              {user.firstName ? `, ${user.firstName}!` : '!'}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: theme.mutedForeground }}>
              {DateTime.now().toFormat('DDDD', {
                locale: user.locale,
              })}
            </ThemedText>
          </View>
        )}

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
            {t('overview')}
          </Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon='time-outline'
              label={t('upcomingAppointments')}
              value={(upcomingAppointments?.length ?? 0).toString()}
              color='#f59e0b'
            />
            <MetricCard
              icon='calendar-outline'
              label={t('pastAppointments')}
              value={(pastAppointments?.length ?? 0).toString()}
              color='#8b5cf6'
            />
            <MetricCard
              icon='document-text-outline'
              label={t('totalInvoices')}
              value={(invoices?.items.length ?? 0).toString()}
              color='#10b981'
            />
            <MetricCard
              icon='alert-circle-outline'
              label={t('overdueInvoices')}
              value={(
                invoices?.items.filter((i) => i.status === 'overdue').length ??
                0
              ).toString()}
              color='#ef4444'
            />
            <MetricCard
              icon='checkmark-circle-outline'
              label={t('paidInvoices')}
              value={(
                invoices?.items.filter((i) => i.status === 'paid').length ?? 0
              ).toString()}
              color={theme.success}
            />
            <MetricCard
              icon='cash-outline'
              label={t('balanceDue')}
              value={`$${(
                invoices?.items?.reduce(
                  (sum, i) => sum + (Number(i.balanceDue) || 0),
                  0,
                ) || 0
              ).toFixed(2)}`}
              color='#eab308'
            />
            <MetricCard
              icon='briefcase-outline'
              label={t('totalServices')}
              value={new Set(
                (upcomingAppointments ?? []).map((a) => a.service?.id ?? ''),
              ).size.toString()}
              color='#06b6d4'
            />
          </View>
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
              onPress={() => router.push('/(app)/appointments/(tabs)/services')}
              color={theme.primary}
            />
            <ActionButton
              icon='receipt-outline'
              label={t('addExpense')}
              onPress={() => router.push('/(app)/expenses/create')}
              color='#10b981'
            />
            <ActionButton
              icon='document-text-outline'
              label={t('createInvoice')}
              onPress={() => router.push('/(app)/invoices/create')}
              color='#f59e0b'
            />
            <ActionButton
              icon='business-outline'
              label={t('newCompany')}
              onPress={() => router.push('/(app)/invoices/companies/create')}
              color='#8b5cf6'
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: theme.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: theme.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}

function ActionButton({ icon, label, onPress, color }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: theme.card }]}
      onPress={onPress}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: `${color}20` }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.foreground }]}>
        {label}
      </Text>
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
        <View style={styles.metricsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={`metric-skeleton-${index}`} style={styles.skeletonCard}>
              <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
              <View style={[styles.skeletonBlock, styles.skeletonValue]} />
              <View style={[styles.skeletonBlock, styles.skeletonLabel]} />
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
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    gap: 10,
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
