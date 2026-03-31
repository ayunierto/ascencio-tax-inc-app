import { Stack } from "expo-router";
import { theme } from "@/components/ui/theme";

export default function NewAppointmentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleAlign: "center",
        headerTintColor: theme.foreground,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Select Service",
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          title: "Select Date & Time",
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: "Additional Details",
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: "Confirm Booking",
        }}
      />
    </Stack>
  );
}
