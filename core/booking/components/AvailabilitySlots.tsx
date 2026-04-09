import Loader from '@/components/Loader';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { EmptyContent } from '@/core/components/EmptyContent';
import { ServerException } from '@/core/interfaces/server-exception.response';
import { convertUtcDateToLocalTime } from '@/utils/convertUtcToLocalTime';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DateTime } from 'luxon';
import React, { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { getAvailabilityAction } from '../actions/get-availability.action';
import { AvailableSlot } from '../interfaces/available-slot.interface';
import { AvailabilityFormValues } from '../schemas/availability.schema';
import { normalizeAvailabilitySlots } from '../utils/slot-normalization';

interface AvailabilitySlotsProps {
  form: UseFormReturn<AvailabilityFormValues>;
  userTimeZone: string;

  onChange?: (slot: AvailableSlot) => void;
}

const AvailabilitySlots = ({
  form,
  userTimeZone,
  onChange,
}: AvailabilitySlotsProps) => {
  const { t } = useTranslation();
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot>();

  const serviceId = form.watch('serviceId');
  const staffId = form.watch('staffId');
  const date = form.watch('date');

  const {
    isPending,
    isRefetching,
    data,
    isError,
    error: availabilityError,
  } = useQuery<AvailableSlot[], AxiosError<ServerException>>({
    queryKey: ['availability', serviceId, staffId ?? 'all', date, userTimeZone],
    queryFn: async () => {
      return await getAvailabilityAction({
        serviceId,
        staffId,
        date,
        timeZone: userTimeZone,
      });
    },
    enabled: Boolean(serviceId && date), // permitir consulta solo por servicio+fecha
    staleTime: 0, // Siempre considerar datos obsoletos (no cache)
    gcTime: 0, // No mantener en memoria después de desmontar
  });

  useEffect(() => {
    if (!serviceId || !date) return; // staff opcional
    setSelectedSlot(undefined); // Reset selected slot when service or date changes
    form.resetField('time'); // Reset time when service or date changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, staffId, date]);

  const normalizedSlots = useMemo(() => {
    if (!data || data.length === 0) {
      return [] as AvailableSlot[];
    }

    return normalizeAvailabilitySlots(data);
  }, [data]);

  // Group slots by time of day
  const groupedSlots = useMemo(() => {
    if (normalizedSlots.length === 0) {
      return { morning: [], afternoon: [], evening: [] };
    }

    const groups = {
      morning: [] as AvailableSlot[],
      afternoon: [] as AvailableSlot[],
      evening: [] as AvailableSlot[],
    };

    normalizedSlots.forEach((slot) => {
      const hour = DateTime.fromISO(slot.startTimeUTC).setZone(
        userTimeZone,
      ).hour;

      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 18) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  }, [normalizedSlots, userTimeZone]);

  if (isError) {
    return (
      <EmptyContent
        title={t('failedCheckAvailability')}
        subtitle={
          availabilityError.response?.data.message || availabilityError.message
        }
      />
    );
  }

  if (isPending || isRefetching) {
    return <Loader message={t('checkingAvailability')} />;
  }

  if (normalizedSlots.length === 0) {
    return (
      <Alert style={{ width: '100%' }} variant='warning'>
        {t('noAppointmentsAvailableForDay')}
      </Alert>
    );
  }

  const renderSlotGroup = (
    slots: AvailableSlot[],
    title: string,
    icon: string,
  ) => {
    if (slots.length === 0) return null;

    return (
      <View style={{ marginBottom: 20, width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <ButtonIcon name={icon as any} />
          <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
            {title}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, color: theme.mutedForeground }}>
            ({slots.length} {slots.length === 1 ? t('slot') : t('slots')})
          </ThemedText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            rowGap: 10,
          }}
        >
          {slots.map((slot) => (
            <Button
              size='sm'
              key={slot.startTimeUTC}
              variant={
                selectedSlot?.startTimeUTC === slot.startTimeUTC
                  ? 'default'
                  : 'outline'
              }
              onPress={() => {
                setSelectedSlot(slot);
                onChange?.(slot);
              }}
              style={{ width: '48%' }}
            >
              <ButtonIcon name='time-outline' />
              <ButtonText>
                {convertUtcDateToLocalTime(
                  slot.startTimeUTC,
                  userTimeZone,
                  '12-hour',
                )}
              </ButtonText>
            </Button>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ width: '100%' }}>
      {renderSlotGroup(groupedSlots.morning, t('morning'), 'sunny-outline')}
      {renderSlotGroup(
        groupedSlots.afternoon,
        t('afternoon'),
        'partly-sunny-outline',
      )}
      {renderSlotGroup(groupedSlots.evening, t('evening'), 'moon-outline')}
    </View>
  );
};

export default AvailabilitySlots;
