"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Plus, Clock, Save } from "lucide-react"
import api from "../../lib/api"

type File = { id: string; title: string; content: string; created_at: string }

export default function TechClientFiles() {
  const { clientId } = useParams()
  const [items, setItems] = useState<File[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const load = () => {
    if (!clientId) return
    api
      .get(`/tech/files?client_id=${clientId}`)
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    load()
  }, [clientId])

  const create = async () => {
    if (!clientId || !title || !content) return
    setLoading(true)
    try {
      await api.post("/tech/files", { client_id: clientId, title, content })
      setTitle("")
      setContent("")
      load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-card-foreground">Ficha Técnica</h1>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">Nueva Ficha</h2>
            </div>

            <div className="space-y-4">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                className="w-full p-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
                placeholder="Título de la ficha"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                className="w-full p-3 bg-input border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground resize-none"
                placeholder="Contenido detallado..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={create}
                disabled={!title || !content || loading}
                className="w-full p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Ficha
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Files History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Histórico</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-muted rounded-xl p-6 text-center"
                >
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Sin fichas técnicas aún</p>
                </motion.div>
              ) : (
                items.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card rounded-xl p-4 shadow-md border border-border hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-card-foreground">{file.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{file.content}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
