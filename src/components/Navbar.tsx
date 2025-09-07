import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuth } from "../lib/auth";
import useAuthUser from "../hooks/useAuthUser";

function cls(active: boolean) {
  return (
    "px-3 py-2 rounded-xl text-sm font-medium transition-colors " +
    (active ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100")
  );
}

export default function Navbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const me = useAuthUser();
  const onLogout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link to={me ? "/book" : "/login"} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-black to-zinc-600 text-white grid place-items-center font-bold">
            U
          </div>
          <span className="font-semibold tracking-tight">Unimas</span>
        </Link>
        <nav className="ml-auto hidden sm:flex items-center gap-2">
          {me ? (
            <>
              <Link
                className={cls(loc.pathname.startsWith("/book"))}
                to="/book"
              >
                Agendar
              </Link>
              <Link className={cls(loc.pathname.startsWith("/me"))} to="/me">
                Mis citas
              </Link>
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-xl text-sm border hover:bg-zinc-50"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              className={cls(loc.pathname.startsWith("/login"))}
              to="/login"
            >
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
