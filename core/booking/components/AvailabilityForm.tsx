import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { DateTime } from 'luxon';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { toast } from 'sonner-native';

import { Alert } from '@/components/ui/Alert';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { theme } from '@/components/ui/theme';
import type { Service, StaffMember } from '@ascencio/shared/interfaces';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { CalendarDay } from '../interfaces/calendar-day.interface';
import {
  AvailabilityFormValues,
  availabilitySchema,
} from '../schemas/availability.schema';
import { AvailableSlot } from '../interfaces/available-slot.interface';
import AvailabilitySlots from './AvailabilitySlots';

interface AvailabilityFormProps {
  services: Service[];
  selectedService: Service;
  serviceStaff: StaffMember[];

  onSubmit: (values: AvailabilityFormValues) => void;
}

const AvailabilityForm = ({
  services,
  selectedService,
  serviceStaff,
  onSubmit,
}: AvailabilityFormProps) => {
  const ANY_STAFF_VALUE = 'any-staff';
  const { t } = useTranslation();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { updateState, staffMember } = useBookingStore();
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      serviceId: selectedService.id,
      date: DateTime.now().toISO(), // Initialize with current date
      timeZone: userTimeZone,
    },
  });

  const handleFormSubmit = (values: AvailabilityFormValues) => {
    // El staff confirmado en store tiene prioridad (slot seleccionado).
    const selectedStaffMember =
      staffMember ?? serviceStaff.find((s) => s.id === values.staffId);
    const selectedServiceData = services.find((s) => s.id === values.serviceId);

    if (selectedStaffMember && selectedServiceData) {
      updateState({
        service: selectedServiceData,
        staffMember: selectedStaffMember,
        timeZone: values.timeZone,
      });

      onSubmit({
        ...values,
        staffId: selectedStaffMember.id,
      });
      return;
    }

    onSubmit(values);
  };

  const applySlotSelection = (
    slot: AvailableSlot,
    selectedStaff: StaffMember,
  ) => {
    form.clearErrors('time');
    form.setValue('time', slot.startTimeUTC, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    updateState({
      start: slot.startTimeUTC,
      end: slot.endTimeUTC,
      timeZone: userTimeZone,
      staffMember: selectedStaff,
    });
  };

  const pickRandomStaff = (
    staffList: StaffMember[],
  ): StaffMember | undefined => {
    if (staffList.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * staffList.length);
    return staffList[randomIndex];
  };

  return (
    <View style={{ gap: 10 }}>
      <Controller
        control={form.control}
        name={'serviceId'}
        render={({ field: { onChange, value } }) => (
          <Select
            placeholder={value}
            value={value}
            onValueChange={onChange}
            error={!!form.formState.errors.serviceId}
            errorMessage={
              form.formState.errors.serviceId?.message
                ? t(form.formState.errors.serviceId.message)
                : undefined
            }
          >
            <SelectTrigger
              placeholder={t('selectService')}
              labelText={t('service')}
            />
            <SelectContent>
              {services.map(({ id, name }) => (
                <SelectItem key={id} label={name} value={id} />
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <Controller
        control={form.control}
        name={'staffId'}
        render={({ field: { onChange, value } }) => (
          <Select
            value={value ?? ANY_STAFF_VALUE}
            onValueChange={(selectedValue) => {
              const nextValue =
                selectedValue === ANY_STAFF_VALUE ? undefined : selectedValue;

              onChange(nextValue);
              form.resetField('time');
              updateState({
                start: undefined,
                end: undefined,
                staffMember: undefined,
              });
            }}
            error={!!form.formState.errors.staffId}
            errorMessage={
              form.formState.errors.staffId?.message
                ? t(form.formState.errors.staffId.message)
                : undefined
            }
          >
            <SelectTrigger
              placeholder={t('selectStaff')}
              labelText={t('staff')}
            />
            <SelectContent>
              <SelectItem label={t('anyStaff')} value={ANY_STAFF_VALUE} />
              {serviceStaff.map(({ id, firstName, lastName }) => (
                <SelectItem
                  key={id}
                  label={`${firstName} ${lastName}`}
                  value={id}
                />
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <View style={styles.calendarContainer}>
        <Controller
          control={form.control}
          name={'date'}
          render={({ field: { value, onChange } }) => (
            <Calendar
              minDate={DateTime.now().toFormat('yyyy-MM-dd')}
              theme={{
                selectedDayBackgroundColor: theme.primary,
              }}
              onDayPress={(day: CalendarDay) => {
                const userDate = DateTime.fromISO(day.dateString)
                  .setZone(userTimeZone)
                  .set({
                    hour: DateTime.now().hour,
                    minute: DateTime.now().minute,
                  })
                  .toISO();

                onChange(userDate);
              }}
              markedDates={{
                [DateTime.fromISO(value ?? DateTime.now().toISO())
                  .setZone(userTimeZone)
                  .toFormat('yyyy-MM-dd')]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: 'orange',
                },
              }}
            />
          )}
        />
      </View>

      <Controller
        control={form.control}
        name={'time'}
        render={({ field: { onChange } }) => (
          <AvailabilitySlots
            form={form}
            userTimeZone={userTimeZone}
            onChange={(slot) => {
              const staffId = form.watch('staffId');
              const matchedStaff = slot.availableStaff.find(
                (s) => s.id === staffId,
              );
              const randomStaff = pickRandomStaff(slot.availableStaff);
              const selectedStaff = matchedStaff ?? randomStaff;

              if (!selectedStaff) {
                form.setError('time', {
                  type: 'manual',
                  message: t('noAppointmentsAvailableForDay'),
                });
                return;
              }

              applySlotSelection(slot, selectedStaff);
              onChange(slot.startTimeUTC);

              if (!matchedStaff && slot.availableStaff.length > 1) {
                toast.success(t('staffAutoAssigned'), {
                  description: `${selectedStaff.firstName} ${selectedStaff.lastName}`,
                });
              }
            }}
          />
        )}
      />

      {/* Handle error messages */}
      {form.formState.errors.date && (
        <Alert style={{ width: '100%' }} variant='error'>
          {t(form.formState.errors.date.message ?? '')}
        </Alert>
      )}

      {form.formState.errors.time && (
        <Alert style={{ width: '100%' }} variant='error'>
          {t(form.formState.errors.time.message ?? '')}
        </Alert>
      )}

      {form.formState.errors.timeZone && (
        <Alert style={{ width: '100%' }} variant='error'>
          {t(form.formState.errors.timeZone.message ?? '')}
        </Alert>
      )}

      <Button onPress={form.handleSubmit(handleFormSubmit)}>
        <ButtonIcon name='calendar-outline' />
        <ButtonText>{t('bookAppointment')}</ButtonText>
      </Button>
    </View>
  );
};

export default AvailabilityForm;

const styles = StyleSheet.create({
  calendarContainer: {
    overflow: 'hidden',
    borderRadius: theme.radius,
  },
  slot: {
    backgroundColor: theme.foreground,
  },
});
