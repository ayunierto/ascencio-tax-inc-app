import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { DateTime } from 'luxon';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

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
  AvailabilityRequest,
  availabilitySchema,
} from '../schemas/availability.schema';
import AvailabilitySlots from './AvailabilitySlots';

interface AvailabilityFormProps {
  services: Service[];
  selectedService: Service;
  serviceStaff: StaffMember[];

  onSubmit: (values: AvailabilityRequest) => void;
}

const AvailabilityForm = ({
  services,
  selectedService,
  serviceStaff,
  onSubmit,
}: AvailabilityFormProps) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { updateState } = useBookingStore();
  const form = useForm<AvailabilityRequest>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      serviceId: selectedService.id,
      date: DateTime.now().toISO(), // Initialize with current date
      timeZone: userTimeZone,
    },
  });

  const handleFormSubmit = (values: AvailabilityRequest) => {
    // Ensure all data is in the store before submitting
    const selectedStaffMember = serviceStaff.find(
      (s) => s.id === values.staffId,
    );
    const selectedServiceData = services.find((s) => s.id === values.serviceId);

    if (selectedStaffMember && selectedServiceData) {
      updateState({
        service: selectedServiceData,
        staffMember: selectedStaffMember,
        timeZone: values.timeZone,
      });
    }

    onSubmit(values);
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
            errorMessage={form.formState.errors.serviceId?.message}
          >
            <SelectTrigger
              placeholder={'Select a service'}
              labelText="Service"
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
            value={value}
            onValueChange={onChange}
            error={!!form.formState.errors.staffId}
            errorMessage={form.formState.errors.staffId?.message}
          >
            <SelectTrigger placeholder={'Select Staff'} labelText="Staff" />
            <SelectContent>
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
              onChange(slot.startTimeUTC);

              const staffId = form.watch('staffId');
              const matchedStaff = slot.availableStaff.find(
                (s) => s.id === staffId,
              );
              const randomStaff =
                slot.availableStaff[
                  Math.floor(Math.random() * slot.availableStaff.length)
                ];

              updateState({
                start: slot.startTimeUTC,
                end: slot.endTimeUTC,
                timeZone: userTimeZone,
                staffMember: matchedStaff ?? randomStaff,
              });
            }}
          />
        )}
      />

      {/* Handle error messages */}
      {form.formState.errors.date && (
        <Alert style={{ width: '100%' }} variant="error">
          {form.formState.errors.date.message}
        </Alert>
      )}

      {form.formState.errors.time && (
        <Alert style={{ width: '100%' }} variant="error">
          {form.formState.errors.time.message}
        </Alert>
      )}

      {form.formState.errors.timeZone && (
        <Alert style={{ width: '100%' }} variant="error">
          {form.formState.errors.timeZone.message}
        </Alert>
      )}

      <Button onPress={form.handleSubmit(handleFormSubmit)}>
        <ButtonIcon name="calendar-outline" />
        <ButtonText>Book Appointment</ButtonText>
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
