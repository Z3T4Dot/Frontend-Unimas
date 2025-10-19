import { useState, useEffect } from 'react'
import { categoriesAPI, Category } from '../../lib/api'
import { Plus, Edit2, Trash2, Tag, Palette } from 'lucide-react'

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '✨',
    color: '#171717',
  })

  const iconOptions = [
    '✨', '💅', '👣', '🪒', '👁️', '💆', '🌟', '💖', '🎨', '💄',
    '💇', '👸', '🦋', '🌸', '💫', '🌺', '🧴', '✂️', '🎀', '🌹'
  ]
  const colorOptions = [
    '#FF6B9D', // Rosa Pastel
    '#C44569', // Rosa Intenso
    '#FFA07A', // Salmón
    '#FF7979', // Coral
    '#6C5CE7', // Púrpura
    '#A29BFE', // Lavanda
    '#74B9FF', // Azul Cielo
    '#0984E3', // Azul Océano
    '#00B894', // Verde Menta
    '#55EFC4', // Turquesa
    '#FDCB6E', // Amarillo Sol
    '#F39C12', // Naranja
    '#E17055', // Terracota
    '#D63031', // Rojo
    '#FD79A8', // Rosa Chicle
    '#FFEAA7', // Crema
    '#DFE6E9', // Gris Claro
    '#636E72', // Gris Oscuro
    '#2D3436', // Negro Carbón
    '#FFD700', // Dorado
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response.success) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData)
      } else {
        await categoriesAPI.create(formData)
      }
      loadCategories()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error al guardar categoría')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      await categoriesAPI.delete(id)
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar categoría')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '✨',
      color: category.color || '#171717',
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      icon: '✨',
      color: '#171717',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Cargando categorías...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categorías de Servicios</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white border-2 border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: category.color }}
              >
                <span className="filter drop-shadow-sm">{category.icon}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-neutral-600 line-clamp-2">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-xl">
          <Tag className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-600 font-medium">No hay categorías creadas</p>
          <p className="text-sm text-neutral-500 mt-1">
            Crea categorías para organizar tus servicios
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-neutral-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>

            {/* Form Content - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  placeholder="Ej: Manicure"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Descripción de la categoría"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Icono (Elige un emoji)
                </label>
                <div className="border border-neutral-200 rounded-xl p-3 bg-gray-50">
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.icon === icon
                            ? 'border-pink-500 bg-pink-50 scale-110 shadow-md'
                            : 'border-gray-200 hover:border-pink-300 bg-white'
                        }`}
                        title={icon}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Color
                </label>
                <div className="border border-neutral-200 rounded-xl p-3 bg-gray-50">
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                          formData.color === color
                            ? 'border-neutral-900 scale-110 shadow-lg ring-2 ring-neutral-900 ring-offset-2'
                            : 'border-gray-300 hover:border-gray-400 shadow-sm'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      O ingresa un color personalizado:
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="#FF6B9D"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gradient-to-br from-neutral-50 to-gray-100 rounded-xl border-2 border-neutral-200">
                <p className="text-xs font-semibold text-neutral-500 mb-3 flex items-center">
                  <span className="mr-2">✨</span> Vista previa
                </p>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 text-lg">
                      {formData.name || 'Nombre de la categoría'}
                    </p>
                    <p className="text-sm text-neutral-600 mt-1">
                      {formData.description || 'Descripción de la categoría'}
                    </p>
                  </div>
                </div>
              </div>
              </div>

              {/* Actions - Fixed Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold hover:bg-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
