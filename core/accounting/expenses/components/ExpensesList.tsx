import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyContent } from '@/core/components';
import { Button, ButtonIcon, ButtonText, theme } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner-native';
import Loader from '@/components/Loader';
import { router } from 'expo-router';
import ExpenseCard from './ExpenseCard';
import { deleteExpenseMutation, useExpenses } from '../hooks/useExpenses';
import { DateTimeInput } from '@/components/ui/DateTimePicker/DateTimePicker';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAuthStore } from '@/core/auth/store/useAuthStore';

const toUtcDayStartMs = (isoDate: string): number => {
  const date = new Date(isoDate);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const toUtcDayEndMs = (isoDate: string): number => {
  const date = new Date(isoDate);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999);
};

const toUtcNoonIso = (date: Date): string =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12),
  ).toISOString();

const resolveCurrencyFromLocale = (locale: string): string => {
  const region = locale.split('-')[1]?.toUpperCase();

  if (!region) return 'USD';

  const byRegion: Record<string, string> = {
    US: 'USD',
    CA: 'CAD',
    MX: 'MXN',
    ES: 'EUR',
    AR: 'ARS',
    CL: 'CLP',
    CO: 'COP',
    PE: 'PEN',
    BR: 'BRL',
    GB: 'GBP',
  };

  return byRegion[region] || 'USD';
};

type DatePreset = 'today' | 'last7' | 'thisMonth' | 'all' | 'custom';

