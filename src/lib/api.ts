import axios from 'axios'
import { API_BASE_URL } from "@/config/env";

const API_URL = API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir el token a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  phone?: string
  created_at?: string
}

export interface Service {
  id: string
  category_id: string
  category_name?: string
  name: string
  description: string
  price: number
  duration_minutes: number
  is_active: boolean
  requires_consultation: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface Appointment {
  id: string
  client_id: string
  client_name: string
  client_email: string
  client_phone: string
  technician_id: string
  technician_name: string
  date: string
  start_time: string
  end_time: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  services: {
    id: string
    name: string
    price_at_booking: number
    duration_at_booking: number
  }[]
  total_amount: number
  total_duration: number
  created_at: string
  cancelled_at?: string
  cancelled_by?: string
  cancellation_reason?: string
}

export interface AvailabilitySlot {
  start_time: string
  end_time: string
}

export interface TechnicianAvailability {
  technician_id: string
  technician_name: string
  date: string
  schedule: {
    start_time: string
    end_time: string
  }
  busy_slots: {
    start_time: string
    end_time: string
    appointment_id: string
  }[]
  available_slots: AvailabilitySlot[]
}

// API Functions

// Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password })
    return data
  },

  register: async (userData: {
    name: string
    email: string
    password: string
    phone: string
    role?: string
  }) => {
    const { data } = await api.post('/users/register', {
      ...userData,
      role: userData.role || 'CLIENT',
    })
    return data
  },

  getProfile: async () => {
    const { data } = await api.get('/users/me')
    return data
  },
}

// Users
export const usersAPI = {
  getAll: async () => {
    const { data } = await api.get('/users')
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/users/${id}`)
    return data
  },

  create: async (userData: {
    name: string
    email?: string
    password: string
    phone?: string
    role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  }) => {
    // Clean up empty strings before sending to backend
    const cleanedData = {
      ...userData,
      email: userData.email && userData.email.trim() !== '' ? userData.email : undefined,
      phone: userData.phone && userData.phone.trim() !== '' ? userData.phone : undefined,
    }
    const { data } = await api.post('/users', cleanedData)
    return data
  },

  update: async (id: string, updates: Partial<User>) => {
    const { data } = await api.put(`/users/${id}`, updates)
    return data
  },

  updateRole: async (id: string, role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT') => {
    const { data } = await api.put(`/users/${id}`, { role })
    return data
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`)
    return data
  },

  getTechnicians: async () => {
    const { data } = await api.get('/users/technicians')
    return data
  },

  getClients: async () => {
    const { data } = await api.get('/users/clients')
    return data
  },
}

// Services
export const servicesAPI = {
  getAll: async (params?: { category_id?: string; is_active?: boolean }) => {
    const { data } = await api.get('/services', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/services/${id}`)
    return data
  },

  create: async (service: Omit<Service, 'id'>) => {
    const { data } = await api.post('/services', service)
    return data
  },

  update: async (id: string, updates: Partial<Service>) => {
    const { data } = await api.put(`/services/${id}`, updates)
    return data
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/services/${id}`)
    return data
  },

  getTechnicianServices: async (technicianId: string) => {
    const { data } = await api.get(`/services/technician/${technicianId}`)
    return data
  },

  assignToTechnician: async (technicianId: string, serviceIds: string[]) => {
    const { data } = await api.post('/services/assign-multiple', {
      technician_id: technicianId,
      service_ids: serviceIds,
    })
    return data
  },
}

// Categories
export const categoriesAPI = {
  getAll: async () => {
    const { data } = await api.get('/services/categories')
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/services/categories/${id}`)
    return data
  },

  create: async (category: Omit<Category, 'id'>) => {
    const { data } = await api.post('/services/categories', category)
    return data
  },

  update: async (id: string, updates: Partial<Category>) => {
    const { data } = await api.put(`/services/categories/${id}`, updates)
    return data
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/services/categories/${id}`)
    return data
  },
}

// Appointments
export const appointmentsAPI = {
  getAll: async (params?: {
    date?: string
    status?: string
    technician_id?: string
    client_id?: string
  }) => {
    const { data } = await api.get('/appointments', { params })
    return data
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/appointments/${id}`)
    return data
  },

  create: async (appointment: {
    client_id: string
    technician_id: string
    date: string
    start_time: string
    service_ids: string[]
    notes?: string
  }) => {
    const { data } = await api.post('/appointments', appointment)
    return data
  },

  update: async (
    id: string,
    updates: {
      date?: string
      start_time?: string
      status?: string
      notes?: string
    }
  ) => {
    const { data } = await api.put(`/appointments/${id}`, updates)
    return data
  },

  cancel: async (id: string, reason: string) => {
    const { data } = await api.delete(`/appointments/${id}`, {
      data: { cancellation_reason: reason },
    })
    return data
  },

  getTechnicianAvailability: async (technicianId: string, date: string) => {
    const { data } = await api.get(
      `/appointments/technician/${technicianId}/availability`,
      { params: { date } }
    )
    return data
  },

  getTechnicianSummary: async (technicianId: string, date: string) => {
    const { data } = await api.get(
      `/appointments/technician/${technicianId}/summary`,
      { params: { date } }
    )
    return data
  },

  sendWhatsAppReminder: async (appointmentId: string) => {
    const { data } = await api.post(`/appointments/${appointmentId}/send-whatsapp`)
    return data
  },

  getStatistics: async (technicianId: string, period: 'day' | 'week' | 'month' | 'year' = 'week') => {
    const { data } = await api.get(`/appointments/statistics/${technicianId}`, {
      params: { period }
    })
    return data
  },
}

// Appointment Notes
export interface AppointmentNote {
  id: string
  appointment_id: string
  client_id: string
  client_name: string
  technician_id: string
  technician_name: string
  observations: string
  products_used?: string
  recommendations?: string
  before_photos?: string[]
  after_photos?: string[]
  appointment_date: string
  appointment_start_time: string
  services: string[]
  total_amount?: number
  created_at: string
  updated_at: string
}

export interface ClientRecord {
  client_id: string
  client_name: string
  client_email: string
  client_phone?: string
  total_appointments: number
  total_notes: number
  first_visit: string
  last_visit: string
  notes: AppointmentNote[]
}

export const appointmentNotesAPI = {
  create: async (noteData: {
    appointment_id: string
    observations: string
    products_used?: string
    recommendations?: string
  }) => {
    const { data } = await api.post('/appointments/notes', noteData)
    return data
  },

  getAllClientRecords: async () => {
    const { data } = await api.get('/appointments/notes/records/all')
    return data
  },

  getClientNotes: async (clientId: string) => {
    const { data } = await api.get(`/appointments/notes/client/${clientId}`)
    return data
  },

  getNoteById: async (noteId: string) => {
    const { data } = await api.get(`/appointments/notes/${noteId}`)
    return data
  },

  getNoteByAppointment: async (appointmentId: string) => {
    const { data } = await api.get(`/appointments/${appointmentId}/note`)
    return data
  },

  update: async (noteId: string, updates: {
    observations?: string
    products_used?: string
    recommendations?: string
  }) => {
    const { data } = await api.put(`/appointments/notes/${noteId}`, updates)
    return data
  },

  delete: async (noteId: string) => {
    const { data } = await api.delete(`/appointments/notes/${noteId}`)
    return data
  },
}
