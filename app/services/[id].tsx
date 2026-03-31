import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { Card, CardContent, CustomHeader, HeaderButton } from '@/components/ui';
import { theme } from '@/components/ui/theme';
import { useServices } from '@/core/services/hooks/useServices';
import { EmptyContent } from '@/core/components';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import Toast from 'react-native-toast-message';
import { StaffMember } from '@ascencio/shared/interfaces';
import Loader from '@/components/Loader';

export default function ServiceDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: servicesResponse, isPending } = useServices();
  const { updateState } = useBookingStore();
  const { authStatus } = useAuthStore();

  const service = servicesResponse?.items.find((s) => s.id === id);

  const handleBookNow = () => {
    if (!service) return;

    updateState({ service });

    if (authStatus !== 'authenticated') {
      router.push('/login');
      Toast.show({
        type: 'info',
        text1: t('pleaseSignInToBook'),
        text2: t('pleaseSignInDescription'),
      });
      return;
    }

    router.push('/appointments/new/availability');
  };

  if (isPending) {
    return <Loader />;
  }

  if (!service) {
    return (
      <EmptyContent
        title={t('serviceNotFound')}
        subtitle={t('serviceNotFoundDescription')}
        icon="alert-circle-outline"
      />
    );
  }

  return (
    <>
      <CustomHeader
        title={service?.name || t('serviceDetails')}
        left={
          <HeaderButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </HeaderButton>
        }
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Service Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: service.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {!service.isActive && (
              <View style={styles.inactiveBadge}>
                <Ionicons name="alert-circle" size={16} color="#fff" />
                <ThemedText style={styles.inactiveBadgeText}>
                  {t('currentlyUnavailable')}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Service Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>{service.name}</ThemedText>
          </View>

          {/* Description Section */}
          {service.description && (
            <Card style={styles.section}>
              <CardContent style={styles.sectionContent}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={theme.primary}
                  />
                  <ThemedText style={styles.sectionTitle}>
                    {t('serviceDescription')}
                  </ThemedText>
                </View>
                <ThemedText style={styles.description}>
                  {service.description}
                </ThemedText>
              </CardContent>
            </Card>
          )}

          {/* Staff Section */}
          {service.staffMembers && service.staffMembers.length > 0 && (
            <Card style={styles.section}>
              <CardContent style={styles.sectionContent}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={theme.primary}
                  />
                  <ThemedText style={styles.sectionTitle}>
                    {t('availableStaff')} ({service.staffMembers.length})
                  </ThemedText>
                </View>

                <View style={styles.staffList}>
                  {service.staffMembers.map((staffMember: StaffMember) => (
                    <View key={staffMember.id} style={styles.staffItem}>
                      <View style={styles.staffAvatar}>
                        <Ionicons
                          name="person"
                          size={20}
                          color={theme.primary}
                        />
                      </View>
                      <View style={styles.staffInfo}>
                        <ThemedText style={styles.staffName}>
                          {staffMember.firstName} {staffMember.lastName}
                        </ThemedText>
                        <View style={styles.staffStatus}>
                          <View
                            style={[
                              styles.statusDot,
                              staffMember.isActive && styles.statusDotActive,
                            ]}
                          />
                          <ThemedText style={styles.staffStatusText}>
                            {staffMember.isActive
                              ? t('available')
                              : t('unavailable')}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          )}

          {/* Service Availability */}
          <Card style={styles.section}>
            <CardContent style={styles.sectionContent}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={theme.primary}
                />
                <ThemedText style={styles.sectionTitle}>
                  {t('serviceAvailability')}
                </ThemedText>
              </View>

              <View style={styles.availabilityList}>
                <View
                  style={[
                    styles.availabilityItem,
                    service.isAvailableOnline && styles.availabilityItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      service.isAvailableOnline && styles.availabilityDotActive,
                    ]}
                  />
                  <Ionicons
                    name="laptop-outline"
                    size={20}
                    color={
                      service.isAvailableOnline
                        ? theme.primary
                        : theme.mutedForeground
                    }
                  />
                  <View style={styles.availabilityText}>
                    <ThemedText
                      style={[
                        styles.availabilityLabel,
                        service.isAvailableOnline &&
                          styles.availabilityLabelActive,
                      ]}
                    >
                      {t('onlineService')}
                    </ThemedText>
                    <ThemedText style={styles.availabilityStatus}>
                      {service.isAvailableOnline
                        ? t('availableRemotely')
                        : t('notAvailableOnline')}
                    </ThemedText>
                  </View>
                </View>

                <View
                  style={[
                    styles.availabilityItem,
                    !service.isAvailableOnline && styles.availabilityItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      !service.isAvailableOnline &&
                        styles.availabilityDotActive,
                    ]}
                  />
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={
                      !service.isAvailableOnline
                        ? theme.primary
                        : theme.mutedForeground
                    }
                  />
                  <View style={styles.availabilityText}>
                    <ThemedText
                      style={[
                        styles.availabilityLabel,
                        !service.isAvailableOnline &&
                          styles.availabilityLabelActive,
                      ]}
                    >
                      {t('inPersonService')}
                    </ThemedText>
                    <ThemedText style={styles.availabilityStatus}>
                      {!service.isAvailableOnline
                        ? t('visitOurOffice')
                        : t('alsoAvailableInPerson')}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
        <Button
          onPress={handleBookNow}
          disabled={!service.isActive}
          style={styles.bookButton}
        >
          <ButtonIcon name="calendar-outline" />
          <ButtonText size="lg">
            {service.isActive ? t('bookNow') : t('currentlyUnavailable')}
          </ButtonText>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    backgroundColor: theme.muted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.destructive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${theme.primary}15`,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
  staffList: {
    gap: 12,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  staffStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.mutedForeground,
  },
  statusDotActive: {
    backgroundColor: '#22c55e',
  },
  staffStatusText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  availabilityList: {
    gap: 16,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: `${theme.mutedForeground}30`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  availabilityItemActive: {
    backgroundColor: `${theme.primary}40`,
    borderColor: `${theme.primary}30`,
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.mutedForeground,
  },
  availabilityDotActive: {
    backgroundColor: '#22c55e',
  },
  availabilityText: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.mutedForeground,
    marginBottom: 2,
  },
  availabilityLabelActive: {
    color: theme.foreground,
  },
  availabilityStatus: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  bookButton: {
    width: '100%',
  },
});
