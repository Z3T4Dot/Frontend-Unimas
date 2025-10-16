import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/login/Login'
import Register from './pages/login/Register'
import ClientDashboard from './pages/client/Dashboard'
import TechnicianDashboard from './pages/technician/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const { user } = useAuthStore()

  const getDashboardByRole = () => {
    if (!user) return '/login'

    switch (user.role) {
      case 'CLIENT':
        return '/client/dashboard'
      case 'TECHNICIAN':
        return '/technician/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Client routes */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <ClientDashboard />
            </ProtectedRoute>
          } />

          {/* Technician routes */}
          <Route path="/technician/dashboard" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* Redirect root to appropriate dashboard */}
        <Route path="/" element={<Navigate to={getDashboardByRole()} replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to={getDashboardByRole()} replace />} />
      </Routes>
    </Router>
  )
}

export default App
