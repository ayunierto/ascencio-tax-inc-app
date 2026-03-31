import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { theme } from '../ui/theme';

export const ServiceCardSkeleton = () => {
  return (
    <Card style={{ marginBottom: 12 }}>
      <CardContent>
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          {/* Image Skeleton */}
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: theme.radius,
              backgroundColor: theme.muted,
              opacity: 0.5,
            }}
          />

          {/* Content Skeleton */}
          <View style={{ flex: 1, gap: 8 }}>
            {/* Title */}
            <View
              style={{
                height: 18,
                backgroundColor: theme.muted,
                borderRadius: 4,
                width: '80%',
                opacity: 0.5,
              }}
            />

            {/* Description */}
            <View
              style={{
                height: 14,
                backgroundColor: theme.muted,
                borderRadius: 4,
                width: '100%',
                opacity: 0.3,
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

            {/* Meta info */}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
              <View
                style={{
                  height: 12,
                  backgroundColor: theme.muted,
                  borderRadius: 4,
                  width: 60,
                  opacity: 0.3,
                }}
              />
              <View
                style={{
                  height: 12,
                  backgroundColor: theme.muted,
                  borderRadius: 4,
                  width: 60,
                  opacity: 0.3,
                }}
              />
            </View>

            {/* Button */}
            <View
              style={{
                height: 32,
                backgroundColor: theme.muted,
                borderRadius: theme.radius,
                marginTop: 8,
                opacity: 0.3,
              }}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export const ServiceListSkeleton = () => {
  return (
    <View style={{ padding: 20 }}>
      {/* Header skeleton */}
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            height: 28,
            backgroundColor: theme.muted,
            borderRadius: 4,
            width: '70%',
            opacity: 0.5,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 16,
            backgroundColor: theme.muted,
            borderRadius: 4,
            width: '50%',
            opacity: 0.3,
          }}
        />
      </View>

      {/* Search bar skeleton */}
      <View
        style={{
          height: 48,
          backgroundColor: theme.muted,
          borderRadius: theme.radius,
          marginBottom: 20,
          opacity: 0.3,
        }}
      />

      {/* Service cards skeleton */}
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
    </View>
  );
};
