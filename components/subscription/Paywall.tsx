/**
 * Paywall Component
 * Displays premium features and subscription options when a feature is locked
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PremiumFeature, TRIAL_LIMITS } from '@ascencio/shared';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';

interface PaywallProps {
  feature?: PremiumFeature;
  onClose?: () => void;
  isModal?: boolean;
}

export function Paywall({ feature, onClose, isModal = false }: PaywallProps) {
  const { t } = useTranslation();

  const handleViewPlans = () => {
    if (onClose) onClose();
    router.push('/subscription');
  };

  const getFeatureName = (feature?: PremiumFeature): string => {
    if (!feature) return t('premiumFeatures');

    switch (feature) {
      case PremiumFeature.COMPANIES:
        return t('companies');
      case PremiumFeature.CLIENTS:
        return t('myClients');
      case PremiumFeature.EXPENSES:
        return t('expenses');
      case PremiumFeature.INVOICES:
        return t('invoices');
      case PremiumFeature.REPORTS:
        return t('reports');
      default:
        return t('premiumFeatures');
    }
  };

  const benefits = [
    {
      icon: 'business' as const,
      title: t('unlimitedCompanies'),
      description: t('manageAllYourCompanies'),
    },
    {
      icon: 'people' as const,
      title: t('unlimitedClients'),
      description: t('trackAllYourClients'),
    },
    {
      icon: 'cash' as const,
      title: t('unlimitedExpenses'),
      description: t('recordAllExpenses'),
    },
    {
      icon: 'document' as const,
      title: t('unlimitedInvoices'),
      description: t('createUnlimitedInvoices'),
    },
    {
      icon: 'bar-chart' as const,
      title: t('advancedReports'),
      description: t('detailedFinancialReports'),
    },
    {
      icon: 'shield-checkmark' as const,
      title: t('prioritySupport'),
      description: t('getDedicatedSupport'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        {isModal && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.foreground} />
          </TouchableOpacity>
        )}

        <Ionicons name="diamond" size={48} color={theme.primary} />
        <ThemedText style={styles.title}>
          {feature
            ? t('unlockFeature', { feature: getFeatureName(feature) })
            : t('unlockPremiumFeatures')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('upgradeToAccessAllFeatures')}
        </ThemedText>
      </View>

      {/* Trial Banner */}
      <Card style={styles.trialCard}>
        <CardContent>
          <View style={styles.trialBanner}>
            <Ionicons name="gift" size={28} color={theme.primary} />
            <View style={styles.trialTextContainer}>
              <ThemedText style={styles.trialTitle}>
                {t('startFreeTrial')}
              </ThemedText>
              <ThemedText style={styles.trialSubtitle}>
                {t('trialDaysOffer', { days: TRIAL_LIMITS.TRIAL_DAYS })}
              </ThemedText>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Benefits */}
      <ThemedText style={styles.sectionTitle}>{t('whatYouGet')}</ThemedText>

      <Card style={styles.card}>
        <CardContent>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name={benefit.icon} size={24} color={theme.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <ThemedText style={styles.benefitTitle}>
                  {benefit.title}
                </ThemedText>
                <ThemedText style={styles.benefitDescription}>
                  {benefit.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* CTA Button */}
      <Button fullWidth onPress={handleViewPlans} style={styles.ctaButton}>
        <ButtonIcon name="sparkles" />
        <ButtonText>{t('viewPlans')}</ButtonText>
      </Button>

      {/* Footer */}
      <ThemedText style={styles.footerText}>
        {t('cancelAnytime')} • {t('securePayment')}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.mutedForeground,
    textAlign: 'center',
  },
  trialCard: {
    marginBottom: 24,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trialTextContainer: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trialSubtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  ctaButton: {
    marginBottom: 24,
  },
  footerText: {
    fontSize: 13,
    color: theme.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
