"use client"

import type React from "react"

import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, BookOpen, User, Settings, LogOut, Shield, Wrench } from "lucide-react"
import { clearAuth, getUser, homeByRole, onAuthChange } from "../lib/auth"

// Icon mapping for navigation items
const iconMap = {
  Citas: Calendar,
  Clientes: Users,
  Agendar: BookOpen,
  "Mis citas": User,
  Admin: Settings,
  Ingresar: LogOut,
}

function PremiumNavLink({
  to,
  label,
  end,
  icon: Icon,
}: {
  to: string
  label: string
  end?: boolean
  icon?: React.ComponentType<any>
}) {
  return (
    <NavLink
      to={to}
      end={end === false ? false : undefined}
      className={({ isActive }) => `
        group relative flex items-center gap-2 px-4 py-2.5 rounded-xl
        font-medium text-sm transition-all duration-300 ease-out
        ${
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                rotate: isActive ? 5 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={16} />
            </motion.div>
          )}
          <span className="relative">
            {label}
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-foreground rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </span>
        </>
      )}
    </NavLink>
  )
}

function RoleBadge({ role }: { role: string }) {
  const badgeColors = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    tecnico: "bg-accent/10 text-accent border-accent/20",
    cliente: "bg-secondary/10 text-secondary border-secondary/20",
  }

  const roleIcons = {
    admin: Shield,
    tecnico: Wrench,
    cliente: User,
  }

  const Icon = roleIcons[role as keyof typeof roleIcons] || User
  const colorClass = badgeColors[role as keyof typeof badgeColors] || badgeColors.cliente

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
        ${colorClass}
      `}
    >
      <Icon size={12} />
      <span className="capitalize">{role}</span>
    </motion.div>
  )
}

export default function PremiumNavbar() {
  const nav = useNavigate()
  const loc = useLocation()
  const [me, setMe] = useState(getUser())
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const off = onAuthChange(setMe)
    return off
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const role = (me?.role || "").toLowerCase().trim()
  const isAdmin = role === "admin"
  const isTech = role === "tecnico" || isAdmin

  const techLinks = useMemo(
    () => [
      { to: "/tech/appointments", label: "Citas", icon: iconMap["Citas"] },
      { to: "/tech/clients", label: "Clientes", end: false as const, icon: iconMap["Clientes"] },
    ],
    [],
  )

  const clientLinks = useMemo(
    () => [
      { to: "/book", label: "Agendar", icon: iconMap["Agendar"] },
      { to: "/me", label: "Mis citas", icon: iconMap["Mis citas"] },
    ],
    [],
  )

  const links = useMemo(() => {
    if (!me) return [{ to: "/login", label: "Ingresar", icon: iconMap["Ingresar"] }]

    if (isAdmin) {
      const all = [...techLinks, { to: "/admin", label: "Admin", icon: iconMap["Admin"] }]
      const seen = new Set<string>()
      return all.filter((l) => (seen.has(l.to) ? false : (seen.add(l.to), true)))
    }

    if (isTech) return techLinks
    return clientLinks
  }, [me, isAdmin, isTech, techLinks, clientLinks])

  if (loc.pathname.startsWith("/login")) return null

  const logout = () => {
    clearAuth()
    nav("/login", { replace: true })
  }

  const goHome = () => {
    nav(homeByRole(role), { replace: true })
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl
        transition-all duration-300 ease-out
        ${isScrolled ? "shadow-lg shadow-black/5" : ""}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo Section */}
        <motion.button
          onClick={goHome}
          className="flex items-center gap-3 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Inicio"
        >
          <motion.div
            className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center shadow-lg"
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="font-bold text-lg">U</span>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.span
              className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300"
              whileHover={{ x: 2 }}
            >
              Unimas
            </motion.span>

            <AnimatePresence>{me?.role && <RoleBadge role={role} />}</AnimatePresence>
          </div>
        </motion.button>

        {/* Navigation Section */}
        <nav className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1 p-1 rounded-2xl bg-muted/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {links.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumNavLink to={link.to} label={link.label} end={link.end} icon={link.icon} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Logout Button */}
          <AnimatePresence>
            {me && (
              <motion.button
                onClick={logout}
                className="
                  flex items-center gap-2 px-4 py-2.5 rounded-xl
                  text-sm font-medium text-muted-foreground
                  hover:text-destructive hover:bg-destructive/5
                  transition-all duration-300 ease-out
                  border border-transparent hover:border-destructive/20
                "
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: 0.2 }}
              >
                <LogOut size={16} />
                <span>Salir</span>
              </motion.button>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  )
}
