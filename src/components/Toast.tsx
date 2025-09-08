import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number; // ms
};

export default function Toast({
  open,
  message,
  type = "info",
  onClose,
  duration = 2500,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  const color =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-zinc-900";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed inset-x-0 bottom-6 z-[1000] flex justify-center px-4"
        >
          <div className={`${color} text-white rounded-xl shadow-lg px-4 py-2`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
