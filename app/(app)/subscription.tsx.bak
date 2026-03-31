/**
 * Subscription Screen
 * Displays available subscription plans and allows users to purchase
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PurchasesPackage } from 'react-native-purchases';
import { useSubscription } from '@/core/subscription/SubscriptionContext';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { TRIAL_LIMITS } from '@ascencio/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const { offerings, purchasePackage, restorePurchases } = useSubscription();
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(
    null,
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const insets = useSafeAreaInsets();

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasingPackageId(pkg.identifier);
      const success = await purchasePackage(pkg);

      if (success) {
        Alert.alert(
          t('subscriptionActivated'),
          t('youNowHaveAccessToAllFeatures'),
          [
            {
              text: t('ok'),
              onPress: () => router.back(),
            },
          ],
        );
      }
    } catch {
      Alert.alert(t('error'), t('couldNotCompletePurchase'));
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      const success = await restorePurchases();

      if (success) {
        Alert.alert(
          t('subscriptionRestored'),
          t('yourSubscriptionHasBeenRestored'),
        );
      } else {
        Alert.alert(
          t('noSubscriptionFound'),
          t('noActiveSubscriptionToRestore'),
        );
      }
    } catch (error) {
      Alert.alert(t('error'), t('couldNotRestorePurchases'));
    } finally {
      setIsRestoring(false);
    }
  };

  const benefits = [
    { icon: 'business' as const, text: t('unlimitedCompanies') },
    { icon: 'people' as const, text: t('unlimitedClients') },
    { icon: 'cash' as const, text: t('unlimitedExpenses') },
    { icon: 'document' as const, text: t('unlimitedInvoices') },
    { icon: 'bar-chart' as const, text: t('advancedReports') },
    { icon: 'shield-checkmark' as const, text: t('prioritySupport') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={48} color={theme.primary} />
        <ThemedText style={styles.title}>
          {t('unlockPremiumFeatures')}
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
                {TRIAL_LIMITS.TRIAL_DAYS} {t('freeTrial')}
              </ThemedText>
              <ThemedText style={styles.trialSubtitle}>
                {t('trialDaysOffer', { days: TRIAL_LIMITS.TRIAL_DAYS })}
              </ThemedText>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <ThemedText style={styles.sectionTitle}>{t('whatYouGet')}</ThemedText>

      <Card style={styles.card}>
        <CardContent>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name={benefit.icon} size={24} color={theme.primary} />
              <ThemedText style={styles.featureText}>{benefit.text}</ThemedText>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Plans */}
      {offerings?.current?.availablePackages.map((pkg, index) => {
        const isPopular = pkg.packageType === 'ANNUAL';
        const isLoading = purchasingPackageId === pkg.identifier;

        return (
          <Card
            key={pkg.identifier}
            style={[styles.planCard, isPopular && styles.popularCard]}
          >
            <CardContent>
              {isPopular && (
                <View style={styles.popularBadge}>
                  <ThemedText style={styles.popularText}>
                    {t('mostPopular').toUpperCase()}
                  </ThemedText>
                </View>
              )}

              <View style={styles.planHeader}>
                <ThemedText style={styles.planTitle}>
                  {pkg.product.title}
                </ThemedText>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.price}>
                    {pkg.product.priceString}
                  </ThemedText>
                  <ThemedText style={styles.period}>
                    /
                    {pkg.packageType === 'ANNUAL'
                      ? t('perYear')
                      : t('perMonth')}
                  </ThemedText>
                </View>
              </View>

              <Button
                fullWidth
                onPress={() => handlePurchase(pkg)}
                disabled={isLoading}
                style={styles.selectButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <ButtonIcon name="checkmark-circle" />
                    <ButtonText>{t('selectPlan')}</ButtonText>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {!offerings?.current && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={styles.loadingText}>Cargando planes...</ThemedText>
        </View>
      )}

      {/* Restore Purchases */}
      <Button
        variant="outline"
        fullWidth
        onPress={handleRestore}
        disabled={isRestoring}
        style={styles.restoreButton}
      >
        {isRestoring ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <>
            <ButtonIcon name="refresh" />
            <ButtonText>{t('restorePurchases')}</ButtonText>
          </>
        )}
      </Button>

      {/* Footer */}
      <ThemedText style={styles.footerText}>
        {t('cancelAnytime')} • {t('securePayment')} • {t('instantAccess')}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  planCard: {
    marginBottom: 16,
  },
  popularCard: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    color: theme.mutedForeground,
    marginLeft: 4,
  },
  selectButton: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: theme.mutedForeground,
    fontSize: 16,
  },
  restoreButton: {
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
