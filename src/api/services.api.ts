import api from './apiClient'
import type { ApiResponse, Service } from './types.api'


export const getServices = () => api.get<ApiResponse<Service[]>>('/services')