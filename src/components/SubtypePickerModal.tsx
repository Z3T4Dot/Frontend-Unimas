"use client";

import { Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, Clock, DollarSign, Sparkles } from "lucide-react";

export type ServiceSubtype = {
  id: string;
  name: string;
  duration_min: number;
  price: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  subtypes: ServiceSubtype[];
  onPick: (sub: ServiceSubtype) => void;
};

export default function SubtypePickerModal({
  open,
  onClose,
  serviceName,
  subtypes,
  onPick,
}: Props) {
  if (!open) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 260 },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 12,
      transition: { type: "spring", damping: 26, stiffness: 260 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.04,
        duration: 0.24,
        ease: [0.16, 1, 0.3, 1], // ← no string suelto
      },
    }),
  };

  const Modal = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        />

        <motion.div
          className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header with gradient accent */}
          <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    Elige tu subtipo
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {serviceName}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {subtypes.map((st, index) => (
                <motion.button
                  key={st.id}
                  onClick={() => {
                    onPick(st);
                    onClose();
                  }}
                  className="w-full text-left rounded-xl border border-border bg-card hover:bg-card/80 p-4 transition-all duration-200 group hover:shadow-lg hover:border-primary/30"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                      {st.name}
                    </h4>
                    <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                      <DollarSign className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-primary">
                        {Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(st.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {st.duration_min} minutos
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer with subtle gradient */}
          <div className="bg-gradient-to-t from-muted/20 to-transparent p-4">
            <p className="text-xs text-center text-muted-foreground">
              Selecciona el subtipo que mejor se adapte a tus necesidades
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(<Fragment>{Modal}</Fragment>, document.body);
}
