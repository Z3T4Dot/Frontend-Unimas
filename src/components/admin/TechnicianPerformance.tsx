import { useState, useEffect } from 'react'
import apiClient from '../../api/apiClient'
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

interface TechnicianStat {
  technician_id: string
  technician_name: string
  total_appointments: number
  completed_appointments: number
  cancelled_appointments: number
  scheduled_appointments: number
  total_earnings: number
  avg_per_appointment: number
  completion_rate: number
  top_service: string
  services_provided: Record<string, number>
}

interface AllTechniciansStats {
  period: string
  start_date: string
  end_date: string
  technicians: TechnicianStat[]
  total_technicians: number
  total_earnings_all: number
  total_appointments_all: number
}

export default function TechnicianPerformance() {
  const [stats, setStats] = useState<AllTechniciansStats | null>(null)
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedTech, setExpandedTech] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'earnings' | 'appointments' | 'rate'>('earnings')

  useEffect(() => {
    loadStatistics()
  }, [period])

  const loadStatistics = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await apiClient.get(
        `/appointments/statistics-all/technicians?period=${period}`
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getSortedTechnicians = () => {
    const sorted = [...stats.technicians]
    switch (sortBy) {
      case 'earnings':
        return sorted.sort((a, b) => b.total_earnings - a.total_earnings)
      case 'appointments':
        return sorted.sort((a, b) => b.total_appointments - a.total_appointments)
      case 'rate':
        return sorted.sort((a, b) => b.completion_rate - a.completion_rate)
      default:
        return sorted
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">
          Rendimiento por Técnico
        </h2>
        <div className="flex items-center space-x-2">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === opt.value
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Total Técnicos</h3>
          </div>
          <p className="text-4xl font-bold">{stats.total_technicians}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Ganancias Totales</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.total_earnings_all)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Citas Totales</h3>
          </div>
          <p className="text-4xl font-bold">{stats.total_appointments_all}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-md">
        <span className="text-sm font-medium text-gray-600">Ordenar por:</span>
        <button
          onClick={() => setSortBy('earnings')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'earnings'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Ganancias
        </button>
        <button
          onClick={() => setSortBy('appointments')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'appointments'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Citas
        </button>
        <button
          onClick={() => setSortBy('rate')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            sortBy === 'rate'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tasa de Completación
        </button>
      </div>

      {/* Technicians List */}
      <div className="space-y-4">
        {getSortedTechnicians().map((tech, index) => (
          <div
            key={tech.technician_id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Ranking Badge */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-600'
                        : index === 1
                        ? 'bg-gray-100 text-gray-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {tech.technician_name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Servicio principal: {tech.top_service}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedTech(
                      expandedTech === tech.technician_id ? null : tech.technician_id
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {expandedTech === tech.technician_id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ganancias</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(tech.total_earnings)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Promedio: {formatCurrency(tech.avg_per_appointment)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Citas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tech.total_appointments}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Completadas: {tech.completed_appointments}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Tasa de Éxito</p>
                  <div className="flex items-end space-x-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {tech.completion_rate}%
                    </p>
                    <TrendingUp className="w-5 h-5 text-blue-600 mb-1" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Canceladas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {tech.cancelled_appointments}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pendientes: {tech.scheduled_appointments}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTech === tech.technician_id && (
                <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Servicios Proporcionados:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(tech.services_provided).map(([service, count]) => (
                      <div
                        key={service}
                        className="bg-purple-50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{service}</span>
                        <span className="text-sm font-bold text-purple-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance Bar */}
            <div className="h-2 bg-gray-100">
              <div
                className={`h-full transition-all duration-500 ${
                  tech.completion_rate >= 80
                    ? 'bg-green-500'
                    : tech.completion_rate >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${tech.completion_rate}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performer Badge */}
      {stats.technicians.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Técnico Destacado del Período</h3>
          </div>
          <p className="text-2xl font-bold">{getSortedTechnicians()[0].technician_name}</p>
          <p className="text-white/90 mt-1">
            Con {formatCurrency(getSortedTechnicians()[0].total_earnings)} en ganancias y{' '}
            {getSortedTechnicians()[0].total_appointments} citas completadas.
          </p>
        </div>
      )}
    </div>
  )
}
