import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../lib/api";

type File = { id: string; title: string; content: string; created_at: string };

export default function TechClientFiles() {
  const { clientId } = useParams();
  const [items, setItems] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const load = () => {
    if (!clientId) return;
    api.get(`/tech/files?client_id=${clientId}`).then(r => setItems(r.data.data || [])).catch(()=>setItems([]));
  };

  useEffect(() => { load(); }, [clientId]);

  const create = async () => {
    if (!clientId || !title || !content) return;
    await api.post("/tech/files", { client_id: clientId, title, content });
    setTitle(""); setContent(""); load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ficha técnica</h1>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <input className="border rounded-xl p-2 w-full" placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="border rounded-xl p-2 w-full h-32" placeholder="Contenido" value={content} onChange={(e)=>setContent(e.target.value)} />
          <button onClick={create} className="px-4 py-2 rounded-xl bg-black text-white">Guardar</button>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Histórico</div>
          {items.length === 0 ? (
            <p className="text-sm text-zinc-600">Sin fichas aún.</p>
          ) : items.map(f => (
            <div key={f.id} className="border rounded-xl p-3 bg-white">
              <div className="font-medium">{f.title}</div>
              <div className="text-xs text-zinc-500">{new Date(f.created_at).toLocaleString()}</div>
              <div className="mt-1 whitespace-pre-wrap text-sm">{f.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
