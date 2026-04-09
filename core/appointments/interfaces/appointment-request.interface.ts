export interface AppointmentRequest {
  serviceId: string; // UUID
  staffId: string; // UUID
  startTimeUTC: string; // ISO UTC "YYYY-MM-DDTHH:mm:ss.sssZ"
  endTimeUTC: string; // ISO UTC "YYYY-MM-DDTHH:mm:ss.sssZ"
  timeZone: string; // IANA time zone string. E.g., "America/New_York"
  comments?: string; // Optional comments
}
