import api from "./api";

export const AdminAPI = {
  // services
  listServices: () => api.get("/admin/services").then(r => r.data.data),
  createService: (payload: any) => api.post("/admin/services", payload).then(r => r.data.data),
  updateService: (id: string, payload: any) => api.patch(`/admin/services/${id}`, payload).then(r => r.data.data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`).then(r => r.data),

  // users
  listUsers: (role?: string) => api.get("/admin/users", { params: role ? { role } : {} }).then(r => r.data.data),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data.data),

  // reports
  workersDailyTotals: (dateISO: string) => api.get("/admin/stats/workers/daily", { params: { date: dateISO }}).then(r => r.data.data),
  workerDailySchedule: (id: string, dateISO: string) => api.get(`/admin/stats/worker/${id}/schedule`, { params: { date: dateISO }}).then(r => r.data.data),
  workerTopClients: (id: string, fromISO: string, toISO: string, limit=10) =>
    api.get(`/admin/stats/worker/${id}/top-clients`, { params: { from: fromISO, to: toISO, limit }}).then(r => r.data.data),
};
