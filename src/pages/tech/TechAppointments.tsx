import { useEffect, useState } from "react";
import api from "../../lib/api";

type Item = {
  id: string;
  status: string;
  starts_at: string;
  confirmed_at?: string | null;
  service?: { id: string; name: string };
  client?: { id: string; display_name: string };
};

export default function TechAppointments() {
  const [items, setItems] = useState<Item[]>([]);
  const [range, setRange] = useState<"today"|"next"|"day">("today");
  const [date, setDate]   = useState<string>("");

  const load = () => {
    const qs = new URLSearchParams(
      range === "day" && date ? { range:"day", date } :
      range === "today" ? { range:"today" } :
      { range:"next", days: "7" }
    ).toString();
    api.get(`/tech/appointments?${qs}`).then(r => setItems(r.data.data || [])).catch(() => setItems([]));
  };

  useEffect(() => { load(); }, [range, date]);

  const confirm = async (id: string) => { await api.patch(`/tech/appointments/${id}/confirm`, {}); load(); };
  const cancel  = async (id: string) => { await api.patch(`/tech/appointments/${id}/cancel`,  {}); load(); };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Citas</h1>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex gap-2">
          <button className={`px-3 py-2 border rounded-xl ${range==='today'?'bg-black text-white':''}`} onClick={()=>setRange("today")}>Hoy</button>
          <button className={`px-3 py-2 border rounded-xl ${range==='next'?'bg-black text-white':''}`}  onClick={()=>setRange("next")}>Próximos 7 días</button>
          <button className={`px-3 py-2 border rounded-xl ${range==='day'?'bg-black text-white':''}`}   onClick={()=>setRange("day")}>Por día</button>
        </div>
        {range === "day" && (
          <input type="date" className="border rounded-xl p-2" value={date} onChange={(e)=>setDate(e.target.value)} />
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Sin citas en el rango seleccionado.</p>
      ) : items.map(a => (
        <div key={a.id} className="flex items-center justify-between border rounded-xl p-3 bg-white">
          <div>
            <div className="font-medium">{a.service?.name ?? "Servicio"} · {a.client?.display_name ?? "Cliente"}</div>
            <div className="text-sm text-zinc-600">{new Date(a.starts_at).toLocaleString()}</div>
            {a.confirmed_at && <div className="text-xs text-emerald-700">Confirmada</div>}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border rounded-xl" onClick={()=>confirm(a.id)}>Confirmar</button>
            <button className="px-3 py-2 border rounded-xl" onClick={()=>cancel(a.id)}>Cancelar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
