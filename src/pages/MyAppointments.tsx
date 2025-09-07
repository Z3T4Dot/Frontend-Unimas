import { useEffect, useState } from "react";
import api from "../lib/api";
import { supabase } from "../lib/supabase";

type Appt = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  services?: { name: string };
};

export default function MyAppointments() {
  const [items, setItems] = useState<Appt[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;
      const q = new URLSearchParams({ scope: "mine", userId }).toString();
      const r = await api.get(`/calendar/appointments?${q}`);
      setItems(r.data.data || []);
    })();
  }, []);

  const cancel = async (id: string) => {
    setMsg("");
    try {
      await api.patch(`/calendar/appointments/${id}/cancel`);
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x))
      );
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Mis citas</h2>
      {items.length === 0 && <p className="text-sm">No tienes citas.</p>}
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="border rounded p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">
                {a.services?.name || "Servicio"}
              </div>
              <div className="text-sm text-zinc-600">
                {new Date(a.starts_at).toLocaleString()} · {a.status}
              </div>
            </div>
            {a.status !== "cancelled" && (
              <button
                onClick={() => cancel(a.id)}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>
      {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
    </div>
  );
}
