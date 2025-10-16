import { useState, useEffect } from 'react'
import { servicesAPI, categoriesAPI, Service, Category } from '../../lib/api'
import { Plus, Edit, Trash2, Search, Tag, UserCog, List } from 'lucide-react'
import AssignServices from './AssignServices'
import ManageCategories from './ManageCategories'
import ServiceFormModal from './ServiceFormModal'

type TabType = 'services' | 'categories'

export default function ManageServices() {
  const [activeTab, setActiveTab] = useState<TabType>('services')
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddService, setShowAddService] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showAssignServices, setShowAssignServices] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesAPI.getAll(),
        categoriesAPI.getAll(),
      ])

      if (servicesRes.success) setServices(servicesRes.data)
      if (categoriesRes.success) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      await servicesAPI.delete(id)
      loadData()
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error al eliminar servicio')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await servicesAPI.update(id, { is_active: !isActive })
      loadData()
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Error al actualizar servicio')
    }
  }

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios y Categorías</h2>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all ${
              activeTab === 'services'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Servicios</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all ${
              activeTab === 'categories'
                ? 'text-neutral-900 border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </button>
        </div>

        {/* Search and Actions (only for services tab) */}
        {activeTab === 'services' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                className="input pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddService(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Servicio</span>
            </button>
            <button
              onClick={() => setShowAssignServices(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold shadow-md transition-all"
            >
              <UserCog className="w-5 h-5" />
              <span>Asignar a Técnicos</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' ? (
        <ManageCategories />
      ) : (
        <>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className={`card p-6 transition-all ${
              service.is_active ? 'hover:shadow-xl' : 'opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {service.category_name}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
              </div>
              <button
                onClick={() => handleToggleActive(service.id, service.is_active)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {service.is_active ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Precio</p>
                <p className="text-xl font-bold text-primary-600">
                  ${service.price.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-gray-600">Duración</p>
                <p className="text-xl font-bold text-secondary-600">
                  {service.duration_minutes} min
                </p>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setEditingService(service)}
                className="flex-1 btn bg-blue-50 text-blue-600 hover:bg-blue-100"
                title="Editar servicio"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex-1 btn bg-red-50 text-red-600 hover:bg-red-100"
                title="Eliminar servicio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="card p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Categories */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors"
              style={{ backgroundColor: `${category.color}10` }}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <h4 className="font-medium text-gray-900">{category.name}</h4>
              <p className="text-xs text-gray-600 mt-1">
                {services.filter((s) => s.category_id === category.id).length}{' '}
                servicios
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Servicios</p>
          <p className="text-2xl font-bold text-primary-600">{services.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Servicios Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {services.filter((s) => s.is_active).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Categorías</p>
          <p className="text-2xl font-bold text-secondary-600">
            {categories.length}
          </p>
        </div>
      </div>

      {/* Assign Services Modal */}
      {showAssignServices && (
        <AssignServices
          onClose={() => setShowAssignServices(false)}
          onSuccess={() => {
            setShowAssignServices(false)
            loadData()
          }}
        />
      )}

      {/* Add/Edit Service Modal */}
      {(showAddService || editingService) && (
        <ServiceFormModal
          service={editingService}
          onClose={() => {
            setShowAddService(false)
            setEditingService(null)
          }}
          onSuccess={() => {
            setShowAddService(false)
            setEditingService(null)
            loadData()
          }}
        />
      )}
      </>
      )}
    </div>
  )
}
