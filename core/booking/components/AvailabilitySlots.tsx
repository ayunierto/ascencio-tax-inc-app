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
import { View } from 'react-native';
import { getAvailabilityAction } from '../actions/get-availability.action';
import { AvailableSlot } from '../interfaces/available-slot.interface';
import { AvailabilityRequest } from '../schemas/availability.schema';

interface AvailabilitySlotsProps {
  form: UseFormReturn<AvailabilityRequest>;
  userTimeZone: string;

  onChange?: (slot: AvailableSlot) => void;
}

const AvailabilitySlots = ({
  form,
  userTimeZone,
  onChange,
}: AvailabilitySlotsProps) => {
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot>();

  const serviceId = form.watch('serviceId');
  const staffId = form.watch('staffId');
  const date = form.watch('date');

  const {
    isPending,
    isRefetching,
    refetch,
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
    // Refetch availability when serviceId, staffId, or date changes
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, staffId, date]);

  // Group slots by time of day
  const groupedSlots = useMemo(() => {
    if (!data) return { morning: [], afternoon: [], evening: [] };

    const groups = {
      morning: [] as AvailableSlot[],
      afternoon: [] as AvailableSlot[],
      evening: [] as AvailableSlot[],
    };

    data.forEach((slot) => {
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
  }, [data, userTimeZone]);

  if (isError) {
    return (
      <EmptyContent
        title="Failed to check availability"
        subtitle={
          availabilityError.response?.data.message || availabilityError.message
        }
      />
    );
  }

  if (isPending || isRefetching) {
    return <Loader message="Checking availability..." />;
  }

  if (data && data.length === 0) {
    return (
      <Alert style={{ width: '100%' }} variant="warning">
        There are no appointments available for this day. Please select another
        day.
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
            ({slots.length} {slots.length === 1 ? 'slot' : 'slots'})
          </ThemedText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {slots.map((slot) => (
            <Button
              size="sm"
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
              style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
            >
              <ButtonIcon name="time-outline" />
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
      {renderSlotGroup(groupedSlots.morning, 'Morning', 'sunny-outline')}
      {renderSlotGroup(
        groupedSlots.afternoon,
        'Afternoon',
        'partly-sunny-outline',
      )}
      {renderSlotGroup(groupedSlots.evening, 'Evening', 'moon-outline')}
    </View>
  );
};

export default AvailabilitySlots;
