import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Guards y helpers

// Layout con navbar solo para autenticados
import Navbar from "./components/Navbar";

// Páginas
import Login from "./pages/login";
import Book from "./pages/book";
import MyAppointments from "./pages/MyAppointments";
import TechAppointments from "./pages/tech/TechAppointments";
import TechClients from "./pages/tech/TechClients";
import TechClientFiles from "./pages/tech/TechClientFiles";
import RoleRedirect from "./routes/RoleRedirect";
import RequireAuth from "./routes/RequireAuth";
import AdminReports from "./pages/admin/AdminReports";
import AdminServices from "./pages/admin/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminShell from "./pages/admin/AdminShell";

// AppShell: Navbar + contenido
function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Decisor central según rol */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/auth/redirect" element={<RoleRedirect />} />

      {/* Pública */}
      <Route path="/login" element={<Login />} />

      {/* Bloque autenticado con layout (navbar) */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          {/* Cliente (o cualquier autenticado) */}
          <Route path="/book" element={<Book />} />
          <Route path="/me" element={<MyAppointments />} />

          {/* Técnico */}
          <Route element={<RequireAuth roles={["tecnico", "admin"]} />}>
            <Route path="/tech/appointments" element={<TechAppointments />} />
            <Route path="/tech/clients" element={<TechClients />} />
            <Route
              path="/tech/client/:clientId"
              element={<TechClientFiles />}
            />
          </Route>

          {/* Admin */}
          <Route element={<RequireAuth roles={["admin"]} />}>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminReports />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="schedules" element={<AdminSchedules />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/auth/redirect" replace />} />
    </Routes>
  );
}
