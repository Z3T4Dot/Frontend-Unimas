import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { getToken, getUser, setUser, homeByRole } from "../lib/auth";

export default function RequireAuth({ roles }: { roles?: string[] }) {
  const token = getToken();
  const [me, setMe] = useState(getUser());
  const [loading, setLoading] = useState(!me && !!token);
  const loc = useLocation();

  useEffect(() => {
    if (!token || me) return;
    (async () => {
      try {
        const r = await api.get("/auth/me");
        setUser(r.data.user);
        setMe(r.data.user);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, me]);

  if (!token)
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (loading) return null;

  if (
    roles &&
    me &&
    !roles.includes((me.role || "").toString().toLowerCase())
  ) {
    return <Navigate to={homeByRole(me.role)} replace />;
  }
  return <Outlet />;
}
