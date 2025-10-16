import { useState, useEffect } from 'react'
import { servicesAPI, categoriesAPI, Service, Category } from '../../lib/api'
import { X } from 'lucide-react'

interface ServiceFormModalProps {
  service?: Service | null
  onClose: () => void
  onSuccess: () => void
}

export default function ServiceFormModal({ service, onClose, onSuccess }: ServiceFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: service?.category_id || '',
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 60,
    is_active: service?.is_active ?? true,
    requires_consultation: service?.requires_consultation ?? false,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_id) {
      alert('Por favor selecciona una categoría')
      return
    }

    if (!formData.name.trim()) {
      alert('Por favor ingresa un nombre para el servicio')
      return
    }

    if (formData.price <= 0) {
      alert('El precio debe ser mayor a 0')
      return
    }

    if (formData.duration_minutes <= 0) {
      alert('La duración debe ser mayor a 0')
      return
    }

    setLoading(true)
    try {
      if (service) {
        // Update existing service
        await servicesAPI.update(service.id, formData)
      } else {
        // Create new service
        await servicesAPI.create(formData as any)
      }
      onSuccess()
    } catch (error: any) {
      console.error('Error saving service:', error)
      alert(error.response?.data?.message || 'Error al guardar el servicio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-neutral-900">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Categoría *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="Ej: Manicure Francesa"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full min-h-[100px] resize-y"
              placeholder="Describe el servicio en detalle..."
              required
            />
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Precio ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input w-full"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                Duración (minutos) *
              </label>
              <input
                type="number"
                step="5"
                min="5"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="input w-full"
                placeholder="60"
                required
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-2 focus:ring-neutral-900"
              />
              <label htmlFor="is_active" className="ml-3 text-sm font-medium text-neutral-900">
                Servicio Activo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_consultation"
                checked={formData.requires_consultation}
                onChange={(e) => setFormData({ ...formData, requires_consultation: e.target.checked })}
                className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-2 focus:ring-neutral-900"
              />
              <label htmlFor="requires_consultation" className="ml-3 text-sm font-medium text-neutral-900">
                Requiere Consulta Previa
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                service ? 'Actualizar Servicio' : 'Crear Servicio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
