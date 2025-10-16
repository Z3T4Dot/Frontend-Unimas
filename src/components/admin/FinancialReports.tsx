import { useState, useEffect, useMemo } from 'react'
import { appointmentsAPI, usersAPI, servicesAPI } from '../../lib/api'
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  FileText,
  Sparkles,
  Award,
  Filter,
  ChevronDown,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, parseISO, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ReportType = 'technician' | 'service' | 'monthly' | 'daily'
type Period = 'week' | 'month' | 'quarter' | 'year'

export default function FinancialReports() {
  const [reportType, setReportType] = useState<ReportType>('technician')
  const [period, setPeriod] = useState<Period>('month')
  const [customStartDate, setCustomStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [customEndDate, setCustomEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [useCustomDates, setUseCustomDates] = useState(false)

  const [appointments, setAppointments] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [appointmentsRes, techniciansRes, servicesRes] = await Promise.all([
        appointmentsAPI.getAll(),
        usersAPI.getTechnicians(),
        servicesAPI.getAll(),
      ])

      setAppointments(appointmentsRes.data || [])
      setTechnicians(techniciansRes.data || [])
      setServices(servicesRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments by date range
  const filteredAppointments = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date

    if (useCustomDates) {
      start = parseISO(customStartDate)
      end = parseISO(customEndDate)
    } else {
      switch (period) {
        case 'week':
          start = startOfWeek(now, { locale: es })
          end = endOfWeek(now, { locale: es })
          break
        case 'month':
          start = startOfMonth(now)
          end = endOfMonth(now)
          break
        case 'quarter':
          start = startOfMonth(subMonths(now, 2))
          end = endOfMonth(now)
          break
        case 'year':
          start = new Date(now.getFullYear(), 0, 1)
          end = new Date(now.getFullYear(), 11, 31)
          break
        default:
          start = startOfMonth(now)
          end = endOfMonth(now)
      }
    }

    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.date)
      return isWithinInterval(aptDate, { start, end }) && apt.status === 'COMPLETED'
    })
  }, [appointments, period, useCustomDates, customStartDate, customEndDate])

  // Technician Report Data
  const technicianReport = useMemo(() => {
    const techData: { [key: string]: { name: string; appointments: number; revenue: number; avgTicket: number } } = {}

    filteredAppointments.forEach((apt) => {
      if (!techData[apt.technician_id]) {
        techData[apt.technician_id] = {
          name: apt.technician_name,
          appointments: 0,
          revenue: 0,
          avgTicket: 0,
        }
      }
      techData[apt.technician_id].appointments++
      techData[apt.technician_id].revenue += apt.total_amount || 0
    })

    // Calculate average ticket
    Object.values(techData).forEach((tech) => {
      tech.avgTicket = tech.appointments > 0 ? tech.revenue / tech.appointments : 0
    })

    return Object.values(techData).sort((a, b) => b.revenue - a.revenue)
  }, [filteredAppointments])

  // Service Report Data
  const serviceReport = useMemo(() => {
    const serviceData: { [key: string]: { name: string; count: number; revenue: number; avgPrice: number } } = {}

    filteredAppointments.forEach((apt) => {
      apt.services?.forEach((service: any) => {
        if (!serviceData[service.id]) {
          serviceData[service.id] = {
            name: service.name,
            count: 0,
            revenue: 0,
            avgPrice: 0,
          }
        }
        serviceData[service.id].count++
        serviceData[service.id].revenue += service.price_at_booking || 0
      })
    })

    // Calculate average price
    Object.values(serviceData).forEach((service) => {
      service.avgPrice = service.count > 0 ? service.revenue / service.count : 0
    })

    return Object.values(serviceData).sort((a, b) => b.revenue - a.revenue)
  }, [filteredAppointments])

  // Monthly Comparison Data (last 6 months)
  const monthlyComparison = useMemo(() => {
    const data = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)

      const monthAppointments = appointments.filter((apt) => {
        const aptDate = parseISO(apt.date)
        return isWithinInterval(aptDate, { start, end }) && apt.status === 'COMPLETED'
      })

      const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)

      data.push({
        month: format(monthDate, 'MMM', { locale: es }),
        ingresos: revenue,
        citas: monthAppointments.length,
      })
    }

    return data
  }, [appointments])

  // Daily Revenue (last 30 days)
  const dailyRevenue = useMemo(() => {
    const data: { [key: string]: number } = {}
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      data[dateStr] = 0
    }

    appointments.forEach((apt) => {
      if (apt.status === 'COMPLETED' && data[apt.date] !== undefined) {
        data[apt.date] += apt.total_amount || 0
      }
    })

    return Object.entries(data).map(([date, revenue]) => ({
      fecha: format(parseISO(date), 'd MMM', { locale: es }),
      ingresos: revenue,
    }))
  }, [appointments])

  // Summary Stats
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)
    const totalAppointments = filteredAppointments.length
    const avgTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0

    return {
      totalRevenue,
      totalAppointments,
      avgTicket,
    }
  }, [filteredAppointments])

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''

    switch (reportType) {
      case 'technician':
        csvContent = 'Técnico,Citas,Ingresos,Ticket Promedio\n'
        technicianReport.forEach((tech) => {
          csvContent += `"${tech.name}",${tech.appointments},$${tech.revenue.toFixed(2)},$${tech.avgTicket.toFixed(2)}\n`
        })
        filename = 'reporte_tecnicos.csv'
        break

      case 'service':
        csvContent = 'Servicio,Cantidad,Ingresos,Precio Promedio\n'
        serviceReport.forEach((service) => {
          csvContent += `"${service.name}",${service.count},$${service.revenue.toFixed(2)},$${service.avgPrice.toFixed(2)}\n`
        })
        filename = 'reporte_servicios.csv'
        break

      case 'monthly':
        csvContent = 'Mes,Ingresos,Citas\n'
        monthlyComparison.forEach((month) => {
          csvContent += `${month.month},$${month.ingresos.toFixed(2)},${month.citas}\n`
        })
        filename = 'reporte_mensual.csv'
        break

      case 'daily':
        csvContent = 'Fecha,Ingresos\n'
        dailyRevenue.forEach((day) => {
          csvContent += `${day.fecha},$${day.ingresos.toFixed(2)}\n`
        })
        filename = 'reporte_diario.csv'
        break
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Reportes Financieros</h2>
          <p className="text-neutral-600 mt-1">Análisis detallado de ingresos y rendimiento</p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="technician">Por Técnico</option>
              <option value="service">Por Servicio</option>
              <option value="monthly">Comparación Mensual</option>
              <option value="daily">Ingresos Diarios</option>
            </select>
          </div>

          {/* Period */}
          {!useCustomDates && (
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Período</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="quarter">Últimos 3 Meses</option>
                <option value="year">Este Año</option>
              </select>
            </div>
          )}
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useCustomDates}
            onChange={(e) => setUseCustomDates(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900"
          />
          <label className="text-sm font-medium text-neutral-700">Usar rango de fechas personalizado</label>
        </div>

        {useCustomDates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm font-medium opacity-90">Ingresos Totales</span>
          </div>
          <p className="text-4xl font-bold">${summaryStats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-8 h-8 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Citas Completadas</span>
          </div>
          <p className="text-4xl font-bold text-neutral-900">{summaryStats.totalAppointments}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-8 h-8 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-600">Ticket Promedio</span>
          </div>
          <p className="text-4xl font-bold text-neutral-900">${summaryStats.avgTicket.toFixed(2)}</p>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'technician' && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Rendimiento por Técnico</h3>
          </div>

          <div className="space-y-3">
            {technicianReport.length === 0 ? (
              <p className="text-center text-neutral-500 py-12">No hay datos para mostrar</p>
            ) : (
              <>
                {/* Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={technicianReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: any) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="revenue" fill="#10b981" name="Ingresos" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 rounded-tl-lg">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Técnico</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Citas</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Ingresos</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900 rounded-tr-lg">Ticket Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {technicianReport.map((tech, index) => (
                        <tr key={index} className="border-t border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-neutral-900">{tech.name}</td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-right">{tech.appointments}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                            ${tech.revenue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-right">${tech.avgTicket.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {reportType === 'service' && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Rendimiento por Servicio</h3>
          </div>

          <div className="space-y-3">
            {serviceReport.length === 0 ? (
              <p className="text-center text-neutral-500 py-12">No hay datos para mostrar</p>
            ) : (
              <>
                {/* Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceReport.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: any) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 rounded-tl-lg">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Servicio</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Cantidad</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Ingresos</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900 rounded-tr-lg">Precio Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceReport.map((service, index) => (
                        <tr key={index} className="border-t border-neutral-100 hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-neutral-900">{service.name}</td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-right">{service.count}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">
                            ${service.revenue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-900 text-right">${service.avgPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {reportType === 'monthly' && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Comparación Mensual (Últimos 6 Meses)</h3>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} name="Ingresos ($)" />
              <Line type="monotone" dataKey="citas" stroke="#3b82f6" strokeWidth={3} name="Citas (#)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportType === 'daily' && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-6 h-6 text-neutral-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Ingresos Diarios (Últimos 30 Días)</h3>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha" stroke="#6b7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ingresos']}
              />
              <Bar dataKey="ingresos" fill="#8b5cf6" name="Ingresos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
