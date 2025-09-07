import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { setAuth } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await api.post("/auth/login", { email, password });
      if (r.data?.ok) {
        setAuth(r.data.access_token, r.data.user);
        nav("/book", { replace: true });
      } else setError("Credenciales inválidas");
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-20 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-black to-zinc-600 opacity-10 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-zinc-800 to-black opacity-10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 px-4 sm:px-6 py-10">
        <div className="hidden md:flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-black text-white grid place-items-center font-bold">
              U
            </div>
            <h1 className="text-2xl font-semibold">Unimas</h1>
          </div>
          <p className="text-zinc-600">
            Agenda tus servicios de forma sencilla.
          </p>
          <ul className="mt-4 text-zinc-600 text-sm list-disc list-inside space-y-1">
            <li>Disponibilidad en tiempo real</li>
            <li>Re-agendar y cancelar</li>
            <li>Interfaz rápida</li>
          </ul>
        </div>

        <div className="md:my-10">
          <div className="rounded-2xl border shadow-sm bg-white/90 backdrop-blur p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Ingresar</h2>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm text-zinc-700">Email</span>
                <input
                  className="mt-1 w-full border rounded-xl p-3"
                  type="email"
                  placeholder="tucorreo@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-zinc-700">Contraseña</span>
                <div className="mt-1 flex items-center gap-2 border rounded-xl p-1">
                  <input
                    className="w-full p-2 outline-none"
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="px-3 py-2 text-xs text-zinc-600 hover:text-black"
                  >
                    {show ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                className="w-full py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>
            <p className="text-xs text-zinc-500 mt-4">
              ¿No tienes cuenta? Contacta al administrador.
            </p>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-4">
            <Link to="/health" className="underline">
              Estado del sistema
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
