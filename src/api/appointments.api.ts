import { api } from '@/lib/api'
import type { ApiResponse, Appointment } from './types.api'


export const getAppointments = (params?: Record<string,string>) =>
api.get<ApiResponse<Appointment[]>>('/appointments', { params })


export const createAppointment = (payload: any) => api.post<ApiResponse<Appointment>>('/appointments', payload)


export const getTechnicianAppointments = () => api.get<ApiResponse<Appointment[]>>('/appointments/technician-appointments')