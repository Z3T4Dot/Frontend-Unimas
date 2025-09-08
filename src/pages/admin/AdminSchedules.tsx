// src/pages/admin/AdminSchedules.tsx
import { useEffect, useState } from "react";
import api from "../../lib/api";

type Slot = { start: string; end: string };
type SchedItem = {
  specialist: { id: string; name: string; role: string };
  hours: Slot[];
  appointments: Array<{
    id: string;
    service_id: string;
    service_name: string | null;
    client_id: string;
    starts_at: string;
    ends_at: string;
    price: number | null;
    status: string;
  }>;
  total_amount: number;
};

function fmtTime(t: string) {
  // acepta 'HH:MM:SS' o ISO
  if (t.includes("T"))
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

function todayYMD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function AdminSchedules() {
  const [date, setDate] = useState(todayYMD());
  const [items, setItems] = useState<SchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await api.get("/admin/schedules", { params: { date } });
        setItems(r.data?.data || []);
      } catch (e: any) {
        setErr(e?.response?.data?.error || "Error cargando horarios");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [date]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <label className="block">
          <span className="text-sm text-zinc-700">Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 border rounded-xl p-2 bg-white"
          />
        </label>
      </div>

      {loading && <p className="text-sm text-zinc-600">Cargando…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {(!items || items.length === 0) && !loading && !err && (
        <p className="text-sm text-zinc-500">Sin citas.</p>
      )}

      <div className="space-y-4">
        {items.map((it) => (
          <div
            key={it.specialist.id}
            className="border rounded-xl bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {it.specialist.name}{" "}
                  <span className="text-xs px-2 py-0.5 rounded-full border ml-2">
                    {it.specialist.role}
                  </span>
                </div>
                <div className="text-sm text-zinc-600">
                  Total del día: $
                  {Number(it.total_amount || 0).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-zinc-600">
                {it.hours.length > 0 ? (
                  <span>
                    Horario:{" "}
                    {it.hours
                      .map((h) => `${fmtTime(h.start)}–${fmtTime(h.end)}`)
                      .join(", ")}
                  </span>
                ) : (
                  <span className="italic text-zinc-400">
                    Sin horario cargado
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3">
              {it.appointments.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No tiene citas en este día.
                </p>
              ) : (
                <ul className="divide-y">
                  {it.appointments.map((a) => (
                    <li
                      key={a.id}
                      className="py-2 flex items-center justify-between"
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {a.service_name || "Servicio"} •{" "}
                          <span className="text-zinc-600">
                            {fmtTime(a.starts_at)}–{fmtTime(a.ends_at)}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-600">
                          Cliente: {a.client_id.slice(0, 8)}… | Estado:{" "}
                          {a.status}
                        </div>
                      </div>
                      <div className="text-sm">
                        {a.price != null ? (
                          <>${Number(a.price).toLocaleString()}</>
                        ) : (
                          "-"
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
