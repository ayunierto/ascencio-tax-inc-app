import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Button, ButtonText } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { theme } from '../ui/theme';
import { ThemedText } from '../ui/ThemedText';
import { Service } from '@ascencio/shared/interfaces';

interface ServiceCardProps {
  service: Service;
  selectService: (service: Service) => void;
}

export const ServiceCard = ({ service, selectService }: ServiceCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectService(service)}
      style={{ marginBottom: 12 }}
    >
      <Card>
        <CardContent>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            {/* Service Image */}
            <Image
              style={{
                width: 70,
                height: 70,
                borderRadius: theme.radius,
                backgroundColor: theme.muted,
              }}
              source={{ uri: service.imageUrl }}
            />

            {/* Service Info */}
            <View style={{ flex: 1, gap: 6 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    flex: 1,
                    marginRight: 8,
                  }}
                  numberOfLines={2}
                >
                  {service.name}
                </ThemedText>

                {/* Active Badge */}
                {!service.isActive && (
                  <View
                    style={{
                      backgroundColor: theme.destructive + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 10,
                        color: theme.destructive,
                        fontWeight: '600',
                      }}
                    >
                      Unavailable
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Meta Info */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 16,
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                {/* Duration */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    size={16}
                    color={theme.mutedForeground}
                    name="time-outline"
                  />
                  <ThemedText
                    style={{ fontSize: 13, color: theme.mutedForeground }}
                  >
                    {service.durationMinutes} min
                  </ThemedText>
                </View>

                {/* Online/In-person */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    size={16}
                    color={
                      service.isAvailableOnline
                        ? theme.primary
                        : theme.mutedForeground
                    }
                    name={
                      service.isAvailableOnline
                        ? 'videocam'
                        : 'location-outline'
                    }
                  />
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: service.isAvailableOnline
                        ? theme.primary
                        : theme.mutedForeground,
                    }}
                  >
                    {service.isAvailableOnline ? 'Online' : 'In-person'}
                  </ThemedText>
                </View>
              </View>

              {/* Read More Button */}
              <Button
                onPress={() => selectService(service)}
                size="sm"
                style={{ marginTop: 8 }}
                variant="outline"
              >
                <ButtonText>Read More</ButtonText>
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};
