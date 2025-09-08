// src/lib/api.ts
import axios from "axios";
import { getToken } from "./auth";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
export default api;
