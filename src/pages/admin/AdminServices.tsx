"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Save,
  Settings,
  Clock,
  DollarSign,
  ImageIcon,
  Package,
} from "lucide-react";
import api from "../../lib/api";
import Toast from "../../components/Toast";

/** ====== Types ====== */
type Service = {
  id: string;
  name: string;
  duration_min: number;
  price: number;
  active?: boolean;
  image_url?: string | null;
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

/** ====== Main Component ====== */
export default function PremiumAdminServices() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Service[]>([]);

  // Create service form
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState<string>("");

  // Modals
  const [confirmFor, setConfirmFor] = useState<Service | null>(null);
  const [editSubtypesOf, setEditSubtypesOf] = useState<Service | null>(null);

  // Toast
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

      const raw = r?.data;
      const payload = raw?.data ?? raw?.service ?? raw ?? null;
      const s: Service | null = Array.isArray(payload)
        ? payload[0] ?? null
        : payload ?? null;

      if (!s || !s.id) {
        await load();
        const guess = items.find(
          (x) =>
            x.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            Number(x.duration_min) === Number(duration) &&
            Number(x.price) === Number(price)
        );
        if (guess?.id) {
          setName("");
          setDuration(30);
          setPrice(0);
          setImage("");
          showToast(`✅ Servicio "${guess.name}" creado`, "success");
          setConfirmFor(guess);
          return;
        }
        showToast("No se pudo interpretar la respuesta del servidor.", "error");
        return;
      }

      setName("");
      setDuration(30);
      setPrice(0);
      setImage("");

      await load();
      showToast(`✅ Servicio "${s.name}" creado`, "success");
      setConfirmFor(s);
    } catch (e: any) {
      const msg = e?.response?.data?.error || "No se pudo crear el servicio";
      showToast(msg, "error");
    }
  };

  const toggleOpen = async (svc: Service) => {
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
        // Silent error
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="bg-accent/10 p-3 rounded-2xl">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">
              Gestión de Servicios
            </h1>
            <p className="text-muted mt-1">
              Administra servicios y subtipos del sistema
            </p>
          </div>
        </motion.div>

        {/* Create Service Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/90 p-6">
            <div className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-primary-foreground" />
              <h2 className="text-xl font-black text-primary-foreground">
                Crear Nuevo Servicio
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <label className="block">
                  <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Nombre del servicio
                  </span>
                  <input
                    className="mt-2 w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Consulta general"
                  />
                </label>
              </div>

              <div className="lg:col-span-2">
                <label className="block">
                  <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duración (min)
                  </span>
                  <input
                    type="number"
                    min={1}
                    className="mt-2 w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value || 0))}
                  />
                </label>
              </div>

              <div className="lg:col-span-2">
                <label className="block">
                  <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Precio
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="mt-2 w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value || 0))}
                  />
                </label>
              </div>

              <div className="lg:col-span-3">
                <label className="block">
                  <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Imagen (URL)
                  </span>
                  <input
                    className="mt-2 w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className="lg:col-span-1 flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={create}
                  disabled={!canCreate}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Crear
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Services List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-black text-foreground">
            Servicios Existentes
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-card rounded-2xl h-24 border border-border"
                ></div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl p-12 text-center border border-border"
            >
              <div className="bg-muted-foreground/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted" />
              </div>
              <p className="text-muted text-lg">No hay servicios creados aún</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((svc, index) => {
                  const open = !!svc._open;
                  const subtypes = svc._subtypes || [];

                  return (
                    <motion.div
                      key={svc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleOpen(svc)}
                              className="w-10 h-10 bg-accent/10 hover:bg-accent/20 rounded-xl flex items-center justify-center transition-colors"
                            >
                              {open ? (
                                <ChevronDown className="w-5 h-5 text-accent" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-accent" />
                              )}
                            </motion.button>

                            <div>
                              <h3 className="text-lg font-black text-foreground">
                                {svc.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-1">
                                <div className="flex items-center gap-1 text-sm text-card-foreground">
                                  <Clock className="w-4 h-4" />
                                  {svc.duration_min} min
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-card-foreground">
                                  <DollarSign className="w-4 h-4" />
                                  {money(svc.price)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditSubtypesOf(svc)}
                            className="flex items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-xl transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Subtipos
                            </span>
                          </motion.button>
                        </div>

                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-border"
                            >
                              {subtypes.length === 0 ? (
                                <p className="text-sm text-muted italic">
                                  Este servicio no tiene subtipos configurados
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {subtypes.map((st, idx) => (
                                    <motion.div
                                      key={`${st.id || "new"}-${idx}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="bg-background rounded-xl p-4 border border-border shadow-sm"
                                    >
                                      <h4 className="font-medium text-foreground">
                                        {st.name}
                                      </h4>
                                      <div className="flex items-center gap-3 mt-2 text-sm text-muted">
                                        <span>{st.duration_min} min</span>
                                        <span>•</span>
                                        <span>{money(st.price)}</span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Modals */}
        <AnimatePresence>
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
        </AnimatePresence>

        {/* Toast */}
        <Toast
          open={toast.open}
          message={toast.msg}
          type={toast.type}
          onClose={closeToast}
        />
      </div>
    </div>
  );
}

