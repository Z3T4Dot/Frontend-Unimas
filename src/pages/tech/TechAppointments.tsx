"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, CheckCircle, XCircle, Filter, User, Briefcase } from "lucide-react"
import api from "../../lib/api"

type Item = {
  id: string
  status: string
  starts_at: string
  confirmed_at?: string | null
  service?: { id: string; name: string }
  client?: { id: string; display_name: string }
}

export default function TechAppointments() {
  const [items, setItems] = useState<Item[]>([])
  const [range, setRange] = useState<"today" | "next" | "day">("today")
  const [date, setDate] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const qs = new URLSearchParams(
      range === "day" && date
        ? { range: "day", date }
        : range === "today"
          ? { range: "today" }
          : { range: "next", days: "7" },
    ).toString()

    api
      .get(`/tech/appointments?${qs}`)
      .then((r) => {
        setItems(r.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [range, date])

  const confirm = async (id: string) => {
    await api.patch(`/tech/appointments/${id}/confirm`, {})
    load()
  }

  const cancel = async (id: string) => {
    await api.patch(`/tech/appointments/${id}/cancel`, {})
    load()
  }

  const getStatusColor = (status: string, confirmed_at?: string | null) => {
    if (confirmed_at) return "text-emerald-600 bg-emerald-50"
    if (status === "cancelled") return "text-red-600 bg-red-50"
    return "text-amber-600 bg-amber-50"
  }

  const getStatusText = (status: string, confirmed_at?: string | null) => {
    if (confirmed_at) return "Confirmada"
    if (status === "cancelled") return "Cancelada"
    return "Pendiente"
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-card-foreground">Citas</h1>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-end"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
        </div>

        <div className="flex gap-2">
          {[
            { key: "today", label: "Hoy" },
            { key: "next", label: "Próximos 7 días" },
            { key: "day", label: "Por día" },
          ].map((option) => (
            <motion.button
              key={option.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                range === option.key
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-background hover:bg-muted border-border"
              }`}
              onClick={() => setRange(option.key as any)}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {range === "day" && (
            <motion.input
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              type="date"
              className="p-2 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Appointments List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-6 shadow-md border border-border"
                >
                  <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-muted rounded"></div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-muted rounded-xl p-8 text-center"
            >
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Sin citas en el rango seleccionado</p>
            </motion.div>
          ) : (
            items.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-card rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-card-foreground">
                            {appointment.service?.name ?? "Servicio"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{appointment.client?.display_name ?? "Cliente"}</span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status, appointment.confirmed_at)}`}
                      >
                        {getStatusText(appointment.status, appointment.confirmed_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(appointment.starts_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2"
                      onClick={() => confirm(appointment.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2"
                      onClick={() => cancel(appointment.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
