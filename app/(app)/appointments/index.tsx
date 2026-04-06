import { Redirect } from 'expo-router';

export default function AppointmentsIndexRedirect() {
  return <Redirect href='/(app)/appointments/(tabs)' />;
}
