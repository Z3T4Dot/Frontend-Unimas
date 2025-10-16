import api from './apiClient'
import type { ApiResponse, UserProfile } from './types.api'


export const loginReq = (email: string, password: string) =>
api.post<ApiResponse<{ user: UserProfile; token: string }>>('/users/login', { email, password })


export const meReq = () => api.get<ApiResponse<UserProfile>>('/users/me')