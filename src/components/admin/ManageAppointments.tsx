import { useState, useEffect } from 'react'
import { appointmentsAPI, Appointment } from '../../lib/api'
import { Calendar, Clock, Search, User, DollarSign, Filter, CalendarDays } from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

type PeriodType = 'day' | 'week' | 'month' | 'all'

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [viewPeriod, setViewPeriod] = useState<PeriodType>('day')

  useEffect(() => {
    loadAppointments()
  }, [filterStatus, filterDate, viewPeriod])

  const loadAppointments = async () => {
    try {
      const params: any = {}
      if (filterStatus !== 'all') params.status = filterStatus

      // Para periodo "day", usar la fecha específica
      // Para otros periodos, cargar todas las citas y filtrar en el frontend
      if (viewPeriod === 'day' && filterDate) {
        params.date = filterDate
      }

      const response = await appointmentsAPI.getAll(params)
      if (response.success) {
        let filteredData = response.data

        // Filtrar por periodo en el frontend
        if (viewPeriod !== 'all' && viewPeriod !== 'day' && filterDate) {
          const baseDate = parseISO(filterDate)
          let startDate: Date
          let endDate: Date

          if (viewPeriod === 'week') {
            startDate = startOfWeek(baseDate, { locale: es })
            endDate = endOfWeek(baseDate, { locale: es })
          } else if (viewPeriod === 'month') {
            startDate = startOfMonth(baseDate)
            endDate = endOfMonth(baseDate)
          } else {
            startDate = baseDate
            endDate = baseDate
          }

          filteredData = response.data.filter((apt: Appointment) => {
            const aptDate = parseISO(apt.date)
            return aptDate >= startDate && aptDate <= endDate
          })
        }

        setAppointments(filteredData)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return

    const reason = prompt('Motivo de cancelación:')
    if (!reason) return

    try {
      await appointmentsAPI.cancel(id, reason)
      loadAppointments()
    } catch (error) {
      console.error('Error canceling appointment:', error)
      alert('Error al cancelar la cita')
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await appointmentsAPI.update(id, { status })
      loadAppointments()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.client_name.toLowerCase().includes(search.toLowerCase()) ||
      apt.technician_name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    }
    const labels = {
      SCHEDULED: 'Agendada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPeriodLabel = () => {
    if (!filterDate || viewPeriod === 'all') return 'Todas las citas'

    const baseDate = parseISO(filterDate)

    if (viewPeriod === 'day') {
      return format(baseDate, "EEEE, d 'de' MMMM yyyy", { locale: es })
    } else if (viewPeriod === 'week') {
      const start = startOfWeek(baseDate, { locale: es })
      const end = endOfWeek(baseDate, { locale: es })
      return `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`
    } else if (viewPeriod === 'month') {
      return format(baseDate, "MMMM yyyy", { locale: es })
    }
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Citas</h2>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <CalendarDays className="w-5 h-5 text-neutral-600 flex-shrink-0" />
          <div className="flex space-x-2">
            <button
              onClick={() => setViewPeriod('day')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewPeriod === 'day'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewPeriod('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewPeriod === 'week'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewPeriod('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewPeriod === 'month'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewPeriod === 'all'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        {/* Period Label */}
        <div className="flex items-center space-x-2 text-neutral-700">
          <Calendar className="w-4 h-4" />
          <span className="font-semibold capitalize">{getPeriodLabel()}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o técnico..."
                className="input pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {viewPeriod !== 'all' && (
              <input
                type="date"
                className="input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            )}

            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="SCHEDULED">Agendadas</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>

            <button
              onClick={() => {
                setSearch('')
                setFilterDate(format(new Date(), 'yyyy-MM-dd'))
                setFilterStatus('all')
                setViewPeriod('day')
              }}
              className="btn btn-secondary"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron citas
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          filteredAppointments
            .sort((a, b) => {
              const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
              if (dateCompare !== 0) return dateCompare
              return b.start_time.localeCompare(a.start_time)
            })
            .map((appointment) => (
              <div key={appointment.id} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Left Section */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(appointment.status)}
                      <span className="text-sm text-gray-500">
                        #{appointment.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cliente</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {appointment.client_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {appointment.client_phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">Técnico</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-secondary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {appointment.technician_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {format(new Date(appointment.date), 'EEEE, d MMM yyyy', {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {appointment.start_time} - {appointment.end_time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">
                          ${appointment.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-2">Servicios:</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.services.map((service) => (
                          <span
                            key={service.id}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notas:</span> {appointment.notes}
                        </p>
                      </div>
                    )}

                    {appointment.cancellation_reason && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Motivo de cancelación:</span>{' '}
                          {appointment.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  {appointment.status === 'SCHEDULED' && (
                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                      <button
                        onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                        className="btn bg-green-600 text-white hover:bg-green-700 flex-1 lg:flex-none"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn bg-red-50 text-red-600 hover:bg-red-100 flex-1 lg:flex-none"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Citas</p>
          <p className="text-2xl font-bold text-primary-600">
            {appointments.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Agendadas</p>
          <p className="text-2xl font-bold text-blue-600">
            {appointments.filter((a) => a.status === 'SCHEDULED').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-green-600">
            {appointments.filter((a) => a.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Ingresos</p>
          <p className="text-2xl font-bold text-secondary-600">
            $
            {appointments
              .filter((a) => a.status === 'COMPLETED')
              .reduce((sum, a) => sum + a.total_amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
