import { ScrollView, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { theme } from '@/components/ui/theme';
import AvailabilityForm from '@/core/booking/components/AvailabilityForm';
import { EmptyContent } from '@/core/components';
import { useServices } from '@/core/services/hooks/useServices';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { Button, ButtonIcon, ButtonText } from '@/components/ui';
import { toast } from 'sonner-native';

export default function SelectAvailabilityScreen() {
  const { t } = useTranslation();
  const { data: servicesResponse } = useServices();
  const { service } = useBookingStore();

  if (!service) {
    return (
      <EmptyContent
        title={t('servicesNotFound')}
        icon="alert-circle-outline"
        action={
          <Button onPress={() => router.push('/(app)/services')}>
            <ButtonIcon name="arrow-back-outline" />
            <ButtonText>{t('tryAdjustingSearch')}</ButtonText>
          </Button>
        }
      />
    );
  }

  if (!servicesResponse) {
    return (
      <EmptyContent
        title="Services not found"
        subtitle="An unexpected error has occurred. Please try again later."
      />
    );
  }

  if (!service.staffMembers || service.staffMembers.length === 0) {
    return (
      <EmptyContent
        title="Staff not found"
        subtitle="An unexpected error has occurred. The service has no assigned staff. Please contact the administrator."
        icon="alert-circle-outline"
      />
    );
  }

  const handleBooking = (): void => {
    toast.success(t('preferenceSaved'));
    router.push('/(app)/appointments/new/details');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <BookingProgressStepper currentStep={1} />

        <View style={styles.header}>
          <ThemedText style={styles.title}>Select your preferences</ThemedText>
          <ThemedText style={styles.subtitle}>
            Check out our availability and book the date and time that works for
            you.
          </ThemedText>
        </View>

        <AvailabilityForm
          services={servicesResponse?.items || []}
          selectedService={service}
          serviceStaff={service.staffMembers}
          onSubmit={handleBooking}
        />
      </View>
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
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
});
