import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { appointmentsAPI, Appointment } from '../../lib/api'
import { Calendar, Clock, CheckCircle, XCircle, User, Home, BarChart3, DollarSign, Plus, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import BottomNavbar, { NavTab } from '../../components/ui/BottomNavbar'
import BookAppointment from '../../components/admin/BookAppointment'

type TechTab = 'home' | 'schedule' | 'book' | 'stats'

export default function TechnicianDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TechTab>('home')
  const [showBookModal, setShowBookModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [appointmentsRes, summaryRes] = await Promise.all([
        appointmentsAPI.getAll({
          technician_id: user?.id,
          date: selectedDate,
        }),
        appointmentsAPI.getTechnicianSummary(user!.id, selectedDate),
      ])

      if (appointmentsRes.success) {
        setAppointments(appointmentsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await appointmentsAPI.update(id, { status })
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return

    const reason = prompt('Motivo de cancelación:')
    if (!reason) return

    try {
      await appointmentsAPI.cancel(id, reason)
      loadData()
    } catch (error) {
      console.error('Error canceling appointment:', error)
      alert('Error al cancelar la cita')
    }
  }

  const handleSendWhatsApp = async (id: string) => {
    if (!window.confirm('¿Enviar recordatorio por WhatsApp al cliente?')) return

    try {
      const response = await appointmentsAPI.sendWhatsAppReminder(id)
      if (response.success) {
        alert('✅ Recordatorio enviado por WhatsApp')
      } else {
        alert('⚠️ Error al enviar WhatsApp. Verifica que esté habilitado en el servidor.')
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error)
      alert(error.response?.data?.error || 'Error al enviar WhatsApp')
    }
  }

  const scheduledAppointments = appointments.filter(a => a.status === 'SCHEDULED')

  const navTabs: NavTab[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'schedule', label: 'Agenda', icon: Calendar, badge: scheduledAppointments.length },
    { id: 'book', label: 'Agendar', icon: Plus },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-50 text-blue-700 border border-blue-200',
      COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
    }
    const labels = {
      SCHEDULED: 'Agendada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    }
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">
            Panel de Técnico
          </h1>
          <p className="text-neutral-600">
            {format(new Date(selectedDate), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 p-5">
          <label className="block text-sm font-semibold text-neutral-900 mb-3">
            Selecciona una fecha
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && summary && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 text-white rounded-2xl shadow-md p-5">
                <div className="flex flex-col gap-2">
                  <Calendar className="w-8 h-8 text-white/80" />
                  <div>
                    <p className="text-3xl font-bold">{summary.scheduled_appointments}</p>
                    <p className="text-sm text-white/70">Agendadas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-2">
                  <DollarSign className="w-8 h-8 text-neutral-600" />
                  <div>
                    <p className="text-3xl font-bold text-neutral-900">
                      ${summary.total_earnings ? summary.total_earnings.toFixed(0) : '0'}
                    </p>
                    <p className="text-sm text-neutral-500">Ganancias</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setActiveTab('book')}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl p-5 flex items-center justify-center space-x-3 shadow-md transition-all active:scale-98"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold text-lg">Agendar Nueva Cita</span>
            </button>

            {/* Today's Appointments Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Citas de hoy</h2>
                <span className="text-sm text-neutral-500">
                  {appointments.length} total
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 text-sm">
                    No hay citas programadas para esta fecha
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        {getStatusBadge(apt.status)}
                        <span className="text-sm font-semibold text-neutral-900">
                          {apt.start_time}
                        </span>
                      </div>
                      <p className="font-semibold text-neutral-900">{apt.client_name}</p>
                      <p className="text-sm text-neutral-500">{apt.client_phone}</p>
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="w-full py-3 text-center text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Ver todas las citas ({appointments.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">
                Agenda del día
              </h2>
              <button
                onClick={() => setActiveTab('book')}
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 text-white rounded-xl font-semibold shadow-sm hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agendar</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 text-sm mb-4">
                  No hay citas programadas
                </p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-neutral-900 text-white rounded-xl font-semibold shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Agendar Nueva Cita</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`bg-white rounded-2xl shadow-sm border p-5 ${
                        appointment.status === 'COMPLETED'
                          ? 'border-green-200 bg-green-50/30'
                          : appointment.status === 'CANCELLED'
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-neutral-200'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          {getStatusBadge(appointment.status)}
                          <span className="text-xs text-neutral-400 font-mono">
                            #{appointment.id.slice(0, 8)}
                          </span>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-neutral-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">
                              {appointment.client_name}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {appointment.client_phone}
                            </p>
                          </div>
                        </div>

                        {/* Time and Price */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-xl">
                            <Clock className="w-5 h-5 text-neutral-600" />
                            <div>
                              <p className="text-xs text-neutral-500">Horario</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                {appointment.start_time} - {appointment.end_time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-xl">
                            <DollarSign className="w-5 h-5 text-neutral-600" />
                            <div>
                              <p className="text-xs text-neutral-500">Total</p>
                              <p className="text-sm font-semibold text-neutral-900">
                                ${appointment.total_amount ? appointment.total_amount.toFixed(2) : '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                            Servicios
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.services && appointment.services.length > 0 ? (
                              appointment.services.map((service) => (
                                <span
                                  key={service.id}
                                  className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium"
                                >
                                  {service.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-neutral-400">Sin servicios</span>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="p-3 bg-neutral-50 rounded-xl">
                            <p className="text-xs text-neutral-500 mb-1">Notas</p>
                            <p className="text-sm text-neutral-700">{appointment.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        {appointment.status === 'SCHEDULED' && (
                          <div className="space-y-2 pt-3 border-t border-neutral-100">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-sm hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Completar</span>
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancelar</span>
                              </button>
                            </div>
                            <button
                              onClick={() => handleSendWhatsApp(appointment.id)}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold shadow-sm hover:bg-green-600 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Enviar Recordatorio por WhatsApp</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Book Tab */}
        {activeTab === 'book' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Agendar Nueva Cita
              </h3>
              <p className="text-neutral-600 text-sm mb-6">
                Crea una nueva cita para tus clientes
              </p>
              <button
                onClick={() => setShowBookModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold shadow-md hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Iniciar Agendamiento</span>
              </button>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && summary && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-neutral-900">
              Estadísticas del día
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-2">
                  <Calendar className="w-8 h-8 text-neutral-600" />
                  <div>
                    <p className="text-3xl font-bold text-neutral-900">
                      {summary.total_appointments}
                    </p>
                    <p className="text-sm text-neutral-500">Total citas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-3xl font-bold text-neutral-900">
                      {summary.completed_appointments}
                    </p>
                    <p className="text-sm text-neutral-500">Completadas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-3xl font-bold text-neutral-900">
                      {summary.scheduled_appointments}
                    </p>
                    <p className="text-sm text-neutral-500">Pendientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 text-white rounded-2xl shadow-md p-5 col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <DollarSign className="w-8 h-8 text-white/80" />
                    <div>
                      <p className="text-4xl font-bold">${summary.total_earnings ? summary.total_earnings.toFixed(2) : '0.00'}</p>
                      <p className="text-sm text-white/70">Ganancias totales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavbar
        tabs={navTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TechTab)}
      />

      {showBookModal && (
        <BookAppointment
          onClose={() => setShowBookModal(false)}
          onSuccess={() => {
            setShowBookModal(false)
            loadData()
            setActiveTab('schedule')
          }}
        />
      )}
    </>
  )
}
