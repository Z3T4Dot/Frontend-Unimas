// src/api/types.api.ts
export type UUID = string;

export enum UserRole { ADMIN = 'ADMIN', TECHNICIAN = 'TECHNICIAN', CLIENT = 'CLIENT' }

export interface UserProfile {
  id: UUID;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  created_at?: string;
}

export interface Service {
  id: UUID;
  category_id?: UUID;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
  requires_consultation?: boolean;
}

export interface AppointmentServiceSnapshot {
  id: UUID;
  name: string;
  price_at_booking: number;
  duration_at_booking: number;
}

export interface Appointment {
  id: UUID;
  client_id: UUID;
  client_name: string;
  client_phone?: string;
  technician_id: UUID;
  technician_name?: string;
  date: string; // YYYY-MM-DD or ISO
  start_time: string; // HH:mm
  end_time?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  services: AppointmentServiceSnapshot[];
  total_amount: number;
  total_duration: number;
  created_at?: string;
}

export interface DailySummary {
  technician_id: UUID;
  technician_name?: string;
  date: string;
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  scheduled_appointments: number;
  total_earnings: number;
  appointments: Partial<Appointment>[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
