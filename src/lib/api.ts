import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
