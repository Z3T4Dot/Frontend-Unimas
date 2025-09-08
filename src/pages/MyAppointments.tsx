"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  History,
  CalendarDays,
} from "lucide-react";
import api from "../lib/api";
import RescheduleDialog, {
  type ApptLite,
} from "../components/RescheduleDialog";

const statusConfig = {
  scheduled: {
    label: "Programada",
    icon: CheckCircle,
    color: "bg-primary text-primary-foreground",
  },
  completed: {
    label: "Completada",
    icon: CheckCircle,
    color: "bg-accent text-accent-foreground",
  },
  cancelled: {
    label: "Cancelada",
    icon: X,
    color: "bg-destructive text-destructive-foreground",
  },
  rescheduled: {
    label: "Reagendada",
    icon: RefreshCw,
    color: "bg-secondary text-secondary-foreground",
  },
};

export default function PremiumMyAppointments() {
  const [upcoming, setUpcoming] = useState<ApptLite[]>([]);
  const [history, setHistory] = useState<ApptLite[]>([]);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ApptLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setMsg("");
    setLoading(true);
    try {
      const [u, h] = await Promise.all([
        api.get("/calendar/appointments?range=upcoming&status=scheduled"),
        api.get("/calendar/appointments?range=past&status=all"),
      ]);
      setUpcoming(u.data.data || []);
      setHistory(h.data.data || []);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || "No se pudo cargar tus citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id: string) => {
    setMsg("");
    setActionLoading(id);
    try {
      const r = await api.patch(`/calendar/appointments/${id}/cancel`, {});
      if (r.data?.suspended_until) {
        alert(
          `Has sido suspendido hasta: ${new Date(
            r.data.suspended_until
          ).toLocaleString()}`
        );
      }
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const onOpenReschedule = (appt: ApptLite) => {
    setCurrent(appt);
    setOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const AppointmentCard = ({
    appointment,
    showActions = false,
  }: {
    appointment: ApptLite;
    showActions?: boolean;
  }) => {
    const { date, time } = formatDate(appointment.starts_at);
    const status =
      statusConfig[appointment.status as keyof typeof statusConfig] ||
      statusConfig.scheduled;
    const StatusIcon = status.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-card-foreground">
                  {appointment.specialist?.display_name ?? "Especialista"}
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm capitalize">{date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{time}</span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <h4 className="font-medium text-card-foreground mb-1">
                {appointment.service?.name ?? "Servicio"}
              </h4>
              {appointment.service?.duration && (
                <p className="text-sm text-muted-foreground">
                  Duración: {appointment.service.duration} minutos
                </p>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex flex-col gap-2 ml-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={() => onOpenReschedule(appointment)}
                disabled={actionLoading === appointment.id}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    actionLoading === appointment.id ? "animate-spin" : ""
                  }`}
                />
                Re-agendar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                onClick={() => onCancel(appointment.id)}
                disabled={actionLoading === appointment.id}
              >
                <X
                  className={`h-4 w-4 ${
                    actionLoading === appointment.id ? "animate-spin" : ""
                  }`}
                />
                Cancelar
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const EmptyState = ({ type }: { type: "upcoming" | "history" }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {type === "upcoming" ? (
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
        ) : (
          <History className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === "upcoming"
          ? "No tienes citas próximas"
          : "Aún no hay historial"}
      </h3>
      <p className="text-muted-foreground">
        {type === "upcoming"
          ? "Agenda tu primera cita para comenzar"
          : "Tus citas pasadas aparecerán aquí"}
      </p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-foreground"
      >
        Mis Citas
      </motion.h1>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Próximas Citas
          </h2>
          {upcoming.length > 0 && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-medium">
              {upcoming.length}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {upcoming.length === 0 ? (
            <EmptyState type="upcoming" />
          ) : (
            <motion.div className="space-y-4">
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  showActions={true}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Historial</h2>
          {history.length > 0 && (
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm font-medium">
              {history.length}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {history.length === 0 ? (
            <EmptyState type="history" />
          ) : (
            <motion.div className="space-y-4">
              {history.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <RescheduleDialog
        open={open}
        appt={current}
        onClose={() => setOpen(false)}
        onRescheduled={load}
      />
    </motion.div>
  );
}
