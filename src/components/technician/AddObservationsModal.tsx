import { useState } from 'react'
import { X, FileText, Package, Lightbulb, Camera, Loader2 } from 'lucide-react'

interface AddObservationsModalProps {
  isOpen: boolean
  appointmentId: string
  clientName: string
  onClose: () => void
  onSuccess: () => void
}

interface ObservationsData {
  observations: string
  products_used: string
  recommendations: string
}

export default function AddObservationsModal({
  isOpen,
  appointmentId,
  clientName,
  onClose,
  onSuccess,
}: AddObservationsModalProps) {
  const [formData, setFormData] = useState<ObservationsData>({
    observations: '',
    products_used: '',
    recommendations: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.observations.trim()) {
      setError('Las observaciones son obligatorias')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/appointments/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar observaciones')
      }

      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        observations: '',
        products_used: '',
        recommendations: '',
      })
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Agregar Observaciones</h2>
            <p className="text-sm text-neutral-300 mt-1">Cliente: {clientName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Observations - Required */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>Observaciones *</span>
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Describe el estado del cliente, procedimientos realizados, resultados obtenidos..."
              rows={5}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none disabled:bg-neutral-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Campo obligatorio - Información sobre el servicio realizado
            </p>
          </div>

          {/* Products Used - Optional */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-2">
              <Package className="w-4 h-4" />
              <span>Productos Utilizados</span>
            </label>
            <textarea
              value={formData.products_used}
              onChange={(e) => setFormData({ ...formData, products_used: e.target.value })}
              placeholder="Ej: Esmalte OPI Red, Lima profesional, Aceite de cutícula..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none disabled:bg-neutral-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Opcional - Lista de productos usados durante el servicio
            </p>
          </div>

          {/* Recommendations - Optional */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-neutral-700 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Recomendaciones</span>
            </label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Ej: Aplicar crema hidratante diariamente, evitar agua caliente por 24h, agendar próxima cita en 2 semanas..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none disabled:bg-neutral-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Opcional - Consejos y cuidados para el cliente
            </p>
          </div>

          {/* Photos Section - Future Feature */}
          <div className="p-4 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl">
            <div className="flex items-center space-x-3 text-neutral-400">
              <Camera className="w-6 h-6" />
              <div>
                <p className="text-sm font-semibold">Fotos Antes/Después</p>
                <p className="text-xs">Próximamente disponible</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.observations.trim()}
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Observaciones</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
