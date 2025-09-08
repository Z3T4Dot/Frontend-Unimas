// src/pages/MyAppointments.tsx
import { useEffect, useState } from "react";
import api from "../lib/api";
import RescheduleDialog, {
  type ApptLite,
} from "../components/RescheduleDialog";

export default function MyAppointments() {
  const [upcoming, setUpcoming] = useState<ApptLite[]>([]);
  const [history, setHistory] = useState<ApptLite[]>([]);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ApptLite | null>(null);

  const load = () => {
    setMsg("");
    Promise.all([
      api.get("/calendar/appointments?range=upcoming&status=scheduled"),
      api.get("/calendar/appointments?range=past&status=all"),
    ])
      .then(([u, h]) => {
        setUpcoming(u.data.data || []);
        setHistory(h.data.data || []);
      })
      .catch((e) =>
        setMsg(e?.response?.data?.error || "No se pudo cargar tus citas")
      );
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id: string) => {
    setMsg("");
    try {
      const r = await api.patch(`/calendar/appointments/${id}/cancel`, {});
      if (r.data?.suspended_until) {
        alert(
          `Has sido suspendido hasta: ${new Date(
            r.data.suspended_until
          ).toLocaleString()}`
        );
      }
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e.message);
    }
  };

  const onOpenReschedule = (appt: ApptLite) => {
    setCurrent(appt);
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold">Mis citas</h1>

      <section className="space-y-3">
        <h2 className="font-medium">Próximas</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-600">No tienes citas próximas.</p>
        ) : (
          upcoming.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border p-3 bg-white flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {a.service?.name ?? "Servicio"} ·{" "}
                  {a.specialist?.display_name ?? "Especialista"}
                </div>
                <div className="text-sm text-zinc-600">
                  {new Date(a.starts_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 border rounded-xl"
                  onClick={() => onOpenReschedule(a)}
                >
                  Re-agendar
                </button>
                <button
                  className="px-3 py-2 border rounded-xl"
                  onClick={() => onCancel(a.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Historial</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-600">Aún no hay historial.</p>
        ) : (
          history.map((a) => (
            <div key={a.id} className="rounded-xl border p-3 bg-white">
              <div className="font-medium">
                {a.service?.name ?? "Servicio"} ·{" "}
                {a.specialist?.display_name ?? "Especialista"}
              </div>
              <div className="text-sm text-zinc-600">
                {new Date(a.starts_at).toLocaleString()} — {String(a.status)}
              </div>
            </div>
          ))
        )}
      </section>

      {!!msg && <p className="text-sm text-red-600">{msg}</p>}

      <RescheduleDialog
        open={open}
        appt={current}
        onClose={() => setOpen(false)}
        onRescheduled={load}
      />
    </div>
  );
}
