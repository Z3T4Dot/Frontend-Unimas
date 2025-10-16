import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { appointmentsAPI, Appointment } from '../../lib/api'
import { Calendar, Clock, User, Phone, Home, Sparkles, History } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import BottomNavbar, { NavTab } from '../../components/ui/BottomNavbar'

type ClientTab = 'home' | 'services' | 'history'

export default function ClientDashboard() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ClientTab>('home')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll({
        client_id: user?.id,
      })
      if (response.success) {
        setAppointments(response.data)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'SCHEDULED' && new Date(apt.date) >= new Date()
  )

  const completedAppointments = appointments.filter(
    (apt) => apt.status === 'COMPLETED'
  )

  const navTabs: NavTab[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'services', label: 'Servicios', icon: Sparkles },
    { id: 'history', label: 'Historial', icon: History, badge: completedAppointments.length },
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

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200/60 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col gap-4">
        {/* Header with status */}
        <div className="flex items-center justify-between">
          {getStatusBadge(appointment.status)}
          <span className="text-xs text-neutral-400 font-mono">
            #{appointment.id.slice(0, 8)}
          </span>
        </div>

        {/* Technician */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-neutral-600" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 font-medium">Técnico</p>
            <p className="font-semibold text-neutral-900">{appointment.technician_name}</p>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-xl">
            <Calendar className="w-5 h-5 text-neutral-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">Fecha</p>
              <p className="text-sm font-semibold text-neutral-900 capitalize truncate">
                {format(new Date(appointment.date), 'd MMM', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-xl">
            <Clock className="w-5 h-5 text-neutral-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">Horario</p>
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {appointment.start_time}
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Servicios</p>
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

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-sm text-neutral-500">Total</span>
          <div className="text-right">
            <p className="text-xl font-bold text-neutral-900">
              ${appointment.total_amount.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500">{appointment.total_duration} min</p>
          </div>
        </div>

        {appointment.status === 'SCHEDULED' && (
          <div className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-xl text-neutral-600 text-sm">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">Llama al spa para modificar tu cita</span>
          </div>
        )}
      </div>
    </div>
  )

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
            Hola, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-neutral-600">
            Gestiona tus citas de belleza
          </p>
        </div>

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 text-white rounded-2xl shadow-md p-5">
                <div className="flex flex-col gap-2">
                  <Calendar className="w-8 h-8 text-white/80" />
                  <div>
                    <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-sm text-white/70">Próximas citas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col gap-2">
                  <Clock className="w-8 h-8 text-neutral-600" />
                  <div>
                    <p className="text-3xl font-bold text-neutral-900">{completedAppointments.length}</p>
                    <p className="text-sm text-neutral-500">Completadas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/60">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">
                    ¿Necesitas agendar una cita?
                  </p>
                  <p className="text-sm text-neutral-600">
                    Contáctanos directamente al spa para reservar tu próxima sesión
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Próximas citas</h2>
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 text-sm mb-4">
                    No tienes citas programadas
                  </p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-700">
                    <Phone className="w-4 h-4" />
                    <span>Llama al spa para agendar</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Catálogo de Servicios
              </h3>
              <p className="text-neutral-600 text-sm mb-6">
                Consulta nuestros servicios y contáctanos para agendar
              </p>
              <div className="inline-flex items-center space-x-2 px-5 py-3 bg-neutral-900 text-white rounded-xl font-semibold shadow-sm">
                <Phone className="w-5 h-5" />
                <span>Contáctanos</span>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-neutral-900">Historial de citas</h2>
            {completedAppointments.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 text-sm">
                  Aún no tienes citas completadas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedAppointments.map(renderAppointmentCard)}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavbar
        tabs={navTabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ClientTab)}
      />
    </>
  )
}
