import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { useBookingStore } from '@/core/services/store/useBookingStore';

export default function NewAppointmentStartRedirect() {
  const { resetBooking } = useBookingStore();

  useEffect(() => {
    resetBooking();
  }, [resetBooking]);

  return <Redirect href='/(app)/appointments/(tabs)/services' />;
}
