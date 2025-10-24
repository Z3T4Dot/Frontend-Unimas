import { appointmentsAPI } from "@/lib/api";
import { useFetch } from "./useFetch";

export const useAllAppointments = (params?: Record<string, string>) =>
  useFetch(() => appointmentsAPI.getAll(params as any), [JSON.stringify(params)]);
export const useTechnicianAppointments = () =>
  useFetch(() => appointmentsAPI.getAll({ technician_id: 'current' }), []);
