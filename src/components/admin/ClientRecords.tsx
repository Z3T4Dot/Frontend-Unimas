import { useState, useEffect } from 'react'
import { Search, FileText, Calendar, DollarSign, ChevronDown, ChevronUp, Package, Lightbulb, User, Phone, Mail, TrendingUp } from 'lucide-react'
import { appointmentNotesAPI, ClientRecord, AppointmentNote } from '../../lib/api'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClientRecords() {
  const [records, setRecords] = useState<ClientRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ClientRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadClientRecords()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = records.filter(record =>
        record.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.client_phone?.includes(searchTerm)
      )
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(records)
    }
  }, [searchTerm, records])

  const loadClientRecords = async () => {
    try {
      setLoading(true)
      const response = await appointmentNotesAPI.getAllClientRecords()
      if (response.success) {
        setRecords(response.data)
        setFilteredRecords(response.data)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las fichas de clientes')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Fichas de Clientes</h2>
          <p className="text-neutral-600 mt-1">
            Historial completo de {records.length} clientes
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 rounded-xl">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">
              {searchTerm ? 'No se encontraron clientes' : 'No hay fichas de clientes todavía'}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedClient === record.client_id
            return (
              <div
                key={record.client_id}
                className="border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-all"
              >
                {/* Client Header */}
                <button
                  onClick={() => toggleExpand(record.client_id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {record.client_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="text-left">
                      <h3 className="font-bold text-neutral-900 text-lg">
                        {record.client_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{record.client_email}</span>
                        </span>
                        {record.client_phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{record.client_phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">
                        {record.total_appointments}
                      </p>
                      <p className="text-xs text-neutral-500">Citas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">
                        {record.total_notes}
                      </p>
                      <p className="text-xs text-neutral-500">Fichas</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 bg-neutral-50 p-5 space-y-4 animate-fadeIn">
                    {/* Client Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-neutral-600 mb-1">Primera Visita</p>
                        <p className="font-semibold text-neutral-900">
                          {format(new Date(record.first_visit), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-neutral-600 mb-1">Última Visita</p>
                        <p className="font-semibold text-neutral-900">
                          {format(new Date(record.last_visit), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>

                    {/* Notes Timeline */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3 flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Historial de Observaciones ({record.notes.length})</span>
                      </h4>

                      {record.notes.length === 0 ? (
                        <p className="text-center text-neutral-500 py-8">
                          No hay observaciones registradas
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {record.notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Note Card Component
function NoteCard({ note }: { note: AppointmentNote }) {
  return (
    <div className="bg-white border-2 border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">
              {format(new Date(note.appointment_date), 'EEEE, dd MMM yyyy', { locale: es })}
            </p>
            <p className="text-sm text-neutral-600">
              {note.appointment_start_time} - {note.technician_name}
            </p>
          </div>
        </div>
        {note.total_amount && (
          <div className="flex items-center space-x-1 text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>${note.total_amount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-2 mb-3">
        {note.services.map((service, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full"
          >
            {service}
          </span>
        ))}
      </div>

      {/* Observations */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-neutral-700 mb-1 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Observaciones:</span>
          </p>
          <p className="text-sm text-neutral-600 pl-6">{note.observations}</p>
        </div>

        {note.products_used && (
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-1 flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Productos utilizados:</span>
            </p>
            <p className="text-sm text-neutral-600 pl-6">{note.products_used}</p>
          </div>
        )}

        {note.recommendations && (
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-1 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Recomendaciones:</span>
            </p>
            <p className="text-sm text-neutral-600 pl-6">{note.recommendations}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        <p className="text-xs text-neutral-500">
          Registrado el {format(new Date(note.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
        </p>
      </div>
    </div>
  )
}
