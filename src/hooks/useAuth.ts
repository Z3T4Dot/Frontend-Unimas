// src/hooks/useFetch.ts
import { useState, useEffect } from 'react';

export function useFetch<T>(request: () => Promise<any>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    request()
      .then(res => {
        if (!mounted) return;
        setData(res.data.data as T);
      })
      .catch(err => setError(err?.message ?? 'Error'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
