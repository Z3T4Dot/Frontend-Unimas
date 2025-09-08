"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, User, ChevronRight } from "lucide-react"
import api from "../../lib/api"

type Client = { id: string; display_name: string }

export default function TechClients() {
  const [items, setItems] = useState<Client[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/tech/clients")
      .then((r) => {
        setItems(r.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
      })
  }, [])

  const filtered = items.filter((c) => c.display_name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-card-foreground">Clientes</h1>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <motion.input
          whileFocus={{ scale: 1.02 }}
          className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
          placeholder="Buscar clientes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </motion.div>

      {/* Clients List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="grid gap-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-xl p-4 shadow-md border border-border"
                >
                  <div className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-muted rounded-xl p-8 text-center"
            >
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {q ? "No se encontraron clientes" : "Aún no tienes clientes"}
              </p>
            </motion.div>
          ) : (
            filtered.map((client, index) => (
              <motion.a
                key={client.id}
                href={`/tech/client/${client.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-card rounded-xl p-4 shadow-md border border-border hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {client.display_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Cliente activo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
