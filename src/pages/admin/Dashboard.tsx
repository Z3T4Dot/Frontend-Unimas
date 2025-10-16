import { useState, useEffect } from 'react'
import {
  Users,
  Calendar,
  Sparkles,
  BarChart3,
  Settings,
  Briefcase,
  Home,
  Clock,
  DollarSign,
  CheckCircle,
  Plus,
  XCircle,
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { appointmentsAPI, Appointment } from '../../lib/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ManageUsers from '../../components/admin/ManageUsers'
import ManageServices from '../../components/admin/ManageServices'
import ManageAppointments from '../../components/admin/ManageAppointments'
import Statistics from '../../components/admin/Statistics'
import BottomNavbar, { NavTab } from '../../components/ui/BottomNavbar'
import BookAppointment from '../../components/admin/BookAppointment'

type ViewMode = 'admin' | 'tech'
type AdminTabType = 'stats' | 'appointments' | 'users' | 'services'
type TechTabType = 'home' | 'schedule' | 'book' | 'stats'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('admin')
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTabType>('stats')
  const [techActiveTab, setTechActiveTab] = useState<TechTabType>('home')

  // Tech view states
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)

  useEffect(() => {
    if (viewMode === 'tech') {
      loadTechData()
    }
  }, [selectedDate, viewMode])

  const loadTechData = async () => {
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
      loadTechData()
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
      loadTechData()
    } catch (error) {
      console.error('Error canceling appointment:', error)
      alert('Error al cancelar la cita')
    }
  }

  const scheduledAppointments = appointments.filter(a => a.status === 'SCHEDULED')

  const adminNavTabs: NavTab[] = [
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'services', label: 'Servicios', icon: Sparkles },
  ]

  const techNavTabs: NavTab[] = [
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

  return (
    <>
      <div className="space-y-6 pb-24">
        {/* Header with View Mode Toggle */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900">
              {viewMode === 'admin' ? 'Panel de Administración' : 'Panel de Técnico'}
            </h1>
            <p className="text-neutral-600">
              {viewMode === 'admin'
                ? 'Gestión completa del sistema Uñimas Spa'
                : format(new Date(selectedDate), "d 'de' MMMM yyyy", { locale: es })
              }
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm inline-flex space-x-2 border border-neutral-200">
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'admin'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => setViewMode('tech')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                viewMode === 'tech'
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Técnico</span>
            </button>
          </div>
        </div>

        {/* Admin View */}
        {viewMode === 'admin' && (
          <div className="animate-fadeIn">
            {adminActiveTab === 'stats' && <Statistics />}
            {adminActiveTab === 'appointments' && <ManageAppointments />}
            {adminActiveTab === 'users' && <ManageUsers />}
            {adminActiveTab === 'services' && <ManageServices />}
          </div>
        )}

        {/* Tech View */}
        {viewMode === 'tech' && (
          <>
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

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loader"></div>
              </div>
            ) : (
              <>
                {/* Home Tab */}
                {techActiveTab === 'home' && summary && (
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
                              ${summary.total_earnings.toFixed(0)}
                            </p>
                            <p className="text-sm text-neutral-500">Ganancias</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <button
                      onClick={() => setTechActiveTab('book')}
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
                              onClick={() => setTechActiveTab('schedule')}
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
                {techActiveTab === 'schedule' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-neutral-900">
                        Agenda del día
                      </h2>
                      <button
                        onClick={() => setTechActiveTab('book')}
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
                          onClick={() => setTechActiveTab('book')}
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
                                <div className="flex items-center justify-between">
                                  {getStatusBadge(appointment.status)}
                                  <span className="text-xs text-neutral-400 font-mono">
                                    #{appointment.id.slice(0, 8)}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-neutral-600" />
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
                                        ${appointment.total_amount.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                                    Servicios
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {appointment.services.map((service) => (
                                      <span
                                        key={service.id}
                                        className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium"
                                      >
                                        {service.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {appointment.notes && (
                                  <div className="p-3 bg-neutral-50 rounded-xl">
                                    <p className="text-xs text-neutral-500 mb-1">Notas</p>
                                    <p className="text-sm text-neutral-700">{appointment.notes}</p>
                                  </div>
                                )}

                                {appointment.status === 'SCHEDULED' && (
                                  <div className="flex gap-2 pt-3 border-t border-neutral-100">
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
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Book Tab */}
                {techActiveTab === 'book' && (
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
                {techActiveTab === 'stats' && summary && (
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
                              <p className="text-4xl font-bold">${summary.total_earnings.toFixed(2)}</p>
                              <p className="text-sm text-white/70">Ganancias totales</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <BottomNavbar
        tabs={viewMode === 'admin' ? adminNavTabs : techNavTabs}
        activeTab={viewMode === 'admin' ? adminActiveTab : techActiveTab}
        onTabChange={(tabId) => {
          if (viewMode === 'admin') {
            setAdminActiveTab(tabId as AdminTabType)
          } else {
            setTechActiveTab(tabId as TechTabType)
          }
        }}
      />

      {showBookModal && (
        <BookAppointment
          onClose={() => setShowBookModal(false)}
          onSuccess={() => {
            setShowBookModal(false)
            if (viewMode === 'tech') {
              loadTechData()
              setTechActiveTab('schedule')
            }
          }}
        />
      )}
    </>
  )
}
