import { useState, useEffect, useMemo } from 'react'
import { appointmentsAPI, usersAPI, servicesAPI } from '../../lib/api'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Award,
  ArrowUp,
  ArrowDown,
  Filter,
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DateFilter = 'today' | 'week' | 'month' | 'all'

export default function EnhancedStatistics() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [appointments, setAppointments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [appointmentsRes, usersRes, servicesRes] = await Promise.all([
        appointmentsAPI.getAll(),
        usersAPI.getAll(),
        servicesAPI.getAll(),
      ])

      setAppointments(appointmentsRes.data || [])
      setUsers(usersRes.data || [])
      setServices(servicesRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments by date
  const filteredAppointments = useMemo(() => {
    const now = new Date()

    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.date)

      switch (dateFilter) {
        case 'today':
          return format(aptDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
        case 'week':
          return isWithinInterval(aptDate, {
            start: startOfWeek(now, { locale: es }),
            end: endOfWeek(now, { locale: es })
          })
        case 'month':
          return isWithinInterval(aptDate, {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        case 'all':
        default:
          return true
      }
    })
  }, [appointments, dateFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const completed = filteredAppointments.filter((a) => a.status === 'COMPLETED')
    const scheduled = filteredAppointments.filter((a) => a.status === 'SCHEDULED')
    const cancelled = filteredAppointments.filter((a) => a.status === 'CANCELLED')
    const revenue = completed.reduce((sum, a) => sum + (a.total_amount || 0), 0)

    return {
      totalAppointments: filteredAppointments.length,
      scheduledAppointments: scheduled.length,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      totalRevenue: revenue,
      averagePerAppointment: completed.length > 0 ? revenue / completed.length : 0,
      completionRate: filteredAppointments.length > 0 ? (completed.length / filteredAppointments.length) * 100 : 0,
      cancellationRate: filteredAppointments.length > 0 ? (cancelled.length / filteredAppointments.length) * 100 : 0,
    }
  }, [filteredAppointments])

  // Previous period comparison
  const previousPeriodStats = useMemo(() => {
    const now = new Date()
    let previousAppointments: any[] = []

    switch (dateFilter) {
      case 'today':
        previousAppointments = appointments.filter((apt) => {
          const aptDate = parseISO(apt.date)
          return format(aptDate, 'yyyy-MM-dd') === format(subDays(now, 1), 'yyyy-MM-dd')
        })
        break
      case 'week':
        previousAppointments = appointments.filter((apt) => {
          const aptDate = parseISO(apt.date)
          return isWithinInterval(aptDate, {
            start: startOfWeek(subDays(now, 7), { locale: es }),
            end: endOfWeek(subDays(now, 7), { locale: es })
          })
        })
        break
      case 'month':
        previousAppointments = appointments.filter((apt) => {
          const aptDate = parseISO(apt.date)
          const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          return isWithinInterval(aptDate, {
            start: startOfMonth(previousMonth),
            end: endOfMonth(previousMonth)
          })
        })
        break
      default:
        return null
    }

    const completed = previousAppointments.filter((a) => a.status === 'COMPLETED')
    const revenue = completed.reduce((sum, a) => sum + (a.total_amount || 0), 0)

    return {
      totalRevenue: revenue,
      completedAppointments: completed.length,
    }
  }, [appointments, dateFilter])

  // Calculate percentage change
  const calculateChange = (current: number, previous: number | null) => {
    if (previous === null || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const revenueChange = previousPeriodStats ? calculateChange(stats.totalRevenue, previousPeriodStats.totalRevenue) : null
  const appointmentsChange = previousPeriodStats ? calculateChange(stats.completedAppointments, previousPeriodStats.completedAppointments) : null

  // Top services
  const topServices = useMemo(() => {
    const serviceCount: { [key: string]: { name: string; count: number; revenue: number } } = {}

    filteredAppointments.forEach((apt) => {
      apt.services?.forEach((service: any) => {
        if (!serviceCount[service.id]) {
          serviceCount[service.id] = { name: service.name, count: 0, revenue: 0 }
        }
        serviceCount[service.id].count++
        if (apt.status === 'COMPLETED') {
          serviceCount[service.id].revenue += service.price_at_booking || 0
        }
      })
    })

    return Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredAppointments])

  // Top clients
  const topClients = useMemo(() => {
    const clientData: { [key: string]: { name: string; count: number; spent: number } } = {}

    filteredAppointments.forEach((apt) => {
      if (!clientData[apt.client_id]) {
        clientData[apt.client_id] = { name: apt.client_name, count: 0, spent: 0 }
      }
      clientData[apt.client_id].count++
      if (apt.status === 'COMPLETED') {
        clientData[apt.client_id].spent += apt.total_amount || 0
      }
    })

    return Object.values(clientData)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
  }, [filteredAppointments])

  // Daily revenue chart data (last 7 days)
  const dailyRevenueData = useMemo(() => {
    const data: { date: string; ingresos: number; citas: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayAppointments = appointments.filter((apt) => apt.date === dateStr && apt.status === 'COMPLETED')
      const revenue = dayAppointments.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)

      data.push({
        date: format(date, 'EEE', { locale: es }),
        ingresos: revenue,
        citas: dayAppointments.length,
      })
    }

    return data
  }, [appointments])

  // Status distribution for pie chart
  const statusData = [
    { name: 'Completadas', value: stats.completedAppointments, color: '#10b981' },
    { name: 'Agendadas', value: stats.scheduledAppointments, color: '#3b82f6' },
    { name: 'Canceladas', value: stats.cancelledAppointments, color: '#ef4444' },
  ]

  const filterOptions: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'all', label: 'Todo el Tiempo' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Estadísticas Detalladas</h2>
          <p className="text-neutral-600 mt-1">Análisis completo del negocio</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-600" />
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDateFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateFilter === option.value
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            {revenueChange !== null && (
              <div className={`flex items-center space-x-1 text-sm font-semibold ${
                revenueChange >= 0 ? 'text-white' : 'text-red-200'
              }`}>
                {revenueChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(revenueChange).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-white/80 text-sm mb-1">Ingresos Totales</p>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-white/70 text-xs mt-2">
            Promedio: ${stats.averagePerAppointment.toFixed(2)} por cita
          </p>
        </div>

        {/* Completed Appointments Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            {appointmentsChange !== null && (
              <div className={`flex items-center space-x-1 text-sm font-semibold ${
                appointmentsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {appointmentsChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(appointmentsChange).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-neutral-600 text-sm mb-1">Citas Completadas</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.completedAppointments}</p>
          <p className="text-neutral-500 text-xs mt-2">
            Tasa: {stats.completionRate.toFixed(1)}%
          </p>
        </div>

        {/* Scheduled Appointments Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-neutral-600 text-sm mb-1">Citas Agendadas</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.scheduledAppointments}</p>
          <p className="text-neutral-500 text-xs mt-2">Pendientes de realizar</p>
        </div>

        {/* Cancelled Appointments Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-neutral-600 text-sm mb-1">Citas Canceladas</p>
          <p className="text-3xl font-bold text-neutral-900">{stats.cancelledAppointments}</p>
          <p className="text-neutral-500 text-xs mt-2">
            Tasa: {stats.cancellationRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-neutral-600" />
            <span>Ingresos Últimos 7 Días</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ingresos']}
              />
              <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-neutral-600" />
            <span>Distribución de Citas</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-neutral-600" />
            <span>Top 5 Servicios Más Solicitados</span>
          </h3>
          <div className="space-y-3">
            {topServices.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">No hay datos disponibles</p>
            ) : (
              topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{service.name}</p>
                      <p className="text-xs text-neutral-500">{service.count} veces solicitado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${service.revenue.toFixed(2)}</p>
                    <p className="text-xs text-neutral-500">ingresos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
            <Award className="w-5 h-5 text-neutral-600" />
            <span>Top 5 Clientes Frecuentes</span>
          </h3>
          <div className="space-y-3">
            {topClients.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">No hay datos disponibles</p>
            ) : (
              topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{client.name}</p>
                      <p className="text-xs text-neutral-500">{client.count} citas realizadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${client.spent.toFixed(2)}</p>
                    <p className="text-xs text-neutral-500">gastado</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8 text-neutral-600" />
            <div>
              <p className="text-sm text-neutral-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-neutral-50 rounded">
              <p className="text-neutral-500">Técnicos</p>
              <p className="font-semibold text-neutral-900">
                {users.filter((u) => u.role === 'TECHNICIAN').length}
              </p>
            </div>
            <div className="p-2 bg-neutral-50 rounded">
              <p className="text-neutral-500">Clientes</p>
              <p className="font-semibold text-neutral-900">
                {users.filter((u) => u.role === 'CLIENT').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Sparkles className="w-8 h-8 text-neutral-600" />
            <div>
              <p className="text-sm text-neutral-600">Servicios Activos</p>
              <p className="text-2xl font-bold text-neutral-900">{services.length}</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">Disponibles para agendar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-8 h-8 text-neutral-600" />
            <div>
              <p className="text-sm text-neutral-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${stats.averagePerAppointment.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-500">Por cita completada</p>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={loadAllData}
          disabled={loading}
          className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold shadow-md hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>
    </div>
  )
}
