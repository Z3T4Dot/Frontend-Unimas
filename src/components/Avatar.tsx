"use client"

import { motion } from "framer-motion"
import { User } from "lucide-react"
import { initialsFrom, cn } from "../utils/ui"

type Props = {
  name?: string | null
  email?: string | null
  src?: string | null
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function Avatar({ name, email, src, className, size = "md" }: Props) {
  const initials = initialsFrom(name, email)

  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-xl",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      {src ? (
        <motion.img
          src={src}
          alt={name || email || "Especialista"}
          className={cn("rounded-2xl object-cover border-2 border-border shadow-lg", sizeClasses[size], className)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
            const sib = e.currentTarget.nextElementSibling as HTMLElement
            if (sib) sib.style.display = "grid"
          }}
        />
      ) : (
        <motion.div
          className={cn(
            "rounded-2xl grid place-items-center bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold shadow-lg border-2 border-primary/20",
            sizeClasses[size],
            className,
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {initials || <User className="w-1/2 h-1/2" />}
        </motion.div>
      )}

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/20 -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}
