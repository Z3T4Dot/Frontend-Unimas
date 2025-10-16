import { useState, useEffect } from 'react'
import { appointmentsAPI, usersAPI, servicesAPI } from '../../lib/api'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

export default function Statistics() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalTechnicians: 0,
    totalClients: 0,
    totalServices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const [appointmentsRes, usersRes, servicesRes] = await Promise.all([
        appointmentsAPI.getAll(),
        usersAPI.getAll(),
        servicesAPI.getAll(),
      ])

      const appointments = appointmentsRes.data || []
      const users = usersRes.data || []
      const services = servicesRes.data || []

      setStats({
        totalAppointments: appointments.length,
        scheduledAppointments: appointments.filter((a: any) => a.status === 'SCHEDULED')
          .length,
        completedAppointments: appointments.filter((a: any) => a.status === 'COMPLETED')
          .length,
        cancelledAppointments: appointments.filter((a: any) => a.status === 'CANCELLED')
          .length,
        totalRevenue: appointments
          .filter((a: any) => a.status === 'COMPLETED')
          .reduce((sum: number, a: any) => sum + a.total_amount, 0),
        totalUsers: users.length,
        totalTechnicians: users.filter((u: any) => u.role === 'TECHNICIAN').length,
        totalClients: users.filter((u: any) => u.role === 'CLIENT').length,
        totalServices: services.length,
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Citas',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'primary',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600',
    },
    {
      title: 'Citas Agendadas',
      value: stats.scheduledAppointments,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Citas Completadas',
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Citas Canceladas',
      value: stats.cancelledAppointments,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'secondary',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-600',
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Técnicos',
      value: stats.totalTechnicians,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'pink',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
    },
    {
      title: 'Servicios Activos',
      value: stats.totalServices,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Estadísticas Generales
        </h2>
        <button
          onClick={loadStatistics}
          className="btn btn-outline"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="card p-6 hover:shadow-xl transition-shadow animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tasa de Conversión
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completadas</span>
                <span className="font-medium text-green-600">
                  {stats.totalAppointments > 0
                    ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(
                        1
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalAppointments > 0
                        ? (stats.completedAppointments / stats.totalAppointments) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Canceladas</span>
                <span className="font-medium text-red-600">
                  {stats.totalAppointments > 0
                    ? ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(
                        1
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalAppointments > 0
                        ? (stats.cancelledAppointments / stats.totalAppointments) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Promedio por Cita
          </h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary-600">
              $
              {stats.completedAppointments > 0
                ? (stats.totalRevenue / stats.completedAppointments).toFixed(2)
                : '0.00'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Valor promedio por cita completada</p>
          </div>
        </div>
      </div>
    </div>
  )
}
