"use client";

import type React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  BookOpen,
  User,
  Settings,
  LogOut,
  Shield,
  Wrench,
  Menu,
  X,
  Mail,
  type LucideProps,
} from "lucide-react";
import { clearAuth, getUser, homeByRole, onAuthChange } from "../lib/auth";

type IconType = React.ComponentType<
  Partial<LucideProps> & { className?: string }
>;
type LinkItem = { to: string; label: string; icon?: IconType; end?: boolean };

const iconMap: Record<string, IconType> = {
  Citas: Calendar,
  Clientes: Users,
  Agendar: BookOpen,
  "Mis citas": User,
  Admin: Settings,
  Ingresar: LogOut,
};

function PremiumNavLink({
  to,
  label,
  end,
  icon: Icon,
  onClick,
}: {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end === false ? false : undefined}
      onClick={onClick}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-4 py-3 rounded-xl
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
              animate={{ scale: isActive ? 1.1 : 1, rotate: isActive ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={18} />
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
  );
}

function RoleBadge({ role }: { role: string }) {
  const badgeColors = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    tecnico: "bg-accent/10 text-accent border-accent/20",
    cliente: "bg-secondary/10 text-secondary border-secondary/20",
  } as const;

  const roleIcons = { admin: Shield, tecnico: Wrench, cliente: User } as const;

  const Icon = roleIcons[role as keyof typeof roleIcons] || User;
  const colorClass =
    badgeColors[role as keyof typeof badgeColors] ?? badgeColors.cliente;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClass}`}
    >
      <Icon size={12} />
      <span className="capitalize">{role}</span>
    </motion.div>
  );
}

function UserInfo({ user }: { user: any }) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-muted/30 border border-muted/50"
    >
      <div className="flex items-center gap-2">
        <User size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {user.display_name || user.email?.split("@")[0] || "Usuario"}
        </span>
      </div>
      {user.email && (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function ResponsivePremiumNavbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const [me, setMe] = useState(getUser());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Added mobile menu state

  useEffect(() => onAuthChange(setMe), []);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const role = (me?.role || "").toLowerCase().trim();
  const isAdmin = role === "admin";
  const isTech = role === "tecnico" || isAdmin;

  const techLinks = useMemo<LinkItem[]>(
    () => [
      { to: "/tech/appointments", label: "Citas", icon: iconMap["Citas"] },
      {
        to: "/tech/clients",
        label: "Clientes",
        end: false,
        icon: iconMap["Clientes"],
      },
    ],
    []
  );

  const clientLinks = useMemo<LinkItem[]>(
    () => [
      { to: "/book", label: "Agendar", icon: iconMap["Agendar"] },
      { to: "/me", label: "Mis citas", icon: iconMap["Mis citas"] },
    ],
    []
  );

  const links = useMemo(() => {
    if (!me)
      return [{ to: "/login", label: "Ingresar", icon: iconMap["Ingresar"] }];

    if (isAdmin) {
      const all = [
        ...techLinks,
        { to: "/admin", label: "Admin", icon: iconMap["Admin"] },
      ];
      const seen = new Set<string>();
      return all.filter((l) =>
        seen.has(l.to) ? false : (seen.add(l.to), true)
      );
    }
    if (isTech) return techLinks;
    return clientLinks;
  }, [me, isAdmin, isTech, techLinks, clientLinks]);

  if (loc.pathname.startsWith("/login")) return null;

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const goHome = () => {
    nav(homeByRole(role), { replace: true });
    setIsMobileMenuOpen(false); // Close mobile menu on home navigation
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "shadow-lg shadow-black/5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
          {/* Logo */}
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

              <AnimatePresence>
                {me?.role && (
                  <div className="hidden sm:block">
                    <RoleBadge role={role} />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {me && <UserInfo user={me} />}

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
                      <PremiumNavLink
                        to={link.to}
                        label={link.label}
                        end={link.end}
                        icon={link.icon}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {me && (
                <motion.button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-muted-foreground hover:text-destructive hover:bg-destructive/5
                             transition-all duration-300 border border-transparent hover:border-destructive/20"
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
            </nav>
          </div>

          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl
                       bg-muted/50 hover:bg-muted transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] 
                         bg-background/95 backdrop-blur-xl border-l border-border
                         shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center">
                      <span className="font-bold text-sm">U</span>
                    </div>
                    <span className="font-bold text-lg">Unimas</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 grid place-items-center"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* User Info in Mobile */}
                {me && (
                  <div className="p-6 border-b border-border">
                    <UserInfo user={me} />
                    <div className="mt-3">
                      <RoleBadge role={role} />
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    <AnimatePresence mode="wait">
                      {links.map((link, index) => (
                        <motion.div
                          key={link.to}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PremiumNavLink
                            to={link.to}
                            label={link.label}
                            end={link.end}
                            icon={link.icon}
                            onClick={closeMobileMenu}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </nav>

                {/* Mobile Logout Button */}
                {me && (
                  <div className="p-6 border-t border-border">
                    <motion.button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                 text-muted-foreground hover:text-destructive hover:bg-destructive/5
                                 transition-all duration-300 border border-transparent hover:border-destructive/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={18} />
                      <span>Cerrar Sesión</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
