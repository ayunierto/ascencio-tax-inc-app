import React from 'react';
import { View } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { theme } from '../ui/theme';

export const PostCardSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <View style={{ gap: 12 }}>
          {/* Title skeleton */}
          <View
            style={{
              height: 20,
              backgroundColor: theme.muted + '40',
              borderRadius: theme.radius / 2,
              width: '80%',
            }}
          />
          {/* Description skeleton */}
          <View
            style={{
              height: 16,
              backgroundColor: theme.muted + '40',
              borderRadius: theme.radius / 2,
              width: '100%',
            }}
          />
          <View
            style={{
              height: 16,
              backgroundColor: theme.muted + '40',
              borderRadius: theme.radius / 2,
              width: '60%',
            }}
          />
          {/* Footer skeleton */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <View
              style={{
                height: 12,
                backgroundColor: theme.muted + '40',
                borderRadius: theme.radius / 2,
                width: 100,
              }}
            />
            <View
              style={{
                height: 12,
                backgroundColor: theme.muted + '40',
                borderRadius: theme.radius / 2,
                width: 60,
              }}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

export const PostListSkeleton = () => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 10, gap: 10 }}>
        {/* Logo skeleton */}
        <View
          style={{
            height: 120,
            backgroundColor: theme.muted + '40',
            borderRadius: theme.radius,
            marginBottom: 10,
          }}
        />
        {/* Header skeleton */}
        <View style={{ marginBottom: 10, gap: 8 }}>
          <View
            style={{
              height: 28,
              backgroundColor: theme.muted + '40',
              borderRadius: theme.radius / 2,
              width: '50%',
            }}
          />
          <View
            style={{
              height: 16,
              backgroundColor: theme.muted + '40',
              borderRadius: theme.radius / 2,
              width: '70%',
            }}
          />
        </View>
        {/* Posts skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
};
