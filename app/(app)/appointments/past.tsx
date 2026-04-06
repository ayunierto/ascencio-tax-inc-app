import { Redirect } from 'expo-router';

export default function PastAppointmentsRedirect() {
  return <Redirect href='/(app)/appointments/(tabs)/past' />;
}
