import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/apiClient'
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  Sparkles,
  Users,
  Target,
  Zap,
  Star,
  TrendingDown
} from 'lucide-react'

interface TechnicianStats {
  period: string
  period_label: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  scheduled_appointments: number
  most_requested_services: Array<{ name: string; count: number }>
  busiest_hours: Array<{ hour: string; count: number }>
  completion_rate: number
  cancellation_rate: number
}

export default function TechnicianStatistics() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<TechnicianStats | null>(null)
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadStatistics()
    }
  }, [user?.id, period])

  const loadStatistics = async () => {
    if (!user?.id) return

    setLoading(true)
    setError('')

    try {
      const response = await apiClient.get(
        `/appointments/statistics/${user.id}?period=${period}`
      )

      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err: any) {
      console.error('Error loading statistics:', err)
      setError('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const periodOptions = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'year', label: 'Año' },
  ]

  // Calculate average appointments per period
  const avgAppointmentsPerDay = stats.total_appointments / (
    period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365
  )

  // Calculate client satisfaction (based on completion rate)
  const clientSatisfaction = stats.completion_rate

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-pink-500" />
            Tus Estadísticas
          </h2>
          <p className="text-gray-600 mt-1">
            Período: <span className="font-semibold text-pink-600">{stats.period_label}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === opt.value
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-bold">{stats.total_appointments}</span>
            </div>
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Total de Citas</h3>
          <p className="text-2xl font-bold">{stats.total_appointments}</p>
          <p className="text-white/70 text-xs mt-2">
            Promedio: {avgAppointmentsPerDay.toFixed(1)}/día
          </p>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-bold">{stats.completed_appointments}</span>
            </div>
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Completadas</h3>
          <p className="text-2xl font-bold">{stats.completed_appointments}</p>
          <p className="text-white/70 text-xs mt-2">
            {stats.completion_rate}% de éxito
          </p>
        </div>

        {/* Scheduled */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-bold">{stats.scheduled_appointments}</span>
            </div>
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Pendientes</h3>
          <p className="text-2xl font-bold">{stats.scheduled_appointments}</p>
          <p className="text-white/70 text-xs mt-2">
            Por atender
          </p>
        </div>

        {/* Cancelled */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <XCircle className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-sm font-bold">{stats.cancelled_appointments}</span>
            </div>
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-1">Canceladas</h3>
          <p className="text-2xl font-bold">{stats.cancelled_appointments}</p>
          <p className="text-white/70 text-xs mt-2">
            {stats.cancellation_rate}% del total
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Tasa de Éxito
                </h3>
                <p className="text-sm text-gray-600">Citas completadas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">{stats.completion_rate}%</p>
            </div>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.completion_rate}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.completion_rate >= 80 ? '¡Excelente desempeño!' : stats.completion_rate >= 60 ? 'Buen trabajo' : 'Puedes mejorar'}
          </p>
        </div>

        {/* Client Satisfaction */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Satisfacción del Cliente
                </h3>
                <p className="text-sm text-gray-600">Basado en tus citas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-purple-600">{clientSatisfaction}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(clientSatisfaction / 20)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tus clientes están {clientSatisfaction >= 80 ? 'muy satisfechos' : 'satisfechos'}
          </p>
        </div>
      </div>

      {/* Most Requested Services */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-pink-100 rounded-xl">
            <Award className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Tus Servicios Más Solicitados
            </h3>
            <p className="text-sm text-gray-600">Top 5 del período</p>
          </div>
        </div>

        {stats.most_requested_services.length > 0 ? (
          <div className="space-y-4">
            {stats.most_requested_services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                    'bg-gradient-to-br from-pink-400 to-purple-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.count} veces realizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-pink-600">{service.count}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay datos de servicios en este período</p>
          </div>
        )}
      </div>

      {/* Busiest Hours */}
      <div className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Tus Horarios Más Activos
            </h3>
            <p className="text-sm text-gray-600">Horas con más citas</p>
          </div>
        </div>

        {stats.busiest_hours.length > 0 ? (
          <div className="space-y-3">
            {stats.busiest_hours.map((hour, index) => {
              const maxCount = Math.max(...stats.busiest_hours.map(h => h.count))
              const percentage = (hour.count / maxCount) * 100

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 w-32">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="font-bold text-neutral-900">{hour.hour}</p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="relative w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-lg font-bold text-blue-600">{hour.count}</span>
                    <span className="text-sm text-gray-600 ml-1">citas</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay datos de horarios en este período</p>
          </div>
        )}
      </div>

      {/* Motivational Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h3 className="text-2xl font-bold">¡Sigue Brillando!</h3>
          </div>

          <p className="text-white/90 text-lg mb-4">
            {stats.completion_rate >= 90
              ? '¡Increíble! Eres un técnico excepcional. Tus clientes adoran tu trabajo.'
              : stats.completion_rate >= 80
              ? '¡Excelente trabajo! Mantienes un desempeño sobresaliente.'
              : stats.completion_rate >= 70
              ? 'Vas muy bien. Sigue así y alcanzarás la excelencia.'
              : stats.completion_rate >= 60
              ? 'Buen trabajo. Con un poco más de esfuerzo llegarás más lejos.'
              : 'Cada día es una oportunidad para mejorar. ¡Tú puedes!'}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/80 text-xs">Total citas</p>
              <p className="text-2xl font-bold">{stats.total_appointments}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/80 text-xs">Tasa de éxito</p>
              <p className="text-2xl font-bold">{stats.completion_rate}%</p>
            </div>
            {stats.most_requested_services[0] && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-white/80 text-xs">Top servicio</p>
                <p className="text-sm font-bold truncate max-w-[150px]">
                  {stats.most_requested_services[0].name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
