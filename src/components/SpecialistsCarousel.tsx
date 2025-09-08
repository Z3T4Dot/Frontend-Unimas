"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Users, Mail, Star } from "lucide-react"
import Avatar from "./Avatar"
import { cn } from "../utils/ui"

export type Specialist = {
  id: string
  display_name?: string | null
  email?: string | null
  avatar_url?: string | null
}

type Props = {
  items: Specialist[]
  selectedId?: string
  onSelect: (id: string) => void
  className?: string
}

export default function SpecialistsCarousel({ items, selectedId, onSelect, className }: Props) {
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
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-2 rounded-xl bg-secondary/10">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Especialistas</h3>
        </motion.div>

        {items.length > 0 && (
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className={cn(
                "p-3 rounded-xl border-2 transition-all duration-200",
                canScrollLeft
                  ? "bg-card hover:bg-secondary hover:text-secondary-foreground border-border hover:border-secondary shadow-sm"
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
                  ? "bg-card hover:bg-secondary hover:text-secondary-foreground border-border hover:border-secondary shadow-sm"
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
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Aún no hay especialistas disponibles. Cuando el administrador los registre, aparecerán aquí con su foto o
              sus iniciales.
            </p>
          </motion.div>
        ) : (
          <div
            ref={ref}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((specialist, index) => {
              const active = specialist.id === selectedId
              return (
                <motion.button
                  key={specialist.id}
                  onClick={() => onSelect(specialist.id)}
                  className={cn(
                    "snap-start min-w-[260px] rounded-2xl border-2 bg-card p-6 text-left transition-all duration-300 group relative overflow-hidden",
                    active
                      ? "ring-4 ring-secondary/20 border-secondary shadow-xl shadow-secondary/10"
                      : "border-border hover:border-secondary/50 hover:shadow-lg",
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
                      "absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 transition-opacity duration-300",
                      active && "opacity-100",
                    )}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar
                        name={specialist.display_name || undefined}
                        email={specialist.email || undefined}
                        src={specialist.avatar_url ?? undefined}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-card-foreground group-hover:text-secondary transition-colors truncate">
                          {specialist.display_name || specialist.email || "Especialista"}
                        </h4>
                        {specialist.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{specialist.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>Especialista verificado</span>
                      </div>

                      {active && (
                        <motion.div
                          className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
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
