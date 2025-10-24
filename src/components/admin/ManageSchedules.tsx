import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Clock, User, Plus, Trash2 } from 'lucide-react'
import { usersAPI, User as UserType, api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

interface ManageSchedulesProps {
  onClose: () => void
  onSuccess?: () => void
}

interface Schedule {
  id?: string
  technician_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

export default function ManageSchedules({ onClose, onSuccess }: ManageSchedulesProps) {
  const { user: currentUser } = useAuthStore()
  const [technicians, setTechnicians] = useState<UserType[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<string>('')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadTechnicians()
  }, [])

  useEffect(() => {
    if (selectedTechnician) {
      loadSchedules()
    }
  }, [selectedTechnician])

  const loadTechnicians = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getTechnicians()
      if (response.success) {
        let techList = response.data

        // Add current admin to the list if not already included
        if (currentUser && currentUser.role === 'ADMIN') {
          const adminAlreadyInList = techList.some(
            (t: UserType) => t.id === currentUser.id
          )
          if (!adminAlreadyInList) {
            techList = [currentUser, ...techList]
          }
        }

        setTechnicians(techList)
      }
    } catch (err) {
      console.error('Error loading technicians:', err)
      setError('Error al cargar técnicos')
    } finally {
      setLoading(false)
    }
  }

  const loadSchedules = async () => {
    try {
      const response = await api.get(`/users/schedules/${selectedTechnician}`)
      if (response.data.success) {
        setSchedules(response.data.data)
      }
    } catch (err) {
      console.error('Error loading schedules:', err)
      setSchedules([])
    }
  }

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      {
        technician_id: selectedTechnician,
        day_of_week: 1,
        start_time: '09:00',
        end_time: '18:00',
      },
    ])
  }

  const handleUpdateSchedule = (index: number, field: keyof Schedule, value: any) => {
    const newSchedules = [...schedules]
    newSchedules[index] = { ...newSchedules[index], [field]: value }
    setSchedules(newSchedules)
  }

  const handleRemoveSchedule = async (index: number) => {
    const schedule = schedules[index]

    if (schedule.id) {
      // Delete from backend
      try {
        await api.delete(`/users/schedules/${schedule.id}`)
        setSchedules(schedules.filter((_, i) => i !== index))
        setSuccess('Horario eliminado correctamente')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err: any) {
        console.error('Error deleting schedule:', err)
        setError(err.response?.data?.error || 'Error al eliminar horario')
      }
    } else {
      // Just remove from state
      setSchedules(schedules.filter((_, i) => i !== index))
    }
  }

  const handleSave = async () => {
    if (!selectedTechnician) {
      setError('Selecciona un técnico')
      return
    }

    if (schedules.length === 0) {
      setError('Agrega al menos un horario')
      return
    }

    // Validate schedules
    for (const schedule of schedules) {
      if (schedule.start_time >= schedule.end_time) {
        setError('La hora de fin debe ser posterior a la hora de inicio')
        return
      }
    }

    // Check for duplicate day_of_week in schedules
    const dayCount = schedules.reduce((acc, schedule) => {
      acc[schedule.day_of_week] = (acc[schedule.day_of_week] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const duplicateDays = Object.entries(dayCount)
      .filter(([_, count]) => count > 1)
      .map(([day, _]) => DAYS_OF_WEEK.find(d => d.value === parseInt(day))?.label)

    if (duplicateDays.length > 0) {
      setError(`Hay días duplicados: ${duplicateDays.join(', ')}. Cada día solo puede tener un horario.`)
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // First, get current schedules from server
      const currentResponse = await api.get(`/users/schedules/${selectedTechnician}`)
      const currentSchedules = currentResponse.data.success ? currentResponse.data.data : []

      // Delete schedules that are no longer in the list
      for (const current of currentSchedules) {
        const stillExists = schedules.find(
          s => s.id === current.id
        )
        if (!stillExists) {
          await api.delete(`/users/schedules/${current.id}`)
        }
      }

      // Create or update schedules
      for (const schedule of schedules) {
        if (schedule.id) {
          // Update existing schedule
          await api.put(`/users/schedules/${schedule.id}`, {
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          })
        } else {
          // Create new schedule
          await api.post('/users/schedules', {
            technician_id: selectedTechnician,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          })
        }
      }

      setSuccess('Horarios guardados correctamente')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving schedules:', err)
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al guardar horarios'
      setError(errorMsg)
      // Reload schedules to show current state
      loadSchedules()
    } finally {
      setSaving(false)
    }
  }

  const handleSetWeekdaySchedule = () => {
    const weekdaySchedules = [1, 2, 3, 4, 5].map(day => ({
      technician_id: selectedTechnician,
      day_of_week: day,
      start_time: '09:00',
      end_time: '18:00',
    }))
    setSchedules(weekdaySchedules)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gestionar Horarios</h2>
                <p className="text-neutral-300 mt-1">
                  Configura los días y horas de trabajo de cada técnico
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

          {/* Schedules Management */}
          {selectedTechnician && (
            <div className="animate-fadeIn space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-neutral-700">
                  Horarios de Trabajo
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSetWeekdaySchedule}
                    className="text-sm px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium transition-colors"
                  >
                    Lunes a Viernes (9-6)
                  </button>
                  <button
                    onClick={handleAddSchedule}
                    className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Horario</span>
                  </button>
                </div>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-xl">
                  <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 font-medium">No hay horarios configurados</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Agrega horarios para que este técnico pueda recibir citas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 border border-neutral-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Día
                          </label>
                          <select
                            value={schedule.day_of_week}
                            onChange={(e) =>
                              handleUpdateSchedule(index, 'day_of_week', parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Hora Inicio
                          </label>
                          <input
                            type="time"
                            value={schedule.start_time}
                            onChange={(e) =>
                              handleUpdateSchedule(index, 'start_time', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Hora Fin
                          </label>
                          <input
                            type="time"
                            value={schedule.end_time}
                            onChange={(e) =>
                              handleUpdateSchedule(index, 'end_time', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSchedule(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {schedules.length > 0 && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <p className="text-sm font-medium text-neutral-700">
                    Horarios configurados
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">
                    {schedules.length} {schedules.length === 1 ? 'día' : 'días'}
                  </p>
                </div>
              )}
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
              disabled={!selectedTechnician || schedules.length === 0 || saving}
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
                  <span>Guardar Horarios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