/** ====== Confirmation Modal ====== */
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 p-2 rounded-xl">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                Servicio Creado
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted-foreground/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <p className="text-card-foreground mb-6">
            <span className="font-medium">{service.name}</span> fue creado
            exitosamente.
            <br />
            ¿Deseas configurar subtipos ahora?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-xl hover:bg-muted-foreground/5 transition-colors"
            >
              Más tarde
            </button>
            <button
              onClick={onYes}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-colors"
            >
              Configurar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** ====== Subtypes Editor Modal ====== */
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
    const run = async () => {
      try {
        const r = await api.get(`/admin/services/${service.id}/subtypes`);
        const subs: ServiceSubtype[] = r.data?.data || [];
        if (subs.length) setRows(subs);
      } catch {
        // Silent error
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
      const payload = rows.map((r) => ({
        id: r.id && String(r.id).trim() ? String(r.id) : undefined,
        name: r.name.trim(),
        duration_min: Number(r.duration_min),
        price: Number(r.price),
      }));

      await api.post(`/admin/services/${service.id}/subtypes`, {
        subtypes: payload,
      });

      const rr = await api.get(`/admin/services/${service.id}/subtypes`);
      const fresh: ServiceSubtype[] = rr.data?.data || [];

      onSaved(fresh);
      setRows(fresh);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "No se pudieron guardar los subtipos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-primary/90 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-primary-foreground">
                Editor de Subtipos
              </h3>
              <p className="text-primary-foreground/80 mt-1">{service.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <AnimatePresence>
              {rows.map((r, idx) => (
                <motion.div
                  key={`${r.id || "new"}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end bg-background rounded-xl p-4 border border-border"
                >
                  <div className="lg:col-span-6">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">
                        Nombre del subtipo
                      </span>
                      <input
                        className="mt-1 w-full bg-input border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        value={r.name}
                        onChange={(e) =>
                          updateRow(idx, { name: e.target.value })
                        }
                        placeholder="Ej. Control / Seguimiento"
                      />
                    </label>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">
                        Duración (min)
                      </span>
                      <input
                        type="number"
                        min={1}
                        className="mt-1 w-full bg-input border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        value={r.duration_min}
                        onChange={(e) =>
                          updateRow(idx, {
                            duration_min: Number(e.target.value || 0),
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block">
                      <span className="text-sm font-medium text-foreground">
                        Precio
                      </span>
                      <input
                        type="number"
                        min={0}
                        className="mt-1 w-full bg-input border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        value={r.price}
                        onChange={(e) =>
                          updateRow(idx, { price: Number(e.target.value || 0) })
                        }
                      />
                    </label>
                  </div>

                  <div className="lg:col-span-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeRow(idx)}
                      className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive p-2 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addRow}
              className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-3 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir subtipo
            </motion.button>

            {err && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm bg-destructive/10 p-3 rounded-xl"
              >
                {err}
              </motion.p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted-foreground/5">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-xl hover:bg-muted-foreground/5 transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!canSave || saving}
              onClick={save}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
