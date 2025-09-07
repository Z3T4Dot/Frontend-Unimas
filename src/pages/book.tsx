import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { getUser } from "../lib/auth";
import ServicesCarousel, { type Service } from "../components/ServicesCarousel";
import SpecialistsCarousel from "../components/SpecialistsCarousel";
import { cn } from "../utils/ui";
import type { Specialist } from "../types/components.types";

export default function Book() {
  const me = getUser();

  const [services, setServices] = useState<Service[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [specialistId, setSpecialistId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    api.get("/calendar/services").then((r) => setServices(r.data.data || []));
    api
      .get("/calendar/specialists")
      .then((r) => setSpecialists(r.data.data || []));
  }, []);

  useEffect(() => {
    setSlots([]);
    setSlot("");
    if (!serviceId || !specialistId || !date) return;
    const q = new URLSearchParams({ date, specialistId, serviceId }).toString();
    api
      .get(`/calendar/availability?${q}`)
      .then((r) => setSlots(r.data.slots || []));
  }, [serviceId, specialistId, date]);

  const canCreate = useMemo(
    () => !!(serviceId && specialistId && date && slot && me?.id),
    [serviceId, specialistId, date, slot, me?.id]
  );

  const create = async () => {
    setMsg("");
    if (!me?.id) return setMsg("Debes iniciar sesión.");
    const starts_at = `${date}T${slot}:00.000Z`;
    try {
      const r = await api.post("/calendar/appointments", {
        client_id: me.id,
        specialist_id: specialistId,
        service_id: serviceId,
        starts_at,
      });
      setMsg(`✅ Cita creada: ${r.data.data.id}`);
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.response?.data?.error || e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <ServicesCarousel
        items={services}
        selectedId={serviceId}
        onSelect={setServiceId}
      />

      <SpecialistsCarousel
        items={specialists}
        selectedId={specialistId}
        onSelect={setSpecialistId}
      />

      <section className="grid sm:grid-cols-3 gap-3">
        <label className="block sm:col-span-1">
          <span className="text-sm text-zinc-700">Fecha</span>
          <input
            className="mt-1 w-full border rounded-xl p-3 bg-white"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <div className="sm:col-span-2">
          <div className="text-sm text-zinc-700 mb-1">Horarios disponibles</div>
          {slots.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Selecciona servicio, especialista y fecha.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
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
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={create}
          disabled={!canCreate}
          className="px-5 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-50"
        >
          Crear cita
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
