import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Sparkles, AlertCircle, Check, ChevronRight, UserPlus, Mail, Phone as PhoneIcon, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import {
  servicesAPI,
  usersAPI,
  appointmentsAPI,
  Service,
  User as UserType,
  TechnicianAvailability,
} from '../../lib/api'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface BookAppointmentProps {
  onClose: () => void
  onSuccess: () => void
}

interface NewClientData {
  name: string
  email: string
  phone: string
}

export default function BookAppointment({ onClose, onSuccess }: BookAppointmentProps) {
  const { user: currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'ADMIN'
  const isTechnician = currentUser?.role === 'TECHNICIAN'
  const [step, setStep] = useState(1)

  // Data states
  const [services, setServices] = useState<Service[]>([])
  const [technicians, setTechnicians] = useState<UserType[]>([])
  const [clients, setClients] = useState<UserType[]>([])

  // Selection states
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<string>('')
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  // Client creation states
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState<NewClientData>({
    name: '',
    email: '',
    phone: '',
  })
  const [clientSearch, setClientSearch] = useState('')
  const [creatingClient, setCreatingClient] = useState(false)

  // Other states
  const [availability, setAvailability] = useState<TechnicianAvailability | null>(null)
  const [usingDefaultSlots, setUsingDefaultSlots] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
    loadClients()
    if (isAdmin) {
      loadTechnicians()
    } else {
      // Auto-select current user as technician
      setSelectedTechnician(currentUser!.id)
    }
  }, [])

  useEffect(() => {
    if (selectedTechnician && selectedDate) {
      loadAvailability()
    }
  }, [selectedTechnician, selectedDate])

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll({ is_active: true })
      if (response.success) {
        setServices(response.data)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadTechnicians = async () => {
    try {
      const response = await usersAPI.getTechnicians()
      if (response.success) {
        setTechnicians(response.data)
      }
    } catch (error) {
      console.error('Error loading technicians:', error)
    }
  }

  const loadClients = async () => {
    try {
      const response = await usersAPI.getClients()
      if (response.success) {
        setClients(response.data)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.phone) {
      setError('Nombre y teléfono son requeridos')
      return
    }

    setCreatingClient(true)
    setError('')

    try {
      // Aquí deberías tener un endpoint para crear cliente
      // Por ahora, simularemos la creación
      const response = await usersAPI.create({
        ...newClientData,
        role: 'CLIENT',
        password: 'temporal123', // Contraseña temporal
      })

      if (response.success) {
        await loadClients() // Recargar clientes
        setSelectedClient(response.data.id)
        setShowNewClientForm(false)
        setNewClientData({ name: '', email: '', phone: '' })
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear cliente')
    } finally {
      setCreatingClient(false)
    }
  }

  const generateDefaultAvailability = (): TechnicianAvailability => {
    const slots = []
    const startHour = 9
    const endHour = 18

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({ start_time: startTime })
      }
    }

    return {
      technician_id: selectedTechnician,
      date: selectedDate,
      available_slots: slots,
    }
  }

  const loadAvailability = async () => {
    try {
      const response = await appointmentsAPI.getTechnicianAvailability(
        selectedTechnician,
        selectedDate
      )
      if (response.success && response.data && response.data.available_slots?.length > 0) {
        setAvailability(response.data)
        setUsingDefaultSlots(false)
      } else {
        setAvailability(generateDefaultAvailability())
        setUsingDefaultSlots(true)
      }
    } catch (error) {
      console.error('Error loading availability, using default slots:', error)
      setAvailability(generateDefaultAvailability())
      setUsingDefaultSlots(true)
    }
  }

  const handleSubmit = async () => {
    if (!selectedServices.length || !selectedTechnician || !selectedClient || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📤 Enviando datos de cita:', {
        client_id: selectedClient,
        technician_id: selectedTechnician,
        date: selectedDate,
        start_time: selectedTime,
        service_ids: selectedServices,
        notes,
      })

      const response = await appointmentsAPI.create({
        client_id: selectedClient,
        technician_id: selectedTechnician,
        date: selectedDate,
        start_time: selectedTime,
        service_ids: selectedServices,
        notes,
      })

      console.log('✅ Respuesta del servidor:', response)

      if (response.success) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('❌ Error al crear cita:', err)
      console.error('Detalles del error:', err.response?.data)

      // Mostrar mensaje de error más detallado
      const errorMessage = err.response?.data?.error ||
                          err.response?.data?.message ||
                          err.message ||
                          'Error al crear la cita'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrice = () => {
    return services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0)
  }

  const getTotalDuration = () => {
    return services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.duration_minutes, 0)
  }

  const getNextDays = (count: number) => {
    const days = []
    for (let i = 0; i < count; i++) {
      days.push(addDays(new Date(), i))
    }
    return days
  }

  // Calculate total steps: Services -> [Technician (admin only)] -> Client -> Date/Time -> Confirm
  const totalSteps = isAdmin ? 5 : 4

  const getStepNumber = (stepName: string) => {
    if (isAdmin) {
      return { services: 1, technician: 2, client: 3, datetime: 4, confirm: 5 }[stepName]
    } else {
      return { services: 1, client: 2, datetime: 3, confirm: 4 }[stepName]
    }
  }

  const getCurrentStepName = () => {
    if (isAdmin) {
      return ['services', 'technician', 'client', 'datetime', 'confirm'][step - 1]
    } else {
      return ['services', 'client', 'datetime', 'confirm'][step - 1]
    }
  }

  const canProceed = () => {
    const currentStepName = getCurrentStepName()
    if (currentStepName === 'services') return selectedServices.length > 0
    if (currentStepName === 'technician') return selectedTechnician !== ''
    if (currentStepName === 'client') return selectedClient !== ''
    if (currentStepName === 'datetime') return selectedDate !== '' && selectedTime !== ''
    return true
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.phone?.includes(clientSearch) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const getSelectedClientData = () => {
    return clients.find(c => c.id === selectedClient)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 text-white p-5 md:p-6 rounded-t-3xl md:rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Agendar Nueva Cita</h2>
              <p className="text-neutral-300 mt-1 text-sm md:text-base">
                Paso {step} de {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="touch-target w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 md:m-6 md:mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Step 1: Select Services */}
          {getCurrentStepName() === 'services' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Selecciona los servicios
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Elige uno o más servicios para la cita
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service.id)
                  return (
                    <button
                      key={service.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedServices(selectedServices.filter((s) => s !== service.id))
                        } else {
                          setSelectedServices([...selectedServices, service.id])
                        }
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 shadow-md'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-neutral-900 flex-1">
                          {service.name}
                        </h4>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900'
                            : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500">{service.duration_minutes} min</span>
                        <span className="font-bold text-neutral-900">${service.price.toFixed(2)}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="bg-neutral-900 text-white rounded-xl p-5 animate-scaleIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-neutral-300 mb-1">Total estimado</p>
                      <p className="text-3xl font-bold">
                        ${getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-300 mb-1">Duración</p>
                      <p className="text-3xl font-bold">
                        {getTotalDuration()} min
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 (Admin only): Select Technician */}
          {getCurrentStepName() === 'technician' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Selecciona un técnico
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Asigna la cita a un técnico disponible
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technicians.map((tech) => {
                  const isSelected = selectedTechnician === tech.id
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTechnician(tech.id)}
                      className={`text-left p-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 shadow-md'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                          isSelected ? 'bg-neutral-900' : 'bg-neutral-400'
                        }`}>
                          {tech.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900">{tech.name}</h4>
                          <p className="text-sm text-neutral-600">{tech.email}</p>
                          {tech.phone && (
                            <p className="text-xs text-neutral-500 mt-1">{tech.phone}</p>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900'
                            : 'border-neutral-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step: Select or Create Client */}
          {getCurrentStepName() === 'client' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-neutral-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      Selecciona el cliente
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Busca o crea un nuevo cliente
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    showNewClientForm
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">{showNewClientForm ? 'Cancelar' : 'Nuevo'}</span>
                </button>
              </div>

              {!showNewClientForm ? (
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre, teléfono o email..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-all"
                    />
                  </div>

                  {/* Client List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {filteredClients.map((client) => {
                      const isSelected = selectedClient === client.id
                      return (
                        <button
                          key={client.id}
                          onClick={() => setSelectedClient(client.id)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-50 shadow-md'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${
                              isSelected ? 'bg-neutral-900' : 'bg-neutral-400'
                            }`}>
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-neutral-900 truncate">
                                {client.name}
                              </h4>
                              {client.phone && (
                                <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                                  <PhoneIcon className="w-3 h-3" />
                                  {client.phone}
                                </p>
                              )}
                              {client.email && (
                                <p className="text-xs text-neutral-500 flex items-center gap-1 truncate mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {client.email}
                                </p>
                              )}
                            </div>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? 'border-neutral-900 bg-neutral-900'
                                : 'border-neutral-300'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {filteredClients.length === 0 && (
                    <div className="text-center py-12 text-neutral-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                      <p>No se encontraron clientes</p>
                      <button
                        onClick={() => setShowNewClientForm(true)}
                        className="mt-3 text-neutral-900 font-semibold hover:underline"
                      >
                        Crear nuevo cliente
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* New Client Form */
                <div className="bg-neutral-50 rounded-2xl p-6 space-y-4">
                  <h4 className="font-semibold text-neutral-900 mb-4">Crear nuevo cliente</h4>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: María García"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 0999999999"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="Ej: maria@example.com"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      className="input w-full"
                    />
                  </div>

                  <button
                    onClick={handleCreateClient}
                    disabled={creatingClient || !newClientData.name || !newClientData.phone}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingClient ? (
                      <div className="loader w-5 h-5 border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Crear y Seleccionar Cliente</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Select Date & Time */}
          {getCurrentStepName() === 'datetime' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Selecciona fecha y hora
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Elige un horario disponible
                  </p>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  Fecha
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {getNextDays(14).map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const isSelected = selectedDate === dateStr
                    const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr
                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr)
                          setSelectedTime('')
                        }}
                        className={`p-3 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'bg-neutral-900 text-white shadow-md'
                            : 'bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-900'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">
                          {format(day, 'EEE', { locale: es })}
                        </div>
                        <div className="text-xl font-bold">{format(day, 'd')}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {format(day, 'MMM', { locale: es })}
                        </div>
                        {isToday && !isSelected && (
                          <div className="mt-1 w-1.5 h-1.5 bg-neutral-400 rounded-full mx-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && availability && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-neutral-900">
                      Horario disponible
                    </label>
                    {usingDefaultSlots && (
                      <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium">
                        Horario estándar: 9 AM - 6 PM
                      </span>
                    )}
                  </div>
                  {availability.available_slots.length === 0 ? (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center">
                      <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                      <p className="text-neutral-600 font-medium">
                        No hay horarios disponibles para esta fecha
                      </p>
                      <p className="text-sm text-neutral-500 mt-2">
                        Intenta seleccionar otro día
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {availability.available_slots.map((slot, idx) => {
                        const isSelected = selectedTime === slot.start_time
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTime(slot.start_time)}
                            className={`p-3 rounded-xl text-center transition-all ${
                              isSelected
                                ? 'bg-neutral-900 text-white shadow-md'
                                : 'bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-900'
                            }`}
                          >
                            <Clock className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                            <div className="text-sm font-semibold">{slot.start_time}</div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step: Confirm */}
          {getCurrentStepName() === 'confirm' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Confirmar cita
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Revisa los detalles antes de confirmar
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6 space-y-5">
                {/* Client */}
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Cliente
                  </p>
                  <div className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-xl">
                    <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold">
                      {getSelectedClientData()?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{getSelectedClientData()?.name}</p>
                      {getSelectedClientData()?.phone && (
                        <p className="text-sm text-neutral-600">{getSelectedClientData()?.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="pt-5 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                    Servicios seleccionados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services
                      .filter((s) => selectedServices.includes(s.id))
                      .map((service) => (
                        <span
                          key={service.id}
                          className="px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl text-sm font-medium"
                        >
                          {service.name}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Technician */}
                {isAdmin && (
                  <div className="pt-5 border-t border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      Técnico asignado
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {technicians.find((t) => t.id === selectedTechnician)?.name}
                    </p>
                  </div>
                )}

                {/* Date and Time */}
                <div className="pt-5 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Fecha y hora
                  </p>
                  <p className="text-lg font-semibold text-neutral-900 capitalize">
                    {format(new Date(selectedDate), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                  </p>
                  <p className="text-neutral-600 mt-1">a las {selectedTime}</p>
                </div>

                {/* Totals */}
                <div className="pt-5 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Duración total
                      </p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {getTotalDuration()} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        Total a pagar
                      </p>
                      <p className="text-3xl font-bold text-neutral-900">
                        ${getTotalPrice().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-neutral-900 mb-3">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="notes"
                  className="input"
                  rows={3}
                  placeholder="Ej: Preferencias de color, alergias, solicitudes especiales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-4 md:p-6 flex justify-between items-center gap-3 pb-safe">
          <button
            onClick={() => {
              if (step === 1) {
                onClose()
              } else {
                setStep(step - 1)
                setError('')
                setShowNewClientForm(false)
              }
            }}
            className="flex-1 md:flex-initial px-6 py-3 bg-white border-2 border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all active:scale-95"
            disabled={loading}
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          <button
            onClick={() => {
              if (step === totalSteps) {
                handleSubmit()
              } else {
                if (!canProceed()) {
                  const currentStepName = getCurrentStepName()
                  if (currentStepName === 'services') {
                    setError('Selecciona al menos un servicio')
                  } else if (currentStepName === 'technician') {
                    setError('Selecciona un técnico')
                  } else if (currentStepName === 'client') {
                    setError('Selecciona un cliente')
                  } else if (currentStepName === 'datetime') {
                    setError('Selecciona fecha y hora')
                  }
                  return
                }
                setError('')
                setStep(step + 1)
              }
            }}
            className="flex-1 md:flex-initial px-6 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !canProceed()}
          >
            {loading ? (
              <div className="loader w-5 h-5 border-2 border-white/30 border-t-white"></div>
            ) : (
              <>
                <span>{step === totalSteps ? 'Confirmar Cita' : 'Siguiente'}</span>
                {step !== totalSteps && <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