const ExpensesList = () => {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const userLocale = useAuthStore((state) => state.user?.locale) || 'en-US';
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<DatePreset>('all');

  const { expensesQuery, loadNextPage } = useExpenses();

  const { data, isPending, isError, error, refetch, isRefetching } = expensesQuery;

  const deleteExpense = deleteExpenseMutation();
  const expenses = useMemo(() => data?.pages.flat() || [], [data]);
  const currencyCode = useMemo(() => resolveCurrencyFromLocale(userLocale), [userLocale]);
  const currencyFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }, [currencyCode, userLocale]);

  const isInvalidDateRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    return toUtcDayStartMs(startDate) > toUtcDayEndMs(endDate);
  }, [endDate, startDate]);

  const filteredExpenses = useMemo(() => {
    if (isInvalidDateRange) return [];

    const startMs = startDate ? toUtcDayStartMs(startDate) : null;
    const endMs = endDate ? toUtcDayEndMs(endDate) : null;

    return expenses.filter((expense) => {
      const expenseDateMs = Date.parse(expense.date);

      if (Number.isNaN(expenseDateMs)) return false;
      if (startMs !== null && expenseDateMs < startMs) return false;
      if (endMs !== null && expenseDateMs > endMs) return false;

      return true;
    });
  }, [endDate, expenses, isInvalidDateRange, startDate]);

  const hasActiveDateFilter = !!startDate || !!endDate;

  const stats = useMemo(
    () => ({
      filteredCount: filteredExpenses.length,
      totalCount: expenses.length,
      filteredSpend: filteredExpenses.reduce((sum, expense) => sum + Number(expense.total || 0), 0),
      overallSpend: expenses.reduce((sum, expense) => sum + Number(expense.total || 0), 0),
    }),
    [expenses, filteredExpenses],
  );

  const onDelete = async (expenseId: string) => {
    setDeletingId(expenseId);
    await deleteExpense.mutateAsync(expenseId, {
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setDeletingId(null);
      },
      onError: () => {
        toast.error(t('canNotDelete'));
        setDeletingId(null);
      },
    });
  };

  if (isError) {
    return (
      <EmptyContent
        title={t('loadError')}
        subtitle={error?.response?.data.message || error?.message}
        action={
          <Button onPress={() => refetch()}>
            <ButtonIcon name='refresh' />
            <ButtonText>{t('retry')}</ButtonText>
          </Button>
        }
      />
    );
  }

  if (isPending) return <Loader />;

  const formatCurrency = (amount: number) => currencyFormatter.format(amount);

  const updateStartDate = (value: string | null) => {
    setActivePreset('custom');
    setStartDate(value);
  };

  const updateEndDate = (value: string | null) => {
    setActivePreset('custom');
    setEndDate(value);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setActivePreset('all');
  };

  const applyPreset = (preset: Exclude<DatePreset, 'custom'>) => {
    const now = new Date();
    const todayNoon = toUtcNoonIso(now);

    if (preset === 'all') {
      clearDateFilter();
      return;
    }

    if (preset === 'today') {
      setStartDate(todayNoon);
      setEndDate(todayNoon);
      setActivePreset('today');
      return;
    }

    if (preset === 'last7') {
      const start = new Date(now);
      start.setUTCDate(start.getUTCDate() - 6);
      setStartDate(toUtcNoonIso(start));
      setEndDate(todayNoon);
      setActivePreset('last7');
      return;
    }

    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0, 0),
    );
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 12, 0, 0, 0),
    );
    setStartDate(startOfMonth.toISOString());
    setEndDate(endOfMonth.toISOString());
    setActivePreset('thisMonth');
  };

  return (
    <FlatList
      data={filteredExpenses}
      renderItem={({ item }) => (
        <ExpenseCard expense={item} isLoading={deletingId === item.id} handleDelete={onDelete} />
      )}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          {hasActiveDateFilter ? (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statLabel}>{t('filteredExpenses')}</ThemedText>
                <ThemedText style={styles.statValue}>{stats.filteredCount}</ThemedText>
              </View>

              <View style={styles.statCard}>
                <ThemedText style={styles.statLabel}>{t('filteredSpend')}</ThemedText>
                <ThemedText style={styles.statAmount}>
                  {formatCurrency(stats.filteredSpend)}
                </ThemedText>
              </View>
            </View>
          ) : null}

          <View style={styles.overviewRow}>
            <View style={styles.overviewPill}>
              <ThemedText style={styles.overviewLabel}>{t('overallExpenses')}</ThemedText>
              <ThemedText style={styles.overviewValue}>{stats.totalCount}</ThemedText>
            </View>
            <View style={styles.overviewPill}>
              <ThemedText style={styles.overviewLabel}>{t('overallSpend')}</ThemedText>
              <ThemedText style={styles.overviewValue}>
                {formatCurrency(stats.overallSpend)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <ThemedText style={styles.filterTitle}>{t('filterByDate')}</ThemedText>
              {hasActiveDateFilter ? (
                <Button
                  variant='ghost'
                  size='sm'
                  style={styles.clearButton}
                  onPress={clearDateFilter}
                >
                  <ButtonText variant='ghost' size='sm'>
                    {t('clearDateFilter')}
                  </ButtonText>
                </Button>
              ) : null}
            </View>

            <View style={styles.dateInputsRow}>
              <View style={styles.dateInputColumn}>
                <DateTimeInput
                  mode='date'
                  labelText={t('startDate')}
                  value={startDate}
                  onChange={updateStartDate}
                  displayFormat='MM/DD/YYYY'
                  clearable
                />
              </View>

              <View style={styles.dateInputColumn}>
                <DateTimeInput
                  mode='date'
                  labelText={t('endDate')}
                  value={endDate}
                  onChange={updateEndDate}
                  displayFormat='MM/DD/YYYY'
                  clearable
                />
              </View>
            </View>

            <View style={styles.presetsRow}>
              <TouchableOpacity
                style={[styles.presetChip, activePreset === 'today' && styles.presetChipActive]}
                onPress={() => applyPreset('today')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.presetChipText}>{t('datePresetToday')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, activePreset === 'last7' && styles.presetChipActive]}
                onPress={() => applyPreset('last7')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.presetChipText}>{t('datePresetLast7Days')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, activePreset === 'thisMonth' && styles.presetChipActive]}
                onPress={() => applyPreset('thisMonth')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.presetChipText}>{t('datePresetThisMonth')}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetChip, activePreset === 'all' && styles.presetChipActive]}
                onPress={() => applyPreset('all')}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.presetChipText}>{t('datePresetAllTime')}</ThemedText>
              </TouchableOpacity>
            </View>

            {isInvalidDateRange ? (
              <ThemedText style={styles.invalidRangeText}>{t('invalidDateRange')}</ThemedText>
            ) : null}
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyContent
          title={t('noExpensesTitle')}
          subtitle={
            isInvalidDateRange
              ? t('invalidDateRange')
              : hasActiveDateFilter
                ? t('noExpensesInDateRange')
                : t('noExpensesSubtitle')
          }
          action={
            hasActiveDateFilter ? (
              <Button variant='outline' onPress={clearDateFilter}>
                <ButtonIcon name='calendar-clear-outline' variant='outline' />
                <ButtonText variant='outline'>{t('clearDateFilter')}</ButtonText>
              </Button>
            ) : (
              <Button onPress={() => router.push('/(app)/expenses/create')}>
                <ButtonIcon name='add-circle-outline' />
                <ButtonText>{t('createExpense')}</ButtonText>
              </Button>
            )
          }
        />
      }
      contentContainerStyle={{
        paddingVertical: 8,
        paddingBottom: inset.bottom,
        gap: 10,
        paddingHorizontal: 10,
      }}
      keyExtractor={(item) => item.id}
      onEndReached={() => loadNextPage()}
      onEndReachedThreshold={0.8}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={theme.primary}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    gap: 10,
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statLabel: {
    color: theme.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
    fontSize: 20,
  },
  statAmount: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'monospace',
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  overviewPill: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#00000022',
    borderColor: theme.border,
    borderWidth: 1,
  },
  overviewLabel: {
    color: theme.muted,
    fontSize: 11,
  },
  overviewValue: {
    marginTop: 3,
    fontWeight: '600',
    fontSize: 14,
  },
  filterCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  clearButton: {
    marginVertical: 0,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInputColumn: {
    flex: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#00000018',
  },
  presetChipActive: {
    borderColor: theme.primary,
    backgroundColor: '#3b82f633',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invalidRangeText: {
    color: theme.destructive,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ExpensesList;
