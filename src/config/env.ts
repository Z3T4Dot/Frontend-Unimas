// Export environment variables with proper typing
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://back-unimas-v2.up.railway.app/api';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

export const ensureEnv = () => {
  if (!import.meta.env.VITE_API_URL) console.warn("VITE_API_URL missing");
  if (!import.meta.env.VITE_SUPABASE_URL) console.warn("VITE_SUPABASE_URL missing");
  if (!import.meta.env.VITE_SUPABASE_KEY) console.warn("VITE_SUPABASE_KEY missing");
};
