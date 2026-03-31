import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card, CardContent } from '@/components/ui';
import { theme } from '@/components/ui/theme';
import { useServices } from '@/core/services/hooks/useServices';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { Ionicons } from '@expo/vector-icons';

export default function SelectServiceScreen() {
  const { data: servicesResponse, isLoading } = useServices();
  const { updateState, resetBooking } = useBookingStore();

  // Reset booking state when entering
  useEffect(() => {
    resetBooking();
  }, [resetBooking]);

  const handleSelectService = (service: any) => {
    updateState({ service });
    router.push('/(app)/appointments/new/availability');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ThemedText>Loading services...</ThemedText>
      </View>
    );
  }

  if (!servicesResponse || servicesResponse.items.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText>No services available</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Select a Service</ThemedText>
        <ThemedText style={styles.subtitle}>
          {"Choose the service you'd like to book"}
        </ThemedText>
      </View>

      <View style={styles.servicesList}>
        {servicesResponse.items.map((service) => (
          <TouchableOpacity
            key={service.id}
            onPress={() => handleSelectService(service)}
          >
            <Card style={styles.serviceCard}>
              <CardContent style={styles.serviceContent}>
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={32}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.serviceInfo}>
                  <ThemedText style={styles.serviceName}>
                    {service.name}
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={theme.mutedForeground}
                />
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    marginBottom: 8,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
