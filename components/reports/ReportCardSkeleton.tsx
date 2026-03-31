import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, DimensionValue } from 'react-native';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';

export const ReportCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const Skeleton = ({
    width,
    height,
  }: {
    width: DimensionValue;
    height: number;
  }) => <Animated.View style={[styles.skeleton, { width, height, opacity }]} />;

  return (
    <Card style={styles.card}>
      <CardContent>
        {/* Header */}
        <View style={styles.header}>
          <Skeleton width={48} height={48} />
          <View style={styles.headerContent}>
            <Skeleton width='60%' height={16} />
            <View style={{ height: 6 }} />
            <Skeleton width='40%' height={12} />
          </View>
        </View>

        {/* Date Range Card */}
        <View style={styles.dateRangeCard}>
          <View style={styles.dateColumn}>
            <Skeleton width={40} height={10} />
            <View style={{ height: 6 }} />
            <Skeleton width={90} height={14} />
          </View>
          <View style={{ width: 20 }} />
          <View style={styles.dateColumn}>
            <Skeleton width={40} height={10} />
            <View style={{ height: 6 }} />
            <Skeleton width={90} height={14} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Skeleton width='70%' height={12} />
        </View>
      </CardContent>
    </Card>
  );
};

export const ReportCardSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateRangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.muted,
    borderRadius: 10,
    marginBottom: 12,
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  footer: {
    paddingTop: 4,
  },
  skeleton: {
    backgroundColor: theme.border,
    borderRadius: 6,
  },
});
