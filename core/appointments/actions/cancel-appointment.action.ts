import { api } from "@/core/api/api";

export const cancelAppointment = async (
  appointmentId: string,
  reason?: string
): Promise<void> => {
  try {
    await api.patch(`/appointments/${appointmentId}/cancel`, {
      cancellationReason: reason,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};
