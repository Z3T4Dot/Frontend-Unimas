"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../lib/api";

type TechTotal = {
  specialist_id: string;
  specialist: string;
  total: number;
  count: number;
};

type TopClient = {
  client_id: string;
  client: string;
  count: number;
};

export default function PremiumAdminReports() {
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [rows, setRows] = useState<TechTotal[]>([]);
  const [top, setTop] = useState<Record<string, TopClient[]>>({});
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ date }).toString();
        const response = await api.get(`/admin/reports/daily?${q}`);
        setRows(response.data?.data || []);
      } catch (error) {
        console.error("Error loading reports:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [date]);

  useEffect(() => {
    // Load top clients for each technician (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const until = new Date();

    rows.forEach(async (t) => {
      try {
        const q = new URLSearchParams({
          specialist_id: t.specialist_id,
          since: since.toISOString(),
          until: until.toISOString(),
        }).toString();
        const r = await api.get(`/admin/reports/top-clients?${q}`);
        setTop((prev) => ({ ...prev, [t.specialist_id]: r.data?.data || [] }));
      } catch (error) {
        console.error("Error loading top clients:", error);
      }
    });
  }, [rows]);

  const toggleCard = (specialistId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(specialistId)) {
        newSet.delete(specialistId);
      } else {
        newSet.add(specialistId);
      }
      return newSet;
    });
  };

  const totalRevenue = rows.reduce((sum, row) => sum + row.total, 0);
  const totalAppointments = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-foreground font-sans">
              Reportes Diarios
            </h1>
            <p className="text-muted mt-2">
              Análisis de rendimiento y estadísticas por técnico
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-lg border border-border"
          >
            <Calendar className="w-5 h-5 text-accent" />
            <div>
              <label className="text-sm font-medium text-card-foreground block">
                Fecha de reporte
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 bg-input border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-black text-foreground">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-accent" />
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
                <p className="text-sm font-medium text-muted">Total Citas</p>
                <p className="text-2xl font-black text-foreground">
                  {totalAppointments}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-secondary" />
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
                <p className="text-sm font-medium text-muted">
                  Técnicos Activos
                </p>
                <p className="text-2xl font-black text-foreground">
                  {rows.length}
                </p>
              </div>
              <div className="bg-chart-1/10 p-3 rounded-xl">
                <Users className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reports Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/90 p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
              <h2 className="text-xl font-black text-primary-foreground">
                Rendimiento por Técnico
              </h2>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted-foreground rounded-xl h-20"></div>
                  </div>
                ))}
              </div>
            ) : rows.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="bg-muted-foreground/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-muted" />
                </div>
                <p className="text-muted text-lg">
                  Sin datos para la fecha seleccionada
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {rows.map((row, index) => {
                    const isExpanded = expandedCards.has(row.specialist_id);
                    const topClients = top[row.specialist_id] || [];

                    return (
                      <motion.div
                        key={row.specialist_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-background rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-black text-foreground">
                                {row.specialist}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-accent" />
                                  <span className="text-sm text-card-foreground">
                                    {row.count} citas
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-accent" />
                                  <span className="text-sm font-medium text-card-foreground">
                                    ${row.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleCard(row.specialist_id)}
                              className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 rounded-xl transition-colors"
                            >
                              <span className="text-sm font-medium">
                                Top Clientes
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 pt-6 border-t border-border"
                              >
                                <h4 className="text-sm font-medium text-muted mb-3">
                                  Top clientes (últimos 30 días):
                                </h4>
                                {topClients.length === 0 ? (
                                  <p className="text-sm text-muted italic">
                                    No hay datos de clientes disponibles
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {topClients.map((client, clientIndex) => (
                                      <motion.div
                                        key={client.client_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: clientIndex * 0.05,
                                        }}
                                        className="bg-muted-foreground/5 rounded-xl p-3 border border-border/50"
                                      >
                                        <p className="text-sm font-medium text-card-foreground truncate">
                                          {client.client}
                                        </p>
                                        <p className="text-xs text-muted">
                                          {client.count} citas
                                        </p>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
