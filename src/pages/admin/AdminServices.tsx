import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, X, Save } from "lucide-react";
import api from "../../lib/api";
import Toast from "../../components/Toast";

/** ====== Tipos ====== */
type Service = {
  id: string;
  name: string;
  duration_min: number;
  price: number;
  active?: boolean;
  image_url?: string | null;
  // cache local
  _subtypes?: ServiceSubtype[];
  _open?: boolean;
};

export type ServiceSubtype = {
  id?: string;
  name: string;
  duration_min: number;
  price: number;
};

/** ====== Utils ====== */
const money = (v: number | string | null | undefined) =>
  v == null ? "-" : `$ ${Number(v).toLocaleString()}`;

/** ====== AdminServices (página) ====== */
export default function AdminServices() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Service[]>([]);

  // formulario crear servicio
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState<string>("");

  // modales
  const [confirmFor, setConfirmFor] = useState<Service | null>(null);
  const [editSubtypesOf, setEditSubtypesOf] = useState<Service | null>(null);

  // toast
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type?: "success" | "error" | "info";
  }>({ open: false, msg: "", type: "success" });
  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "success"
  ) => setToast({ open: true, msg, type });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const canCreate = useMemo(
    () => name.trim() && duration > 0 && price >= 0,
    [name, duration, price]
  );

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/admin/services");
      const data: Service[] = r.data?.data || [];
      setItems(data);
    } catch (e: any) {
      showToast(
        e?.response?.data?.error || "Error cargando servicios",
        "error"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      const r = await api.post("/admin/services", {
        name: name.trim(),
        duration_min: Number(duration),
        price: Number(price),
        image_url: image || null,
      });

      // Normaliza distintas formas de respuesta
      const raw = r?.data;
      const payload = raw?.data ?? raw?.service ?? raw ?? null; // soporta {data}, {service} o el objeto directo
      const s: Service | null = Array.isArray(payload)
        ? payload[0] ?? null // soporta {data: [row]}
        : payload ?? null; // soporta {data: row} o row

      // Si no viene el objeto creado, como fallback recarga y busca por nombre+duración+precio
      if (!s || !s.id) {
        await load();
        const guess = items.find(
          (x) =>
            x.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            Number(x.duration_min) === Number(duration) &&
            Number(x.price) === Number(price)
        );
        if (guess?.id) {
          // Limpiar form, feedback y popup subtipos
          setName("");
          setDuration(30);
          setPrice(0);
          setImage("");
          showToast(`✅ Servicio "${guess.name}" creado`, "success");
          setConfirmFor(guess);
          return;
        }
        // Si ni así lo encontramos, sí consideramos error
        showToast("No se pudo interpretar la respuesta del servidor.", "error");
        return;
      }

      // Limpiar form
      setName("");
      setDuration(30);
      setPrice(0);
      setImage("");

      // Refresca lista y muestra toast OK
      await load();
      showToast(`✅ Servicio "${s.name}" creado`, "success");

      // Pregunta subtipos
      setConfirmFor(s);
    } catch (e: any) {
      // Si el backend creó pero respondió con forma rara + 2xx, no entra aquí.
      // Aquí solo llegan errores reales de red/4xx/5xx.
      const msg = e?.response?.data?.error || "No se pudo crear el servicio";
      showToast(msg, "error");
    }
  };

  const toggleOpen = async (svc: Service) => {
    // abre/cierra y si abre, trae subtipos si no hay cache
    setItems((prev) =>
      prev.map((s) => (s.id === svc.id ? { ...s, _open: !s._open } : s))
    );
    if (!svc._open && !svc._subtypes) {
      try {
        const r = await api.get(`/admin/services/${svc.id}/subtypes`);
        const subs: ServiceSubtype[] = r.data?.data || [];
        setItems((prev) =>
          prev.map((s) => (s.id === svc.id ? { ...s, _subtypes: subs } : s))
        );
      } catch {
        // silencioso
      }
    }
  };

  const onSavedSubtypes = (serviceId: string, subtypes: ServiceSubtype[]) => {
    setItems((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, _subtypes: subtypes, _open: true } : s
      )
    );
    showToast("✅ Subtipos guardados", "success");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Servicios</h1>

      {/* Crear servicio */}
      <section className="border rounded-2xl bg-white p-4">
        <h2 className="font-medium mb-3">Nuevo servicio</h2>
        <div className="grid sm:grid-cols-5 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-sm text-zinc-700">Nombre</span>
            <input
              className="mt-1 w-full border rounded-xl p-3 bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Consulta general"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-700">Duración (min)</span>
            <input
              type="number"
              min={1}
              className="mt-1 w-full border rounded-xl p-3 bg-white"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value || 0))}
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-700">Precio</span>
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded-xl p-3 bg-white"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value || 0))}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-zinc-700">
              Imagen (URL) (opcional)
            </span>
            <input
              className="mt-1 w-full border rounded-xl p-3 bg-white"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
            />
          </label>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={create}
              disabled={!canCreate}
              className="px-5 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </section>

      {/* Lista de servicios */}
      <section className="space-y-3">
        <h2 className="font-medium">Existentes</h2>
        {loading && <p className="text-sm text-zinc-600">Cargando…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-zinc-500">No hay servicios aún.</p>
        )}

        {items.map((svc) => {
          const open = !!svc._open;
          const subtypes = svc._subtypes || [];
          return (
            <div key={svc.id} className="border rounded-2xl bg-white">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleOpen(svc)}
                    className="w-8 h-8 grid place-items-center rounded-lg border hover:bg-zinc-50"
                    title={open ? "Ocultar subtipos" : "Ver subtipos"}
                  >
                    {open ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  <div>
                    <div className="font-medium">{svc.name}</div>
                    <div className="text-sm text-zinc-600">
                      {svc.duration_min} min • {money(svc.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditSubtypesOf(svc)}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50 text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Subtipos
                  </button>
                </div>
              </div>

              {open && (
                <div className="px-4 pb-4">
                  {subtypes.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Este servicio no tiene subtipos.
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {subtypes.map((st, idx) => (
                        <div
                          key={`${st.id || "new"}-${idx}`}
                          className="border rounded-xl p-3 bg-zinc-50"
                        >
                          <div className="font-medium">{st.name}</div>
                          <div className="text-sm text-zinc-600">
                            {st.duration_min} min • {money(st.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Modal: ¿Añadir subtipos ahora? */}
      {confirmFor && (
        <ConfirmAddSubtypes
          service={confirmFor}
          onClose={() => setConfirmFor(null)}
          onYes={() => {
            setEditSubtypesOf(confirmFor);
            setConfirmFor(null);
          }}
        />
      )}

      {/* Modal: Editor de subtipos */}
      {editSubtypesOf && (
        <SubtypesEditor
          service={editSubtypesOf}
          onClose={() => setEditSubtypesOf(null)}
          onSaved={(list) => {
            onSavedSubtypes(editSubtypesOf.id, list);
            setEditSubtypesOf(null);
          }}
        />
      )}

      {/* TOAST */}
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}

/** ====== Modal Confirmación ====== */
function ConfirmAddSubtypes({
  service,
  onClose,
  onYes,
}: {
  service: Service;
  onClose: () => void;
  onYes: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full border shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">Servicio creado</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-zinc-700 mt-2">
          <span className="font-medium">{service.name}</span> fue creado.
          <br />
          ¿Deseas añadir subtipos ahora?
        </p>
        <div className="mt-4 flex items-center gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Más tarde
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 rounded-xl bg-black text-white"
          >
            Añadir subtipos
          </button>
        </div>
      </div>
    </div>
  );
}

/** ====== Modal Editor Subtipos ====== */
function SubtypesEditor({
  service,
  onClose,
  onSaved,
}: {
  service: Service;
  onClose: () => void;
  onSaved: (subtypes: ServiceSubtype[]) => void;
}) {
  const [rows, setRows] = useState<ServiceSubtype[]>(
    service._subtypes && service._subtypes.length > 0
      ? service._subtypes
      : [
          {
            name: "",
            duration_min: service.duration_min || 30,
            price: service.price || 0,
          },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // si no venían cacheados, intenta cargarlos
    const run = async () => {
      try {
        const r = await api.get(`/admin/services/${service.id}/subtypes`);
        const subs: ServiceSubtype[] = r.data?.data || [];
        if (subs.length) setRows(subs);
      } catch {
        // silencioso
      }
    };
    if (!service._subtypes) run();
  }, [service]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        name: "",
        duration_min: service.duration_min || 30,
        price: service.price || 0,
      },
    ]);
  };
  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateRow = (i: number, patch: Partial<ServiceSubtype>) => {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );
  };

  const canSave =
    rows.length > 0 &&
    rows.every((r) => r.name.trim() && r.duration_min > 0 && r.price >= 0);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setErr("");
    try {
      // upsert bulk
      await api.post(`/admin/services/${service.id}/subtypes`, {
        subtypes: rows.map((r) => ({
          id: r.id ?? undefined,
          name: r.name.trim(),
          duration_min: Number(r.duration_min),
          price: Number(r.price),
        })),
      });
      // recarga final con ids
      const rr = await api.get(`/admin/services/${service.id}/subtypes`);
      const fresh: ServiceSubtype[] = rr.data?.data || [];
      onSaved(fresh);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "No se pudieron guardar los subtipos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 grid place-items-center">
      <div className="bg-white rounded-2xl w-full max-w-3xl border shadow-xl">
        <div className="p-4 flex items-center justify-between border-b">
          <div>
            <h3 className="font-semibold text-lg">Subtipos</h3>
            <p className="text-sm text-zinc-600">{service.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {rows.map((r, idx) => (
            <div
              key={`${r.id || "new"}-${idx}`}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end border rounded-xl p-3"
            >
              <label className="block sm:col-span-5">
                <span className="text-sm text-zinc-700">
                  Nombre del subtipo
                </span>
                <input
                  className="mt-1 w-full border rounded-xl p-3 bg-white"
                  value={r.name}
                  onChange={(e) => updateRow(idx, { name: e.target.value })}
                  placeholder="Ej. Control / Seguimiento"
                />
              </label>
              <label className="block sm:col-span-3">
                <span className="text-sm text-zinc-700">Duración (min)</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full border rounded-xl p-3 bg-white"
                  value={r.duration_min}
                  onChange={(e) =>
                    updateRow(idx, {
                      duration_min: Number(e.target.value || 0),
                    })
                  }
                />
              </label>
              <label className="block sm:col-span-3">
                <span className="text-sm text-zinc-700">Precio</span>
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full border rounded-xl p-3 bg-white"
                  value={r.price}
                  onChange={(e) =>
                    updateRow(idx, { price: Number(e.target.value || 0) })
                  }
                />
              </label>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeRow(idx)}
                  className="px-3 py-2 rounded-xl border bg-white hover:bg-zinc-50"
                  title="Eliminar subtipo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <button
              onClick={addRow}
              className="px-4 py-2 rounded-xl border bg-white hover:bg-zinc-50 flex items-center gap-2"
            >
              <Plus size={16} />
              Añadir subtipo
            </button>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">
            Cancelar
          </button>
          <button
            disabled={!canSave || saving}
            onClick={save}
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
