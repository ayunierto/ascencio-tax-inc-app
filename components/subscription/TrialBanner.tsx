/**
 * Trial Banner Component
 * Displays trial status and encourages upgrades
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/core/subscription/SubscriptionContext';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { PremiumFeature, getRemainingItems } from '@ascencio/shared';

interface TrialBannerProps {
  feature?: PremiumFeature;
  style?: any;
}

export function TrialBanner({ feature, style }: TrialBannerProps) {
  const { t } = useTranslation();
  const { subscriptionStatus, usageLimits, canAccessFeature } =
    useSubscription();

  // Don't show banner if user has active subscription
  if (subscriptionStatus.isActive) {
    return null;
  }

  // Don't show if user can't access this feature at all
  if (feature && !canAccessFeature(feature)) {
    return null;
  }

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  const getRemainingText = (): string => {
    if (!feature) return '';

    let currentUsage = 0;
    switch (feature) {
      case PremiumFeature.COMPANIES:
        currentUsage = usageLimits.companies;
        break;
      case PremiumFeature.CLIENTS:
        currentUsage = usageLimits.clients;
        break;
      case PremiumFeature.EXPENSES:
        currentUsage = usageLimits.expenses;
        break;
      case PremiumFeature.INVOICES:
        currentUsage = usageLimits.invoices;
        break;
    }

    const remaining = getRemainingItems(
      feature,
      currentUsage,
      subscriptionStatus.isInTrial,
    );
    return t('remainingItems', { count: remaining });
  };

  const getDaysRemainingText = (): string => {
    if (!subscriptionStatus.trialEndDate) return '';

    const now = new Date();
    const endDate = new Date(subscriptionStatus.trialEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return t('trialEnded');
    }

    return t('daysRemaining', { count: diffDays });
  };

  return (
    <Card style={[styles.container, style]}>
      <CardContent>
        <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.8}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={
                  subscriptionStatus.isInTrial ? 'time-outline' : 'lock-closed'
                }
                size={24}
                color={theme.primary}
              />
            </View>

            <View style={styles.textContainer}>
              <ThemedText style={styles.title}>
                {subscriptionStatus.isInTrial
                  ? t('freeTrial')
                  : t('limitedAccess')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {subscriptionStatus.isInTrial
                  ? `${getDaysRemainingText()} • ${feature ? getRemainingText() : ''}`
                  : t('upgradeForUnlimitedAccess')}
              </ThemedText>
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.primary} />
          </View>
        </TouchableOpacity>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
