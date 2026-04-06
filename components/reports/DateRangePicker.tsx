import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { DateTimeInput } from '@/components/ui/DateTimePicker/DateTimePicker';
import {
  Button,
  ButtonText,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';

interface DateRangePickerProps {
  startISO?: string | null;
  endISO?: string | null;
  onChange?: (startISO: string | null, endISO: string | null) => void;
  onGenerate?: (startISO: string | null, endISO: string | null) => void;
}

export const DateRangePicker = ({
  startISO,
  endISO,
  onChange,
  onGenerate,
}: DateRangePickerProps) => {
  const { t } = useTranslation();

  // Default: start = first day of current month, end = last day of current month
  const defaultStart = useMemo(
    () => DateTime.now().startOf('month').toUTC().toISO(),
    [],
  );
  const defaultEnd = useMemo(
    () => DateTime.now().endOf('month').toUTC().toISO(),
    [],
  );

  const [start, setStart] = useState<string | null>(startISO ?? defaultStart);
  const [end, setEnd] = useState<string | null>(endISO ?? defaultEnd);

  useEffect(() => {
    if (onChange) onChange(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  useEffect(() => {
    if (startISO) setStart(startISO);
  }, [startISO]);

  useEffect(() => {
    if (endISO) setEnd(endISO);
  }, [endISO]);

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ marginBottom: 8 }}>
          {t('selectDateRange')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ gap: 12 }}>
          <DateTimeInput
            labelText={t('startDate')}
            mode='date'
            value={start}
            onChange={(v) => setStart(v)}
            displayFormat='MM/DD/YYYY'
            clearable
          />

          <DateTimeInput
            labelText={t('endDate')}
            mode='date'
            value={end}
            onChange={(v) => setEnd(v)}
            displayFormat='MM/DD/YYYY'
            clearable
          />

          <Button
            variant='default'
            onPress={() => {
              // First, notify parent of current values
              if (onChange) onChange(start, end);
              // Then, if parent provided a generate handler, call it
              if (onGenerate) onGenerate(start, end);
            }}
          >
            <ButtonText>{t('generateReport')}</ButtonText>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
};

export default DateRangePicker;
