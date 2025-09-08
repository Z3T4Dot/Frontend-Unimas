import { NavLink, Outlet, useLocation } from "react-router-dom";

const pill = (active: boolean) =>
  [
    "px-3 py-2 rounded-xl border text-sm transition-colors",
    active
      ? "bg-black text-white border-black shadow-sm"
      : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
  ].join(" ");

export default function AdminShell() {
  const loc = useLocation();

  // Para que /admin también marque "Reportes" como activo
  const isActive = (to: string, end = true) => {
    const path = loc.pathname.replace(/\/+$/, "");
    const target = to.replace(/\/+$/, "");
    if (!end) return path.startsWith(target);
    return path === target;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Admin</h1>
          <p className="text-sm text-zinc-500">
            Panel de administración y reportes
          </p>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/admin/reports"
            className={() =>
              pill(isActive("/admin") || isActive("/admin/reports"))
            }
          >
            Reportes
          </NavLink>
          <NavLink
            to="/admin/services"
            className={() => pill(isActive("/admin/services", false))}
          >
            Servicios
          </NavLink>
          <NavLink
            to="/admin/users"
            className={() => pill(isActive("/admin/users", false))}
          >
            Usuarios
          </NavLink>
          <NavLink
            to="/admin/schedules"
            className={() => pill(isActive("/admin/schedules", false))}
          >
            Horarios
          </NavLink>
        </nav>
      </header>

      {/* Aquí se renderizan las subrutas: reports/services/users/schedules */}
      <Outlet />
    </div>
  );
}
