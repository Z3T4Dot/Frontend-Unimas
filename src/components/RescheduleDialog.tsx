import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { cn } from "../utils/ui";

type SpecialistLite = { id: string; display_name: string };
type ServiceLite = { id: string; name: string; image_url?: string };

export type ApptLite = {
  id: string;
  starts_at: string;
  duration_min: number;
  specialist: SpecialistLite | null;
  service: ServiceLite | null;
};

type Props = {
  open: boolean;
  appt: ApptLite | null;
  onClose: () => void;
  onRescheduled: () => void; // callback para refrescar lista
};

function yyyyMmDd(d: Date) {
  // YYYY-MM-DD en UTC
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

export default function RescheduleDialog({
  open,
  appt,
  onClose,
  onRescheduled,
}: Props) {
  const initDate = useMemo(() => {
    if (!appt) return "";
    return yyyyMmDd(new Date(appt.starts_at));
  }, [appt]);

  const [date, setDate] = useState<string>(initDate);
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setMsg("");
    setSlot("");
    setSlots([]);
    setDate(initDate);
  }, [open, initDate]);

  // Carga de disponibilidad
  useEffect(() => {
    const run = async () => {
      setSlots([]);
      setSlot("");
      if (!open || !appt || !date || !appt.specialist?.id) return;

      const params = new URLSearchParams({
        date,
        specialistId: appt.specialist.id,
        // usamos la duración efectiva de la cita
        duration_min: String(appt.duration_min || 0),
      }).toString();

      try {
        const r = await api.get(`/calendar/availability?${params}`);
        setSlots(r.data?.slots || []);
      } catch (e: any) {
        setSlots([]);
        setMsg(
          e?.response?.data?.error || "No se pudo cargar la disponibilidad"
        );
      }
    };
    run();
  }, [open, appt, date]);

  if (!open || !appt) return null;

  const canSave = !!(date && slot);
  const save = async () => {
    if (!appt) return;
    setLoading(true);
    setMsg("");
    try {
      const starts_at = `${date}T${slot}:00.000Z`;
      await api.patch(`/calendar/appointments/${appt.id}/reschedule`, {
        starts_at,
      });
      setLoading(false);
      onRescheduled();
      onClose();
    } catch (e: any) {
      setLoading(false);
      setMsg(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[min(92vw,680px)] rounded-2xl bg-white shadow-xl p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Re-agendar</div>
            <div className="text-sm text-zinc-600">
              {appt.service?.name} · {appt.specialist?.display_name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg hover:bg-zinc-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          <label className="block sm:col-span-1">
            <span className="text-sm text-zinc-700">Nueva fecha</span>
            <input
              type="date"
              className="mt-1 w-full border rounded-xl p-3 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div className="sm:col-span-2">
            <div className="text-sm text-zinc-700 mb-1">
              Horarios disponibles
            </div>
            {slots.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Selecciona una fecha para ver horarios.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[220px] overflow-auto pr-1">
                {slots.map((h) => (
                  <button
                    key={h}
                    onClick={() => setSlot(h)}
                    className={cn(
                      "px-3 py-2 rounded-xl border bg-white text-sm",
                      slot === h
                        ? "ring-2 ring-black border-black"
                        : "hover:bg-zinc-50"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!!msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>
          <button
            disabled={!canSave || loading}
            onClick={save}
            className="px-5 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
