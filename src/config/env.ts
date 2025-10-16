// src/config/env.ts
const DEFAULT_API_URL = "https://back-unimas-v2.up.railway.app/api";

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  DEFAULT_API_URL;

export const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";
export const SUPABASE_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_KEY) || "";

export const ensureEnv = () => {
  if (!API_BASE_URL) console.warn("⚠️ API_BASE_URL missing");
  if (!SUPABASE_URL) console.warn("⚠️ SUPABASE_URL missing");
  if (!SUPABASE_KEY) console.warn("⚠️ SUPABASE_KEY missing");
};

console.log("🌍 API_BASE_URL actual:", API_BASE_URL);