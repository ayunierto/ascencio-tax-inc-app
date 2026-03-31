import { Ionicons } from '@expo/vector-icons';
import { DateTime } from 'luxon';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, CardContent } from '@/components/ui/Card';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Report } from '@/core/reports/actions/get-reports.action';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
}

export const ReportCard = ({ report, onPress }: ReportCardProps) => {
  const startDate = DateTime.fromISO(report.startDate);
  const endDate = DateTime.fromISO(report.endDate);
  const createdAt = DateTime.fromISO(report.createdAt);

  const formatDate = (date: DateTime) => {
    return date.toFormat('MMM dd, yyyy');
  };

  const getRelativeTime = () => {
    const now = DateTime.now();
    const diff = now.diff(createdAt, ['days', 'hours', 'minutes']);

    if (diff.days >= 1) {
      return `${Math.floor(diff.days)} ${Math.floor(diff.days) === 1 ? 'day' : 'days'} ago`;
    } else if (diff.hours >= 1) {
      return `${Math.floor(diff.hours)} ${Math.floor(diff.hours) === 1 ? 'hour' : 'hours'} ago`;
    } else if (diff.minutes > 0) {
      return `${Math.floor(diff.minutes)} minutes ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card style={styles.card}>
      <CardContent>
        {/* Header with Icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name='document-text' size={24} color={theme.primary} />
          </View>
          <View style={styles.headerContent}>
            <ThemedText style={styles.title}>Expense Report</ThemedText>
            <ThemedText style={styles.subtitle}>{getRelativeTime()}</ThemedText>
          </View>
        </View>

        {/* Date Range Card */}
        <Card style={{ marginBottom: 16 }}>
          <CardContent style={styles.dateRangeCard}>
            {/* <View style={styles.dateRangeCard}> */}
            <View style={styles.dateColumn}>
              <ThemedText style={styles.dateLabel}>From</ThemedText>
              <ThemedText style={styles.dateValue}>
                {formatDate(startDate)}
              </ThemedText>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name='arrow-forward' size={20} color={theme.primary} />
            </View>

            <View style={styles.dateColumn}>
              <ThemedText style={styles.dateLabel}>To</ThemedText>
              <ThemedText style={styles.dateValue}>
                {formatDate(endDate)}
              </ThemedText>
            </View>
            {/* </View> */}
          </CardContent>
        </Card>

        {/* Footer with generated date */}
        <View style={styles.footer}>
          <Ionicons
            name='time-outline'
            size={14}
            color={theme.mutedForeground}
          />
          <ThemedText style={styles.footerText}>
            {createdAt.toFormat('MMM dd, yyyy • hh:mm a')}
          </ThemedText>
        </View>
      </CardContent>
    </Card>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${theme.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.foreground,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.mutedForeground,
  },
  dateRangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: theme.mutedForeground,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.foreground,
  },
  arrowContainer: {
    marginHorizontal: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: theme.mutedForeground,
  },
});
