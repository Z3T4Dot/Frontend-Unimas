import { api } from '@/lib/api'
import type { ApiResponse, Service } from './types.api'


export const getServices = () => api.get<ApiResponse<Service[]>>('/services')