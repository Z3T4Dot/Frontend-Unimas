import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getToken, getUser, setUser, homeByRole } from "../lib/auth";

export default function RoleRedirect() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      const token = getToken();

      // Sin token → al login
      if (!token) {
        nav("/login", { replace: true, state: { from: loc.pathname } });
        return;
      }

      // Con token: intentamos tener al usuario en memoria
      let u = getUser();
      if (!u) {
        try {
          const r = await api.get("/auth/me"); // requiere Bearer (el interceptor debe ponerlo)
          const raw = r.data?.user;
          if (raw) {
            u = {
              id: String(raw.id || raw.user?.id || ""),
              email: String(raw.email || ""),
              name: raw.name ?? raw.display_name ?? "",
              role: String(raw.role ?? ""),
            };
            setUser(u);
          }
        } catch {
          // Si falla, volvemos al login
          nav("/login", { replace: true, state: { from: loc.pathname } });
          return;
        }
      }

      // Redirección final por rol
      nav(homeByRole(u?.role), { replace: true });
    })();
  }, [nav, loc.pathname]);

  return null; // pantalla en blanco unos ms
}
