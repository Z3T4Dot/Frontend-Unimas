// src/pages/admin/AdminSchedules.tsx
import { useEffect, useState, useCallback } from "react";
import api from "../../lib/api";
import WeeklyHoursEditor from "../../components/WeeklyHoursEditor";

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
    status: string; // 'scheduled' | 'canceled' | 'completed' ...
  }>;
  total_amount: number; // puede venir del backend, pero recalculamos localmente
};

function fmtTime(t: string) {
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

// suma sólo citas NO canceladas
function calcEffectiveTotal(apps: SchedItem["appointments"]) {
  return apps.reduce((acc, a) => {
    if (a.status !== "canceled" && a.price != null) {
      acc += Number(a.price);
    }
    return acc;
  }, 0);
}

export default function AdminSchedules() {
  const [date, setDate] = useState(todayYMD());
  const [items, setItems] = useState<SchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null
  );

  const load = useCallback(async () => {
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
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

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
        {items.map((it) => {
          const effectiveTotal = calcEffectiveTotal(it.appointments);
          return (
            <div
              key={it.specialist.id}
              className="border rounded-xl bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {it.specialist.name}{" "}
                    <span className="text-xs px-2 py-0.5 rounded-full border ml-2">
                      {it.specialist.role}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-600">
                    {/* usamos el total efectivo que excluye canceladas */}
                    Total del día: ${effectiveTotal.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  {it.hours.length > 0 ? (
                    <span className="whitespace-nowrap">
                      Horario:{" "}
                      {it.hours
                        .map((h) => `${fmtTime(h.start)}–${fmtTime(h.end)}`)
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="italic text-zinc-400 whitespace-nowrap">
                      Sin horario cargado
                    </span>
                  )}

                  <button
                    onClick={() =>
                      setEditing({
                        id: it.specialist.id,
                        name: it.specialist.name,
                      })
                    }
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50 text-sm"
                    title="Editar horario semanal"
                  >
                    Editar horario
                  </button>
                </div>
              </div>

              <div className="mt-3">
                {it.appointments.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No tiene citas en este día.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {it.appointments.map((a) => {
                      const isCanceled = a.status === "canceled";
                      return (
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
                              {isCanceled ? (
                                <span className="text-red-600 font-medium">
                                  cancelado
                                </span>
                              ) : (
                                a.status
                              )}
                            </div>
                          </div>

                          <div className="text-sm">
                            {a.price == null ? (
                              "-"
                            ) : isCanceled ? (
                              <span className="text-red-600">
                                Cancelado{" "}
                                <span className="ml-1 text-zinc-500">
                                  · ${Number(a.price).toLocaleString()}
                                </span>
                              </span>
                            ) : (
                              <>${Number(a.price).toLocaleString()}</>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <WeeklyHoursEditor
          techId={editing.id}
          techName={editing.name}
          onClose={() => setEditing(null)}
          onSaved={() => {
            load();
          }}
        />
      )}
    </div>
  );
}
