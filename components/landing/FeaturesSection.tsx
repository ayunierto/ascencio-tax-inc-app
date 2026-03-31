import { View, StyleSheet } from 'react-native';
import FeatureCard from '@/components/features/home/FeatureCard';
import { useTranslation } from 'react-i18next';

export function FeaturesSection() {
  const { t } = useTranslation();
  const FEATURES = [
    {
      icon: 'calendar-outline' as const,
      title: t('easyAppointment'),
      description: t('easyAppointmentDescription'),
    },
    {
      icon: 'receipt-outline' as const,
      title: t('trackExpenses'),
      description: t('trackExpensesDescription'),
    },
    {
      icon: 'document-text-outline' as const,
      title: t('ManageInvoices'),
      description: t('ManageInvoicesDescription'),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: t('secureAndPrivate'),
      description: t('secureAndPrivateDescription'),
    },
  ];

  return (
    <View style={styles.featuresSection}>
      {/* <ThemedText style={styles.sectionTitle}>Why Choose Us?</ThemedText> */}

      <View style={styles.featuresList}>
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featuresSection: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  // sectionTitle: {
  //   fontSize: 28,
  //   fontWeight: 'bold',
  //   marginBottom: 32,
  //   textAlign: 'center',
  // },
  featuresList: {
    gap: 16,
  },
});
