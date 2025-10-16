import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, DollarSign } from 'lucide-react'
import type { Service } from '../../api/types.api'

interface ServicesByCategoryProps {
  services: Service[]
  onServiceSelect?: (service: Service) => void
  selectedServices?: string[]
}

interface CategoryGroup {
  name: string
  services: Service[]
}

export default function ServicesByCategory({
  services,
  onServiceSelect,
  selectedServices = [],
}: ServicesByCategoryProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Agrupar servicios por categoría
  const categorizeServices = (): CategoryGroup[] => {
    const categoryMap = new Map<string, Service[]>()

    services.forEach((service) => {
      // Si no tiene categoría, usar "Otros"
      const categoryName = service.category_id || 'general'

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, [])
      }
      categoryMap.get(categoryName)!.push(service)
    })

    // Convertir a array y ordenar
    const categories: CategoryGroup[] = []

    // Mapeo de nombres de categorías (podrías traer esto del backend)
    const categoryNames: Record<string, string> = {
      'general': 'Servicios Generales',
      'manicure': 'Manicure',
      'pedicure': 'Pedicure',
      'depilacion': 'Depilación',
      'pestanas': 'Pestañas y Cejas',
      'facial': 'Tratamientos Faciales',
      'corporal': 'Tratamientos Corporales',
    }

    categoryMap.forEach((services, categoryId) => {
      categories.push({
        name: categoryNames[categoryId] || categoryId,
        services: services.sort((a, b) => a.name.localeCompare(b.name)),
      })
    })

    return categories.sort((a, b) => a.name.localeCompare(b.name))
  }

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const categories = categorizeServices()

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.name)

        return (
          <div
            key={category.name}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-200/60 overflow-hidden transition-all duration-300"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-neutral-50/80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-neutral-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-neutral-900 text-base">
                    {category.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {category.services.length} servicio{category.services.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="text-xs font-medium text-neutral-400">
                {isExpanded ? 'Ocultar' : 'Ver'}
              </div>
            </button>

            {/* Services List */}
            {isExpanded && (
              <div className="border-t border-neutral-200/60 bg-neutral-50/30 p-3 space-y-2 animate-fadeIn">
                {category.services.map((service) => {
                  const isSelected = selectedServices.includes(service.id)

                  return (
                    <button
                      key={service.id}
                      onClick={() => onServiceSelect?.(service)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-md'
                          : 'bg-white hover:bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm mb-1 ${
                            isSelected ? 'text-white' : 'text-neutral-900'
                          }`}>
                            {service.name}
                          </h4>

                          {service.description && (
                            <p className={`text-xs mb-2 line-clamp-2 ${
                              isSelected ? 'text-neutral-300' : 'text-neutral-600'
                            }`}>
                              {service.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`flex items-center space-x-1 text-xs ${
                              isSelected ? 'text-neutral-300' : 'text-neutral-600'
                            }`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{service.duration_minutes} min</span>
                            </div>

                            <div className={`flex items-center space-x-1 text-xs font-semibold ${
                              isSelected ? 'text-white' : 'text-neutral-900'
                            }`}>
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>${service.price.toFixed(2)}</span>
                            </div>

                            {service.requires_consultation && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                Consulta requerida
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-neutral-900 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {categories.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-600 text-sm">
            No hay servicios disponibles en este momento
          </p>
        </div>
      )}
    </div>
  )
}
