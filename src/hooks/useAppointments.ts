import { getAppointments, getTechnicianAppointments } from "@/api/appointments.api";
import { useFetch } from "./useFetch";

export const useAllAppointments = (params?: Record<string, string>) =>
  useFetch(() => getAppointments(params), [JSON.stringify(params)]);
export const useTechnicianAppointments = () =>
  useFetch(() => getTechnicianAppointments(), []);
