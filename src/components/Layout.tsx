import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar - Minimalist Design */}
      <nav className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-neutral-200/80 sticky top-0 z-50">
        <div className="container-mobile">
          {/* Mobile Header */}
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl md:text-2xl">U</span>
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-neutral-900">
                  Uñimas Spa
                </h1>
                <p className="text-[10px] md:text-xs text-neutral-500 font-medium hidden sm:block">
                  Sistema de Citas
                </p>
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 truncate max-w-[150px]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neutral-600 capitalize">
                    {user?.role === 'CLIENT' ? 'Cliente' : user?.role === 'TECHNICIAN' ? 'Técnico' : 'Admin'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="touch-target px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl shadow-sm hover:shadow-md border border-neutral-200 hover:border-neutral-300 transition-all duration-200 active:scale-95"
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden touch-target w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-neutral-200 active:scale-95 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-neutral-700" />
              ) : (
                <Menu className="w-5 h-5 text-neutral-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-neutral-200 animate-fadeIn">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-xl mb-3">
                <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                  <p className="text-xs text-neutral-600 capitalize">
                    {user?.role === 'CLIENT' ? 'Cliente' : user?.role === 'TECHNICIAN' ? 'Técnico' : 'Admin'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full touch-target px-4 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl shadow-sm border border-neutral-200 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main content - Adjusted for bottom navbar */}
      <main className="container-mobile py-4 md:py-8 pb-safe">
        <Outlet />
      </main>
    </div>
  )
}
