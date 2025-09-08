import { useEffect, useState } from "react";
import api from "../../lib/api";

type Client = { id: string; display_name: string };

export default function TechClients() {
  const [items, setItems] = useState<Client[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/tech/clients").then(r => setItems(r.data.data || [])).catch(()=>setItems([]));
  }, []);

  const filtered = items.filter(c => c.display_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Clientes</h1>
      <input className="border rounded-xl p-2 w-full sm:w-80" placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} />
      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-600">Aún no tienes clientes.</p>
      ) : filtered.map(c => (
        <a key={c.id} href={`/tech/client/${c.id}`} className="block border rounded-xl p-3 bg-white hover:bg-zinc-50">
          {c.display_name}
        </a>
      ))}
    </div>
  );
}
