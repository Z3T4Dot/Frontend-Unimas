export const ensureEnv = () => {
  if (!import.meta.env.VITE_API_URL) console.warn("VITE_API_URL missing");
  if (!import.meta.env.VITE_SUPABASE_URL)
    console.warn("VITE_SUPABASE_URL missing");
};
