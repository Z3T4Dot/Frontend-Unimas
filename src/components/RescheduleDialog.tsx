"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, X, CheckCircle, AlertCircle } from "lucide-react"
import api from "../lib/api"
import { cn } from "../utils/ui"

type SpecialistLite = { id: string; display_name: string }
type ServiceLite = { id: string; name: string; image_url?: string }

export type ApptLite = {
  id: string
  starts_at: string
  duration_min: number
  specialist: SpecialistLite | null
  service: ServiceLite | null
}

type Props = {
  open: boolean
  appt: ApptLite | null
  onClose: () => void
  onRescheduled: () => void
}

function yyyyMmDd(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10)
}

export default function RescheduleDialog({ open, appt, onClose, onRescheduled }: Props) {
  const initDate = useMemo(() => {
    if (!appt) return ""
    return yyyyMmDd(new Date(appt.starts_at))
  }, [appt])

  const [date, setDate] = useState<string>(initDate)
  const [slots, setSlots] = useState<string[]>([])
  const [slot, setSlot] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    if (!open) return
    setMsg("")
    setSlot("")
    setSlots([])
    setDate(initDate)
  }, [open, initDate])

  useEffect(() => {
    const run = async () => {
      setSlots([])
      setSlot("")
      if (!open || !appt || !date || !appt.specialist?.id) return

      const params = new URLSearchParams({
        date,
        specialistId: appt.specialist.id,
        duration_min: String(appt.duration_min || 0),
      }).toString()

      try {
        const r = await api.get(`/calendar/availability?${params}`)
        setSlots(r.data?.slots || [])
      } catch (e: any) {
        setSlots([])
        setMsg(e?.response?.data?.error || "No se pudo cargar la disponibilidad")
      }
    }
    run()
  }, [open, appt, date])

  const canSave = !!(date && slot)
  const save = async () => {
    if (!appt) return
    setLoading(true)
    setMsg("")
    try {
      const starts_at = `${date}T${slot}:00.000Z`
      await api.patch(`/calendar/appointments/${appt.id}/reschedule`, {
        starts_at,
      })
      setLoading(false)
      onRescheduled()
      onClose()
    } catch (e: any) {
      setLoading(false)
      setMsg(e?.response?.data?.error || e.message)
    }
  }

  return (
    <AnimatePresence>
      {open && appt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <h2 className="text-xl font-bold font-sans">Re-agendar Cita</h2>
                  </div>
                  <p className="text-primary-foreground/80 font-medium">
                    {appt.service?.name} · {appt.specialist?.display_name}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Calendar className="w-4 h-4" />
                    Nueva Fecha
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="date"
                    className="w-full p-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Clock className="w-4 h-4" />
                    Horarios Disponibles
                  </label>

                  {slots.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Selecciona una fecha para ver horarios disponibles
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {slots.map((h) => (
                        <motion.button
                          key={h}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSlot(h)}
                          className={cn(
                            "p-3 rounded-xl border text-sm font-medium transition-all",
                            slot === h
                              ? "bg-primary text-primary-foreground border-primary shadow-lg"
                              : "bg-background hover:bg-muted border-border",
                          )}
                        >
                          {h}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">{msg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 bg-muted/30 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors font-medium"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: canSave && !loading ? 1.02 : 1 }}
                whileTap={{ scale: canSave && !loading ? 0.98 : 1 }}
                disabled={!canSave || loading}
                onClick={save}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
