import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme, CustomHeader, HeaderButton } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportCardSkeletonList } from '@/components/reports/ReportCardSkeleton';
import { useGenerateReport, useGetReports } from '@/core/reports';
import { toast } from 'sonner-native';
// ⚠️ TEMPORARY: Commented out for testing
// import { PremiumGuard } from '@/components/subscription/PremiumGuard';
// import { PremiumFeature } from '@ascencio/shared';

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const generateMutation = useGenerateReport();
  const {
    data: reports,
    isLoading,
    refetch,
    isRefetching,
  } = useGetReports({ limit: 20 });

  const handleGenerate = async (s: string | null, e: string | null) => {
    if (!s || !e) {
      toast.error(t('invalidDateRange'));
      return;
    }

    try {
      console.log('[REPORTS] Generating report...');
      await generateMutation.mutateAsync({ startDate: s, endDate: e });
      console.log('[REPORTS] Report generated successfully');
      toast.success(t('reportGeneratedSuccessfully'));

      // Forzar refetch explícito
      console.log('[REPORTS] Forcing refetch of reports list...');
      await refetch();
      console.log('[REPORTS] Refetch completed');
    } catch (err: any) {
      console.error('[REPORTS] Error generating report:', err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t('errorGeneratingReport'),
      );
    }
  };

  console.log('[REPORTS] Current reports:', reports);
  console.log(
    '[REPORTS] Is loading:',
    isLoading,
    'Is refetching:',
    isRefetching,
  );

  return (
    // ⚠️ TEMPORARY: Removed PremiumGuard wrapper for testing
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={t('reports')}
        left={
          <HeaderButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu" size={24} color="#ffffff" />
          </HeaderButton>
        }
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Date Range Picker */}
        <View style={styles.pickerSection}>
          <DateRangePicker
            startISO={startDate}
            endISO={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
            onGenerate={(s, e) => handleGenerate(s, e)}
          />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <ThemedText style={styles.historyTitle}>
              {t('recentReports')}
            </ThemedText>
            <TouchableOpacity onPress={() => refetch()} disabled={isRefetching}>
              <Ionicons
                name={isRefetching ? 'sync' : 'refresh'}
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {isLoading && !isRefetching ? (
            <ReportCardSkeletonList count={3} />
          ) : reports && reports.length > 0 ? (
            <View style={styles.reportsList}>
              {reports.map((item) => (
                <ReportCard key={item.id} report={item} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={theme.mutedForeground}
              />
              <ThemedText style={styles.emptyText}>
                {t('noReportsYet')}
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                {t('generateFirstReport')}
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerSection: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  historySection: {
    padding: 16,
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.foreground,
  },
  reportsList: {
    gap: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.foreground,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: 'center',
  },
});

export default ReportsScreen;
