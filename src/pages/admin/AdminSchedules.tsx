"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit3,
  TrendingUp,
} from "lucide-react";
import api from "../../lib/api";
import WeeklyHoursEditor from "../../components/WeeklyHoursEditor";

type Slot = { start: string; end: string };

type SchedItem = {
  specialist: { id: string; name: string; role: string };
  hours: Slot[];
  appointments: Array<{
    id: string;
    service_id: string;
    service_name: string | null;
    client_id: string;
    starts_at: string;
    ends_at: string;
    price: number | null;
    status: string;
  }>;
  total_amount: number;
};

function fmtTime(t: string) {
  if (t.includes("T"))
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

function todayYMD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function calcEffectiveTotal(apps: SchedItem["appointments"]) {
  return apps.reduce((acc, a) => {
    if (a.status !== "canceled" && a.price != null) {
      acc += Number(a.price);
    }
    return acc;
  }, 0);
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "canceled":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "scheduled":
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "canceled":
      return "bg-red-50 text-red-700 border-red-200";
    case "scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
}

export default function PremiumAdminSchedules() {
  const [date, setDate] = useState(todayYMD());
  const [items, setItems] = useState<SchedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await api.get("/admin/schedules", { params: { date } });
      setItems(r.data?.data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Error cargando horarios");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const totalRevenue = items.reduce(
    (sum, item) => sum + calcEffectiveTotal(item.appointments),
    0
  );
  const totalAppointments = items.reduce(
    (sum, item) =>
      sum + item.appointments.filter((a) => a.status !== "canceled").length,
    0
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 p-3 rounded-2xl">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">
                Horarios y Citas
              </h1>
              <p className="text-muted mt-1">
                Gestión de horarios y seguimiento de citas por técnico
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-2xl p-4 shadow-lg border border-border"
          >
            <label className="block">
              <span className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de consulta
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 bg-input border border-border rounded-xl px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </label>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Ingresos del Día
                </p>
                <p className="text-2xl font-black text-foreground">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Citas Activas</p>
                <p className="text-2xl font-black text-foreground">
                  {totalAppointments}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Técnicos</p>
                <p className="text-2xl font-black text-foreground">
                  {items.length}
                </p>
              </div>
              <div className="bg-chart-1/10 p-3 rounded-xl">
                <User className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Promedio por Cita
                </p>
                <p className="text-2xl font-black text-foreground">
                  $
                  {totalAppointments > 0
                    ? Math.round(
                        totalRevenue / totalAppointments
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
              <div className="bg-chart-2/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-card rounded-2xl h-32 border border-border"
              ></div>
            ))}
          </div>
        )}

        {err && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center"
          >
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">{err}</p>
          </motion.div>
        )}

        {/* Empty State */}
        {(!items || items.length === 0) && !loading && !err && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-12 text-center border border-border"
          >
            <div className="bg-muted-foreground/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted text-lg">
              No hay citas programadas para esta fecha
            </p>
          </motion.div>
        )}

        {/* Schedules List */}
        <div className="space-y-6">
          <AnimatePresence>
            {items.map((item, index) => {
              const effectiveTotal = calcEffectiveTotal(item.appointments);

              return (
                <motion.div
                  key={item.specialist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-border">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 p-3 rounded-xl">
                          <User className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-foreground">
                              {item.specialist.name}
                            </h3>
                            <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full border border-secondary/20">
                              {item.specialist.role}
                            </span>
                          </div>
                          <p className="text-sm text-card-foreground mt-1 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Total del día:{" "}
                            <span className="font-medium">
                              ${effectiveTotal.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-sm text-card-foreground">
                          {item.hours.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-accent" />
                              <span>
                                {item.hours
                                  .map(
                                    (h) =>
                                      `${fmtTime(h.start)}–${fmtTime(h.end)}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted">
                              <AlertCircle className="w-4 h-4" />
                              <span className="italic">
                                Sin horario configurado
                              </span>
                            </div>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setEditing({
                              id: item.specialist.id,
                              name: item.specialist.name,
                            })
                          }
                          className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Editar Horario
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {item.appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-muted-foreground/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-6 h-6 text-muted" />
                        </div>
                        <p className="text-muted">
                          No tiene citas programadas para este día
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-card-foreground mb-4">
                          Citas del día ({item.appointments.length})
                        </h4>
                        <div className="grid gap-3">
                          {item.appointments.map((appointment, appIndex) => {
                            const isCanceled =
                              appointment.status === "canceled";

                            return (
                              <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: appIndex * 0.05 }}
                                className={`bg-background rounded-xl p-4 border transition-all hover:shadow-md ${
                                  isCanceled ? "opacity-60" : ""
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-medium text-foreground">
                                        {appointment.service_name || "Servicio"}
                                      </h5>
                                      <div
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                          appointment.status
                                        )}`}
                                      >
                                        {getStatusIcon(appointment.status)}
                                        {appointment.status}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-card-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {fmtTime(appointment.starts_at)}–
                                        {fmtTime(appointment.ends_at)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        Cliente:{" "}
                                        {appointment.client_id.slice(0, 8)}...
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    {appointment.price == null ? (
                                      <span className="text-muted">-</span>
                                    ) : isCanceled ? (
                                      <div className="text-sm">
                                        <span className="text-destructive font-medium">
                                          Cancelado
                                        </span>
                                        <div className="text-xs text-muted">
                                          $
                                          {Number(
                                            appointment.price
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-lg font-black text-foreground">
                                        $
                                        {Number(
                                          appointment.price
                                        ).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Weekly Hours Editor Modal */}
        <AnimatePresence>
          {editing && (
            <WeeklyHoursEditor
              techId={editing.id}
              techName={editing.name}
              onClose={() => setEditing(null)}
              onSaved={() => {
                load();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
