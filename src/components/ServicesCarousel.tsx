"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Clock, DollarSign, Sparkles } from "lucide-react"
import { cn } from "../utils/ui"

export type Service = {
  id: string
  name: string
  duration_min: number
  price: number
  active: boolean
  image_url?: string
  subtypes?: {
    id: string
    name: string
    duration_min: number
    price: number
  }[]
}

type Props = {
  items: Service[]
  selectedId?: string
  onSelect: (id: string) => void
  className?: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ""
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase()
}

export default function ServicesCarousel({ items, selectedId, onSelect, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const element = ref.current
    if (element) {
      element.addEventListener("scroll", checkScrollButtons)
      return () => element.removeEventListener("scroll", checkScrollButtons)
    }
  }, [items])

  const scrollBy = (dx: number) => {
    ref.current?.scrollBy({ left: dx, behavior: "smooth" })
    setTimeout(checkScrollButtons, 300)
  }

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Servicios</h3>
        </motion.div>

        {items.length > 0 && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              className={cn(
                "p-3 rounded-xl border-2 transition-all duration-200",
                canScrollLeft
                  ? "bg-card hover:bg-primary hover:text-primary-foreground border-border hover:border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed",
              )}
              onClick={() => scrollBy(-320)}
              disabled={!canScrollLeft}
              whileHover={canScrollLeft ? { scale: 1.05 } : {}}
              whileTap={canScrollLeft ? { scale: 0.95 } : {}}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              className={cn(
                "p-3 rounded-xl border-2 transition-all duration-200",
                canScrollRight
                  ? "bg-card hover:bg-primary hover:text-primary-foreground border-border hover:border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-border cursor-not-allowed",
              )}
              onClick={() => scrollBy(+320)}
              disabled={!canScrollRight}
              whileHover={canScrollRight ? { scale: 1.05 } : {}}
              whileTap={canScrollRight ? { scale: 0.95 } : {}}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No hay servicios disponibles todavía. Pídele al administrador que cree al menos uno (por ejemplo "Consulta
              general" o "Control").
            </p>
          </motion.div>
        ) : (
          <div
            ref={ref}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((service, index) => {
              const active = service.id === selectedId
              return (
                <motion.button
                  key={service.id}
                  onClick={() => onSelect(service.id)}
                  className={cn(
                    "min-w-[280px] snap-start text-left rounded-2xl border-2 p-6 bg-card transition-all duration-300 group relative overflow-hidden",
                    active
                      ? "ring-4 ring-primary/20 border-primary shadow-xl shadow-primary/10"
                      : "border-border hover:border-primary/50 hover:shadow-lg",
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background gradient effect */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-300",
                      active && "opacity-100",
                    )}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      {service.image_url ? (
                        <motion.img
                          src={service.image_url}
                          alt={service.name}
                          className="h-12 w-12 rounded-xl object-cover border-2 border-border shadow-sm"
                          loading="lazy"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        />
                      ) : (
                        <motion.div
                          className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-primary/20 grid place-items-center font-bold text-primary-foreground shadow-sm"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          {initials(service.name)}
                        </motion.div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-card-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration_min} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-lg font-bold text-primary">
                        <DollarSign className="w-5 h-5" />
                        <span>
                          {Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(Number(service.price))}
                        </span>
                      </div>

                      {active && (
                        <motion.div
                          className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          Seleccionado
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
