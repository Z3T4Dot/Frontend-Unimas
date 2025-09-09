"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Filter,
  Search,
  Calendar,
  Crown,
  Wrench,
  User,
} from "lucide-react";
import { AdminAPI } from "../../lib/adminApi";

type UserRow = {
  id: string;
  display_name: string;
  role: string;
  email: string | null;
  created_at: string;
};

const roleConfig = {
  admin: {
    icon: Crown,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "Administrador",
  },
  tecnico: {
    icon: Wrench,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Técnico",
  },
  cliente: {
    icon: User,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    label: "Cliente",
  },
};

export default function PremiumAdminUsers() {
  const [role, setRole] = useState<string>("");
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const users = await AdminAPI.listUsers(role || undefined);
      setItems(users);
    } catch (error) {
      console.error("Error loading users:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const changeRole = async (u: UserRow, newRole: string) => {
    try {
      await AdminAPI.updateUserRole(u.id, newRole);
      load();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const filteredItems = items.filter(
    (user) =>
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const roleStats = {
    total: items.length,
    admin: items.filter((u) => u.role === "admin").length,
    tecnico: items.filter((u) => u.role === "tecnico").length,
    cliente: items.filter((u) => u.role === "cliente").length,
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="bg-accent/10 p-3 rounded-2xl">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-muted mt-1">
              Administra roles y permisos de usuarios del sistema
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Total Usuarios</p>
                <p className="text-2xl font-black text-foreground">
                  {roleStats.total}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-xl">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Administradores
                </p>
                <p className="text-2xl font-black text-foreground">
                  {roleStats.admin}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Técnicos</p>
                <p className="text-2xl font-black text-foreground">
                  {roleStats.tecnico}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Clientes</p>
                <p className="text-2xl font-black text-foreground">
                  {roleStats.cliente}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl shadow-lg border border-border p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-card-foreground">
                Filtrar por rol:
              </span>
              <div className="flex gap-2">
                {["", "cliente", "tecnico", "admin"].map((r) => {
                  const isActive = role === r;
                  return (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground border-accent shadow-lg"
                          : "bg-background hover:bg-muted-foreground/5 border-border"
                      }`}
                    >
                      {r === ""
                        ? "Todos"
                        : roleConfig[r as keyof typeof roleConfig]?.label || r}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-xl text-foreground placeholder-muted focus:ring-2 focus:ring-ring focus:border-transparent transition-all w-full lg:w-80"
              />
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-card rounded-2xl h-20 border border-border"
                ></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 text-center border border-border">
              <div className="bg-muted-foreground/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted" />
              </div>
              <p className="text-muted text-lg">
                {searchTerm
                  ? "No se encontraron usuarios"
                  : "No hay usuarios registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredItems.map((user, index) => {
                  const config =
                    roleConfig[user.role as keyof typeof roleConfig];
                  const IconComponent = config?.icon || User;

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${
                                config?.bg || "bg-gray-100"
                              }`}
                            >
                              <IconComponent
                                className={`w-6 h-6 ${
                                  config?.color || "text-gray-600"
                                }`}
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="text-lg font-black text-foreground">
                                  {user.display_name}
                                </h3>
                                <div
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                                    config?.bg || "bg-gray-50"
                                  } ${config?.color || "text-gray-600"} ${
                                    config?.border || "border-gray-200"
                                  }`}
                                >
                                  <IconComponent className="w-3 h-3" />
                                  {config?.label || user.role}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-card-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {user.email || "Sin email"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    user.created_at
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {["cliente", "tecnico", "admin"].map((r) => {
                              const isCurrentRole = user.role === r;
                              const roleConf =
                                roleConfig[r as keyof typeof roleConfig];

                              return (
                                <motion.button
                                  key={r}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => changeRole(user, r)}
                                  disabled={isCurrentRole}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all ${
                                    isCurrentRole
                                      ? `${roleConf.bg} ${roleConf.color} ${roleConf.border} shadow-lg`
                                      : "bg-background hover:bg-muted-foreground/5 border-border text-card-foreground"
                                  } disabled:cursor-not-allowed`}
                                >
                                  <roleConf.icon className="w-4 h-4" />
                                  {roleConf.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
