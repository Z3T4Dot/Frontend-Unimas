import { useState, useEffect } from 'react'
import { usersAPI, User } from '../../lib/api'
import { Plus, Edit, Trash2, Search, UserPlus, Clock, ChevronDown } from 'lucide-react'
import ManageSchedules from './ManageSchedules'
import ConfirmModal from '../common/ConfirmModal'
import { useAuthStore } from '../../store/authStore'

export default function ManageUsers() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showManageSchedules, setShowManageSchedules] = useState(false)
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null)
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{
    userId: string
    userName: string
    newRole: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'
  } | null>(null)
  const [isChangingRole, setIsChangingRole] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      if (response.success) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return

    try {
      await usersAPI.delete(id)
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar usuario')
    }
  }

  const handleRoleChange = async () => {
    if (!roleChangeConfirm) return

    setIsChangingRole(true)
    try {
      await usersAPI.updateRole(roleChangeConfirm.userId, roleChangeConfirm.newRole)
      await loadUsers()
      setRoleChangeConfirm(null)
      setOpenRoleDropdown(null)
    } catch (error: any) {
      console.error('Error changing role:', error)
      alert(error.response?.data?.message || 'Error al cambiar el rol')
    } finally {
      setIsChangingRole(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleDropdown = (user: User) => {
    const isCurrentUser = user.id === currentUser?.id
    const isOpen = openRoleDropdown === user.id

    const styles = {
      ADMIN: 'bg-red-100 text-red-700 hover:bg-red-200',
      TECHNICIAN: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      CLIENT: 'bg-green-100 text-green-700 hover:bg-green-200',
    }

    const roles: Array<{ value: 'ADMIN' | 'TECHNICIAN' | 'CLIENT'; label: string }> = [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'TECHNICIAN', label: 'Técnico' },
      { value: 'CLIENT', label: 'Cliente' },
    ]

    return (
      <div className="relative">
        <button
          onClick={() => setOpenRoleDropdown(isOpen ? null : user.id)}
          disabled={isCurrentUser}
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 transition-all ${
            styles[user.role as keyof typeof styles]
          } ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isCurrentUser ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
        >
          <span>{user.role}</span>
          {!isCurrentUser && (
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {isOpen && !isCurrentUser && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenRoleDropdown(null)}
            />

            {/* Dropdown menu */}
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-neutral-200 z-20 overflow-hidden min-w-[140px] animate-fadeIn">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    if (role.value !== user.role) {
                      setRoleChangeConfirm({
                        userId: user.id,
                        userName: user.name,
                        newRole: role.value,
                      })
                    }
                    setOpenRoleDropdown(null)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                    role.value === user.role
                      ? 'bg-neutral-100 text-neutral-900 cursor-default'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  disabled={role.value === user.role}
                >
                  {role.label}
                  {role.value === user.role && (
                    <span className="ml-2 text-xs text-neutral-500">(actual)</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Todos los roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TECHNICIAN">Técnico</option>
            <option value="CLIENT">Cliente</option>
          </select>
          <button
            onClick={() => setShowManageSchedules(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold shadow-md transition-all whitespace-nowrap"
          >
            <Clock className="w-5 h-5" />
            <span>Gestionar Horarios</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id.slice(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleDropdown(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600">
              Intenta con otros filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-600">Total Usuarios</p>
          <p className="text-2xl font-bold text-primary-600">{users.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Técnicos</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'TECHNICIAN').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-600">Clientes</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.role === 'CLIENT').length}
          </p>
        </div>
      </div>

      {/* Manage Schedules Modal */}
      {showManageSchedules && (
        <ManageSchedules
          onClose={() => setShowManageSchedules(false)}
          onSuccess={() => {
            setShowManageSchedules(false)
            loadUsers()
          }}
        />
      )}

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        isOpen={roleChangeConfirm !== null}
        title="Cambiar Rol de Usuario"
        message={`¿Estás seguro de cambiar el rol de ${roleChangeConfirm?.userName} a ${roleChangeConfirm?.newRole}?`}
        confirmText="Cambiar Rol"
        cancelText="Cancelar"
        variant="warning"
        isLoading={isChangingRole}
        onConfirm={handleRoleChange}
        onCancel={() => setRoleChangeConfirm(null)}
      />
    </div>
  )
}
