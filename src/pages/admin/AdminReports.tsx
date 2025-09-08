import { useEffect, useState } from "react";
import api from "../../lib/api";

type TechTotal = {
  specialist_id: string;
  specialist: string;
  total: number;
  count: number;
};
type TopClient = { client_id: string; client: string; count: number };

export default function AdminReports() {
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [rows, setRows] = useState<TechTotal[]>([]);
  const [top, setTop] = useState<Record<string, TopClient[]>>({}); // specialist_id -> top

  useEffect(() => {
    const q = new URLSearchParams({ date }).toString();
    api
      .get(`/admin/reports/daily?${q}`)
      .then((r) => setRows(r.data?.data || []));
  }, [date]);

  useEffect(() => {
    // carga top de cada técnico (últimos 30 días)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const until = new Date();
    rows.forEach(async (t) => {
      const q = new URLSearchParams({
        specialist_id: t.specialist_id,
        since: since.toISOString(),
        until: until.toISOString(),
      }).toString();
      const r = await api.get(`/admin/reports/top-clients?${q}`);
      setTop((prev) => ({ ...prev, [t.specialist_id]: r.data?.data || [] }));
    });
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-xl p-2 bg-white"
        />
      </div>

      <section className="border rounded-xl p-4 bg-white">
        <h2 className="font-medium mb-3">Totales por técnico</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin datos para la fecha.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.specialist_id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.specialist}</div>
                  <div className="text-sm text-zinc-700">
                    {r.count} citas • ${r.total.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-sm text-zinc-600">
                  Top clientes (30 días):
                  <ul className="list-disc pl-5">
                    {(top[r.specialist_id] || []).map((c) => (
                      <li key={c.client_id}>
                        {c.client} — {c.count} citas
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
