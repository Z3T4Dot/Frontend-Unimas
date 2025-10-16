import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Sparkles, User } from 'lucide-react'
import { servicesAPI, usersAPI, Service, User as UserType } from '../../lib/api'

interface AssignServicesProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function AssignServices({ onClose, onSuccess }: AssignServicesProps) {
  const [technicians, setTechnicians] = useState<UserType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<string>('')
  const [assignedServices, setAssignedServices] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedTechnician) {
      loadTechnicianServices()
    }
  }, [selectedTechnician])

  const loadData = async () => {
    setLoading(true)
    try {
      const [techsResponse, servicesResponse] = await Promise.all([
        usersAPI.getTechnicians(),
        servicesAPI.getAll({ is_active: true }),
      ])

      if (techsResponse.success) {
        setTechnicians(techsResponse.data)
      }
      if (servicesResponse.success) {
        setServices(servicesResponse.data)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicianServices = async () => {
    try {
      const response = await servicesAPI.getTechnicianServices(selectedTechnician)
      if (response.success) {
        const serviceIds = response.data.map((s: Service) => s.id)
        setAssignedServices(serviceIds)
        setSelectedServices(serviceIds)
      }
    } catch (err) {
      console.error('Error loading technician services:', err)
    }
  }

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(services.map((s) => s.id))
    }
  }

  const handleSave = async () => {
    if (!selectedTechnician) {
      setError('Selecciona un técnico')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await servicesAPI.assignToTechnician(
        selectedTechnician,
        selectedServices
      )

      if (response.success) {
        setSuccess('Servicios asignados correctamente')
        setAssignedServices(selectedServices)
        setTimeout(() => {
          onSuccess?.()
          onClose()
        }, 1500)
      }
    } catch (err: any) {
      console.error('Error assigning services:', err)
      setError(err.response?.data?.error || 'Error al asignar servicios')
    } finally {
      setSaving(false)
    }
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category_name || 'Sin categoría'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  const hasChanges = JSON.stringify([...selectedServices].sort()) !== JSON.stringify([...assignedServices].sort())

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Asignar Servicios</h2>
                <p className="text-neutral-300 mt-1">
                  Gestiona qué servicios puede realizar cada técnico
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Technician Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              Seleccionar Técnico
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? (
                <div className="col-span-2 text-center py-8 text-neutral-500">
                  Cargando técnicos...
                </div>
              ) : technicians.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-neutral-500">
                  No hay técnicos disponibles
                </div>
              ) : (
                technicians.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechnician(tech.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTechnician === tech.id
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedTechnician === tech.id
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{tech.name}</p>
                        <p className="text-sm text-neutral-500">{tech.email}</p>
                      </div>
                      {selectedTechnician === tech.id && (
                        <CheckCircle2 className="w-6 h-6 text-neutral-900 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Services Selection */}
          {selectedTechnician && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-neutral-700">
                  Servicios Disponibles
                </label>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  {selectedServices.length === services.length
                    ? 'Deseleccionar todos'
                    : 'Seleccionar todos'}
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedServices).map(([category, categoryServices]) => (
                  <div key={category} className="border border-neutral-200 rounded-xl p-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryServices.map((service) => (
                        <label
                          key={service.id}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleToggleService(service.id)}
                            className="mt-1 w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900 focus:ring-2"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-neutral-900 text-sm">
                              {service.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              ${service.price} • {service.duration_minutes} min
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      Servicios seleccionados
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {selectedServices.length} de {services.length}
                    </p>
                  </div>
                  {hasChanges && (
                    <div className="flex items-center space-x-2 text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Cambios sin guardar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6 bg-neutral-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedTechnician || saving || !hasChanges}
              className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Guardar Asignación</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
