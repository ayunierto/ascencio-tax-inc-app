import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { theme } from '../ui/theme';

export const AppointmentCardSkeleton = () => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <CardContent>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Title */}
            <View
              style={{
                height: 20,
                backgroundColor: theme.muted,
                borderRadius: 4,
                width: '70%',
                opacity: 0.5,
                marginBottom: 8,
              }}
            />
            {/* Relative time */}
            <View
              style={{
                height: 14,
                backgroundColor: theme.muted,
                borderRadius: 4,
                width: '40%',
                opacity: 0.3,
              }}
            />
          </View>

          {/* Badge */}
          <View
            style={{
              height: 24,
              width: 80,
              backgroundColor: theme.muted,
              borderRadius: 12,
              opacity: 0.3,
            }}
          />
        </View>

        {/* Date info */}
        <View style={{ marginBottom: 12 }}>
          <View
            style={{
              height: 14,
              backgroundColor: theme.muted,
              borderRadius: 4,
              width: '80%',
              opacity: 0.3,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 14,
              backgroundColor: theme.muted,
              borderRadius: 4,
              width: '60%',
              opacity: 0.3,
            }}
          />
        </View>

        {/* Staff */}
        <View
          style={{
            height: 14,
            backgroundColor: theme.muted,
            borderRadius: 4,
            width: '50%',
            opacity: 0.3,
            marginBottom: 16,
          }}
        />

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              flex: 1,
              height: 36,
              backgroundColor: theme.muted,
              borderRadius: theme.radius,
              opacity: 0.3,
            }}
          />
        </View>
      </CardContent>
    </Card>
  );
};

export const AppointmentListSkeleton = () => {
  return (
    <View style={{ padding: 20 }}>
      <AppointmentCardSkeleton />
      <AppointmentCardSkeleton />
      <AppointmentCardSkeleton />
    </View>
  );
};
