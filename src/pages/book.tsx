"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, User, CheckCircle, ArrowRight, ArrowLeft, Sparkles, CreditCard } from "lucide-react"
import api from "../lib/api"
import { getUser } from "../lib/auth"
import ServicesCarousel, { type Service } from "./../components/ServicesCarousel"
import { cn } from "../utils/ui"
import type { Specialist } from "../types/components.types"
import SubtypePickerModal, { type ServiceSubtype } from "./../components/SubtypePickerModal"
import SpecialistsCarousel from "../components/SpecialistsCarousel"

const steps = [
  { id: 1, name: "Especialista", icon: User, description: "Selecciona tu especialista preferido" },
  { id: 2, name: "Servicio", icon: Sparkles, description: "Elige el servicio que necesitas" },
  { id: 3, name: "Fecha y Hora", icon: Calendar, description: "Programa tu cita" },
  { id: 4, name: "Confirmación", icon: CheckCircle, description: "Confirma los detalles" },
]

export default function PremiumBooking() {
  const me = getUser()
  const [msg, setMsg] = useState<string>("")
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Estado
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [specialistId, setSpecialistId] = useState("")

  const [services, setServices] = useState<(Service & { subtypes?: ServiceSubtype[] })[]>([])
  const [serviceId, setServiceId] = useState("")

  const [pickedSubtype, setPickedSubtype] = useState<ServiceSubtype | null>(null)
  const [showSubtypeModal, setShowSubtypeModal] = useState(false)

  const [date, setDate] = useState<string>("")
  const [slots, setSlots] = useState<string[]>([])
  const [slot, setSlot] = useState<string>("")

  // 1) Cargar especialistas al montar
  useEffect(() => {
    setIsLoading(true)
    api
      .get("/calendar/specialists")
      .then((r) => setSpecialists(r.data.data || []))
      .catch(() => setSpecialists([]))
      .finally(() => setIsLoading(false))
  }, [])

  // 2) Al elegir especialista, cargar servicios que atiende
  useEffect(() => {
    setServiceId("")
    setPickedSubtype(null)
    setServices([])
    setSlots([])
    setSlot("")
    if (!specialistId) return

    setIsLoading(true)
    const q = new URLSearchParams({ specialistId }).toString()
    api
      .get(`/calendar/services/by-specialist?${q}`)
      .then((r) => setServices(r.data.data || []))
      .catch(() => setServices([]))
      .finally(() => setIsLoading(false))
  }, [specialistId])

  // 3) Elegir servicio -> si tiene subtipos, abrir modal
  const onSelectService = (id: string) => {
    setServiceId(id)
    setPickedSubtype(null)
    setSlots([])
    setSlot("")
    const svc = services.find((s) => s.id === id)
    if (svc && svc.subtypes && svc.subtypes.length > 0) {
      setShowSubtypeModal(true)
    }
  }

  // 4) Disponibilidad según duración efectiva (subtipo > servicio)
  useEffect(() => {
    setSlots([])
    setSlot("")

    if (!date || !specialistId || !serviceId) return
    const svc = services.find((s) => s.id === serviceId)
    const duration_min = pickedSubtype?.duration_min || svc?.duration_min || 0
    if (!duration_min) return

    setIsLoading(true)
    const q = new URLSearchParams({
      date,
      specialistId,
      duration_min: String(duration_min),
    }).toString()

    api
      .get(`/calendar/availability?${q}`)
      .then((r) => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setIsLoading(false))
  }, [date, specialistId, serviceId, pickedSubtype, services])

  // 5) Crear cita
  const canCreate = useMemo(
    () => !!(serviceId && specialistId && date && slot && me?.id),
    [serviceId, specialistId, date, slot, me?.id],
  )

  const create = async () => {
    setMsg("")
    setIsLoading(true)
    if (!me?.id) {
      setMsg("Debes iniciar sesión.")
      setIsLoading(false)
      return
    }

    const starts_at = `${date}T${slot}:00.000Z`

    try {
      const payload: any = {
        client_id: me.id,
        specialist_id: specialistId,
        service_id: serviceId,
        starts_at,
      }
      if (pickedSubtype?.id) payload.subtype_id = pickedSubtype.id

      const r = await api.post("/calendar/appointments", payload)
      setMsg(`✅ Cita creada exitosamente: ${r.data.data.id}`)
      setCurrentStep(4)
    } catch (e: any) {
      setMsg(`❌ Error: ${e?.response?.data?.error || e.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helpers de UI
  const selectedSpecialist = specialists.find((s) => s.id === specialistId)
  const selectedService = services.find((s) => s.id === serviceId)
  const priceToShow = pickedSubtype?.price ?? (selectedService ? selectedService.price : undefined)
  const durationToShow = pickedSubtype?.duration_min ?? (selectedService ? selectedService.duration_min : undefined)

  // Navigation helpers
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!specialistId
      case 2:
        return !!serviceId
      case 3:
        return !!date && !!slot
      default:
        return false
    }
  }

  const nextStep = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reserva tu Cita</h1>
          <p className="text-muted-foreground">Programa tu cita de manera fácil y rápida</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <motion.div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isActive
                          ? "bg-primary border-primary text-primary-foreground shadow-lg"
                          : isCompleted
                            ? "bg-accent border-accent text-accent-foreground"
                            : "bg-card border-border text-muted-foreground",
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : isCompleted ? "text-accent" : "text-muted-foreground",
                        )}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-border -z-0">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-sm border"
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Selecciona tu Especialista</h2>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <SpecialistsCarousel items={specialists} selectedId={specialistId} onSelect={setSpecialistId} />
                )}

                {selectedSpecialist && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/10 rounded-xl p-4 border border-accent/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{selectedSpecialist.name}</h3>
                        <p className="text-sm text-muted-foreground">Especialista seleccionado</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Elige tu Servicio</h2>
                </div>

                {!specialistId ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Primero selecciona un especialista</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Este especialista aún no tiene servicios asignados</p>
                  </div>
                ) : (
                  <ServicesCarousel items={services} selectedId={serviceId} onSelect={onSelectService} />
                )}

                {selectedService && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 rounded-xl p-4 border border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{selectedService.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {durationToShow && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {durationToShow} min
                              </span>
                            )}
                            {priceToShow !== undefined && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                {Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0,
                                }).format(Number(priceToShow))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {pickedSubtype && (
                        <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-sm font-medium">
                          {pickedSubtype.name}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Selecciona Fecha y Hora</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3">
                      <span className="text-sm font-medium text-foreground mb-2 block">Fecha</span>
                      <input
                        className="w-full border border-border rounded-xl p-3 bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={!serviceId || !specialistId}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </label>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-foreground mb-3">Horarios Disponibles</div>
                    {!serviceId || !specialistId || !date ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Selecciona una fecha para ver horarios</p>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay horarios disponibles</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {slots.map((h) => (
                          <motion.button
                            key={h}
                            onClick={() => setSlot(h)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                              slot === h
                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                : "bg-card text-card-foreground border-border hover:bg-accent/10 hover:border-accent/30",
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {h}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {date && slot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/10 rounded-xl p-4 border border-accent/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Cita Programada</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          a las {slot}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <h2 className="text-2xl font-semibold text-foreground">¡Cita Confirmada!</h2>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-accent/10 rounded-2xl p-6 border border-accent/20 max-w-md mx-auto"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Especialista:</span>
                      <span className="font-medium text-foreground">{selectedSpecialist?.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Servicio:</span>
                      <span className="font-medium text-foreground">{selectedService?.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Fecha:</span>
                      <span className="font-medium text-foreground">
                        {date && new Date(date).toLocaleDateString("es-ES")} - {slot}
                      </span>
                    </div>

                    {priceToShow !== undefined && (
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-accent" />
                        <span className="text-sm text-muted-foreground">Precio:</span>
                        <span className="font-medium text-foreground">
                          {Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(Number(priceToShow))}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {msg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {msg}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-8"
          >
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                currentStep === 1
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground hover:bg-card border border-border",
              )}
              whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </motion.button>

            {currentStep === 3 ? (
              <motion.button
                onClick={create}
                disabled={!canCreate || isLoading}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all",
                  canCreate && !isLoading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                whileHover={canCreate && !isLoading ? { scale: 1.02 } : {}}
                whileTap={canCreate && !isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isLoading ? "Creando..." : "Confirmar Cita"}
              </motion.button>
            ) : (
              <motion.button
                onClick={nextStep}
                disabled={!canGoNext()}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                  canGoNext()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                whileHover={canGoNext() ? { scale: 1.02 } : {}}
                whileTap={canGoNext() ? { scale: 0.98 } : {}}
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {msg && currentStep !== 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {msg}
          </motion.div>
        )}
      </div>

      {/* Modal de subtipos */}
      <SubtypePickerModal
        open={showSubtypeModal}
        onClose={() => setShowSubtypeModal(false)}
        serviceName={selectedService?.name || ""}
        subtypes={selectedService?.subtypes || []}
        onPick={(st) => setPickedSubtype(st)}
      />
    </div>
  )
}
