// src/pages/admin/WeeklyHoursEditor.tsx
import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import api from "../lib/api";

type DayKey = "0" | "1" | "2" | "3" | "4" | "5" | "6";
type Interval = { start: string; end: string; active?: boolean; id?: number };

const dayNames: Record<DayKey, string> = {
  "0": "Domingo",
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sábado",
};

const emptyWeek: Record<DayKey, Interval[]> = {
  "0": [],
  "1": [],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
};

// asegura que siempre existan las 7 llaves 0..6 con arrays
function ensureWeek(input: any): Record<DayKey, Interval[]> {
  const wk = { ...emptyWeek };
  if (input && typeof input === "object") {
    (Object.keys(wk) as DayKey[]).forEach((k) => {
      const arr = Array.isArray(input[k]) ? input[k] : [];
      wk[k] = arr.map((r: any) => ({
        id: typeof r.id === "number" ? r.id : undefined,
        start: String(r.start || r.open_time || "").slice(0, 5), // HH:MM
        end: String(r.end || r.close_time || "").slice(0, 5),
        active: r.active !== false,
      }));
    });
  }
  return wk;
}

export default function WeeklyHoursEditor({
  techId,
  techName,
  onClose,
  onSaved,
}: {
  techId: string;
  techName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [week, setWeek] = useState<Record<DayKey, Interval[]>>(emptyWeek);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await api.get(`/admin/working-hours/${techId}`);
        const wk = ensureWeek(r.data?.data?.weekly);
        setWeek(wk);
      } catch (e: any) {
        setErr(e?.response?.data?.error || "No se pudo cargar el horario");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [techId]);

  const addInterval = (day: DayKey) => {
    setWeek((prev) => {
      const next = { ...prev };
      next[day] = [...next[day], { start: "09:00", end: "18:00", active: true }];
      return next;
    });
  };

  const removeInterval = (day: DayKey, idx: number) => {
    setWeek((prev) => {
      const next = { ...prev };
      next[day] = next[day].filter((_, i) => i !== idx);
      return next;
    });
  };

  const patchInterval = (
    day: DayKey,
    idx: number,
    patch: Partial<Interval>
  ) => {
    setWeek((prev) => {
      const arr = [...prev[day]];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [day]: arr };
    });
  };

  const canSave = useMemo(() => {
    // valida que cada intervalo tenga HH:MM válidas y end>start
    const okDay = (arr: Interval[]) =>
      arr.every(
        (r) =>
          /^\d{2}:\d{2}$/.test(r.start || "") &&
          /^\d{2}:\d{2}$/.test(r.end || "") &&
          r.end > r.start
      );
    return (Object.keys(week) as DayKey[]).every((k) => okDay(week[k]));
  }, [week]);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      // el backend normaliza HH:MM -> HH:MM:SS, así que enviamos HH:MM
      await api.put(`/admin/working-hours/${techId}`, { weekly: week });
      setOkMsg("Horario guardado.");
      onSaved(); // refresca la lista padre si lo necesitas
    } catch (e: any) {
      setErr(e?.response?.data?.error || "No se pudo guardar el horario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center">
      <div className="bg-white w-full max-w-2xl rounded-2xl border shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Horario semanal</h3>
            <div className="text-sm text-zinc-600">{techName}</div>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
          {loading ? (
            <p className="text-sm text-zinc-600">Cargando…</p>
          ) : (
            (Object.keys(week) as DayKey[]).map((k) => (
              <section key={k} className="border rounded-xl">
                <header className="px-3 py-2 border-b flex items-center justify-between bg-zinc-50 rounded-t-xl">
                  <div className="font-medium">{dayNames[k]}</div>
                  <button
                    onClick={() => addInterval(k)}
                    className="px-3 py-1.5 rounded-lg border bg-white hover:bg-zinc-50 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} /> Añadir intervalo
                  </button>
                </header>

                <div className="p-3 space-y-2">
                  {week[k].length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Sin intervalos para este día.
                    </p>
                  ) : (
                    week[k].map((it, idx) => (
                      <div
                        key={`${it.id ?? "new"}-${idx}`}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <label className="sm:col-span-5 text-sm">
                          <span className="text-zinc-700 block mb-1">Inicio</span>
                          <input
                            type="time"
                            value={it.start || "09:00"}
                            onChange={(e) =>
                              patchInterval(k, idx, { start: e.target.value })
                            }
                            className="w-full border rounded-xl p-2 bg-white"
                          />
                        </label>
                        <label className="sm:col-span-5 text-sm">
                          <span className="text-zinc-700 block mb-1">Fin</span>
                          <input
                            type="time"
                            value={it.end || "18:00"}
                            onChange={(e) =>
                              patchInterval(k, idx, { end: e.target.value })
                            }
                            className="w-full border rounded-xl p-2 bg-white"
                          />
                        </label>
                        <div className="sm:col-span-2 flex items-end justify-end gap-2">
                          <button
                            onClick={() => removeInterval(k, idx)}
                            className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50"
                            title="Eliminar intervalo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))
          )}

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={!canSave || saving}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
